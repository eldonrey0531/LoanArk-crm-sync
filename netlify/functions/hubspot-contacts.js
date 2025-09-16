exports.handler = async (event, context) => {
  // Allow CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

  // Get OAuth token from Authorization header
  const authHeader = event.headers.authorization || event.headers.Authorization;
  let accessToken = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    accessToken = authHeader.substring(7);
  }

  // Fallback to API key for backward compatibility during transition
  const HUBSPOT_API_KEY =
    process.env.HUBSPOT_API_KEY || process.env.VITE_HUBSPOT_API_KEY;

  if (!accessToken && !HUBSPOT_API_KEY) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        results: [],
        total: 0,
        error: 'HubSpot authentication not configured',
      }),
    };
  }

  const authToken = accessToken || HUBSPOT_API_KEY;

  try {
    const requestBody = JSON.parse(event.body);

    const response = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: requestBody.limit || 25,
          after: requestBody.after || undefined, // For pagination
          sorts: requestBody.sorts || [
            { propertyName: 'createdate', direction: 'DESCENDING' },
          ],
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
      }
    );

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
