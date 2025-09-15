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

  const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY || process.env.VITE_HUBSPOT_API_KEY;

  if (!HUBSPOT_API_KEY) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        connected: false,
        error: 'HubSpot API key not configured',
        total: 0,
      }),
    };
  }

  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: {
        Authorization: `Bearer ${HUBSPOT_API_KEY}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          connected: true,
          total: data.total || 0,
        }),
      };
    } else {
      const errorText = await response.text();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          connected: false,
          error: errorText,
          total: 0,
        }),
      };
    }
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        connected: false,
        error: error.message,
        total: 0,
      }),
    };
  }
};
