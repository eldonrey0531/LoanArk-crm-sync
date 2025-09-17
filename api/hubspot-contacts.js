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

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
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
      results: [],
      total: 0,
      error: 'HubSpot authentication not configured',
    });
    return;
  }

  const authToken = accessToken || HUBSPOT_API_KEY;

  try {
    const requestBody = req.body;

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
      res.status(200).json(data);
    } else {
      const errorText = await response.text();
      res.status(200).json({
        results: [],
        total: 0,
        error: errorText,
      });
    }
  } catch (error) {
    res.status(200).json({
      results: [],
      total: 0,
      error: error.message,
    });
  }
}
