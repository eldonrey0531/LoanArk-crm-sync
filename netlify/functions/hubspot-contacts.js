exports.handler = async (event, context) => {
  // Allow CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY || process.env.VITE_HUBSPOT_API_KEY;

  if (!HUBSPOT_API_KEY) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        results: [],
        total: 0,
        error: 'HubSpot API key not configured',
      }),
    };
  }

  try {
    const requestBody = JSON.parse(event.body);

    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: requestBody.limit || 25,
        after: requestBody.after || undefined, // For pagination
        sorts: requestBody.sorts || [{ propertyName: 'createdate', direction: 'DESCENDING' }],
        properties: requestBody.properties || [
          'hs_object_id',
          'firstname',
          'lastname',
          'email',
          'hs_email_domain',
          'createdate',
        ],
        filterGroups: requestBody.filterGroups || [],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
    } else {
      const errorText = await response.text();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          results: [],
          total: 0,
          error: errorText,
        }),
      };
    }
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        results: [],
        total: 0,
        error: error.message,
      }),
    };
  }
};
