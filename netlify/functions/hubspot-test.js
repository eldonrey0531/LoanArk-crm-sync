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
    // Use the same search endpoint as the contacts function for consistency
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: 10, // Small limit just for testing
        properties: ['hs_object_id'],
      }),
    });

    if (response.ok) {
      const data = await response.json();

      // Calculate total from actual results, not data.total (which may not exist)
      const actualTotal = data.results ? data.results.length : 0;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          connected: true,
          total: actualTotal,
          debug: {
            hasResults: !!data.results,
            resultCount: actualTotal,
            hasTotal: 'total' in data,
            dataTotal: data.total,
          },
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
