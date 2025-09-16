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
    // First, get a small sample to test connectivity
    const testResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: 1, // Minimal limit for connectivity test
        properties: ['hs_object_id'],
      }),
    });

    if (testResponse.ok) {
      // If connectivity test passes, get total count
      const countResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 1,
          properties: ['hs_object_id'],
        }),
      });

      if (countResponse.ok) {
        const countData = await countResponse.json();
        const actualTotal = countData.total || 0;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            connected: true,
            total: actualTotal,
            debug: {
              hasResults: !!countData.results,
              resultCount: countData.results?.length || 0,
              hasTotal: 'total' in countData,
              dataTotal: countData.total,
            },
          }),
        };
      }
    }

    const errorText = await testResponse.text();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        connected: false,
        error: errorText,
        total: 0,
      }),
    };
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
