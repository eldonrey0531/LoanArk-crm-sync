export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get OAuth token from Authorization header
  const authHeader = req.headers.authorization || req.headers.Authorization;
  let accessToken = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    accessToken = authHeader.substring(7);
  }

  // Fallback to API key for backward compatibility during transition
  const HUBSPOT_API_KEY =
    process.env.HUBSPOT_API_KEY || process.env.VITE_HUBSPOT_API_KEY;

  if (!accessToken && !HUBSPOT_API_KEY) {
    res.status(200).json({
      connected: false,
      error: 'HubSpot authentication not configured',
      total: 0,
    });
    return;
  }

  const authToken = accessToken || HUBSPOT_API_KEY;

  try {
    // First, get a small sample to test connectivity
    const testResponse = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 1, // Minimal limit for connectivity test
          properties: ['hs_object_id'],
        }),
      }
    );

    if (testResponse.ok) {
      // If connectivity test passes, get total count
      const countResponse = await fetch(
        'https://api.hubapi.com/crm/v3/objects/contacts/search',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            limit: 1,
            properties: ['hs_object_id'],
          }),
        }
      );

      if (countResponse.ok) {
        const countData = await countResponse.json();
        const actualTotal = countData.total || 0;

        res.status(200).json({
          connected: true,
          total: actualTotal,
          debug: {
            hasResults: !!countData.results,
            resultCount: countData.results?.length || 0,
            hasTotal: 'total' in countData,
            dataTotal: countData.total,
          },
        });
        return;
      }
    }

    const errorText = await testResponse.text();
    res.status(200).json({
      connected: false,
      error: errorText,
      total: 0,
    });
  } catch (error) {
    res.status(200).json({
      connected: false,
      error: error.message,
      total: 0,
    });
  }
};
