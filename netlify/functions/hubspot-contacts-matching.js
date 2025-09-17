// netlify/functions/hubspot-contacts-matching.js

const https = require('https');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight response' })
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only POST method is allowed',
          timestamp: new Date().toISOString(),
          requestId: context.awsRequestId
        }
      })
    };
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON in request body',
            timestamp: new Date().toISOString(),
            requestId: context.awsRequestId
          }
        })
      };
    }

    const { hsObjectIds, properties = ['firstname', 'lastname', 'email'] } = requestBody;

    // Validate input
    if (!hsObjectIds || !Array.isArray(hsObjectIds) || hsObjectIds.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'hsObjectIds must be a non-empty array',
            timestamp: new Date().toISOString(),
            requestId: context.awsRequestId
          }
        })
      };
    }

    if (hsObjectIds.length > 100) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Maximum 100 HubSpot object IDs allowed per request',
            timestamp: new Date().toISOString(),
            requestId: context.awsRequestId
          }
        })
      };
    }

    // Validate HubSpot API credentials
    const hubspotApiKey = process.env.HUBSPOT_API_KEY;
    if (!hubspotApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'HubSpot API key not configured',
            timestamp: new Date().toISOString(),
            requestId: context.awsRequestId
          }
        })
      };
    }

    // Process HubSpot contacts in batches to respect rate limits
    const batchSize = 10; // HubSpot allows up to 10 objects per batch read
    const contacts = [];
    const matched = [];
    const missing = [];

    for (let i = 0; i < hsObjectIds.length; i += batchSize) {
      const batch = hsObjectIds.slice(i, i + batchSize);

      try {
        const batchContacts = await fetchHubSpotContactsBatch(batch, properties, hubspotApiKey);

        // Process batch results
        batch.forEach(hsObjectId => {
          const contact = batchContacts.find(c => c.id === hsObjectId);
          if (contact) {
            contacts.push(contact);
            matched.push(hsObjectId);
          } else {
            missing.push(hsObjectId);
          }
        });

        // Small delay between batches to respect rate limits
        if (i + batchSize < hsObjectIds.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (batchError) {
        console.error(`Error processing batch ${Math.floor(i / batchSize) + 1}:`, batchError);

        // Add failed batch IDs to missing list
        batch.forEach(hsObjectId => {
          if (!matched.includes(hsObjectId) && !missing.includes(hsObjectId)) {
            missing.push(hsObjectId);
          }
        });
      }
    }

    // Return successful response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          contacts,
          matched,
          missing,
          metadata: {
            totalRequested: hsObjectIds.length,
            totalFound: contacts.length,
            lastUpdated: new Date().toISOString()
          }
        }
      })
    };

  } catch (error) {
    console.error('Unexpected error in hubspot-contacts-matching:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          timestamp: new Date().toISOString(),
          requestId: context.awsRequestId
        }
      })
    };
  }
};

// Helper function to fetch HubSpot contacts in batches
async function fetchHubSpotContactsBatch(hsObjectIds, properties, apiKey) {
  const propertiesParam = properties.join(',');
  const idsParam = hsObjectIds.join(',');

  const url = `https://api.hubapi.com/crm/v3/objects/contacts/batch/read?properties=${propertiesParam}&inputs=${idsParam}`;

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            resolve(response.results || []);
          } else if (res.statusCode === 429) {
            // Rate limit exceeded
            reject(new Error('RATE_LIMIT_EXCEEDED'));
          } else {
            reject(new Error(`HubSpot API error: ${res.statusCode} - ${data}`));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse HubSpot response: ${parseError.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Network error: ${error.message}`));
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}