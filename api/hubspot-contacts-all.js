// Helper to validate request and authentication
function validateRequest(req, res) {
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
      hasMore: false,
    });
    return;
  }

  return accessToken || HUBSPOT_API_KEY;
}

// Helper to fetch all contacts with pagination and error handling
async function getAllHubSpotContacts(authToken, requestBody, pageSize, res) {
  let allContacts = [];
  let after = requestBody.after || undefined;
  let hasMore = true;
  let requestCount = 0;
  const maxRequests = 1000;

  while (hasMore && requestCount < maxRequests) {
    console.log(`📄 Fetching page ${requestCount + 1}, after: ${after}`);
    const response = await fetchHubSpotContactsPage(
      authToken,
      requestBody,
      pageSize,
      after
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ HubSpot API error on page ${requestCount + 1}:`,
        errorText
      );
      if (allContacts.length > 0)
        return buildPartialErrorResponse(
          headers,
          allContacts,
          errorText,
          requestCount
        );
      return buildErrorResponse(headers, errorText, requestCount);
    }
    const data = await response.json();
    allContacts.push(...(data.results || []));
    requestCount++;
    hasMore = !!(data.paging && data.paging.next && data.paging.next.after);
    after = hasMore ? data.paging.next.after : undefined;
    console.log(
      `📥 Page ${requestCount}: ${data.results?.length || 0} contacts, total so far: ${
        allContacts.length
      }`
    );
    if (hasMore) await new Promise(resolve => setTimeout(resolve, 100));
  }
  console.log(
    `✅ Completed fetching all contacts: ${allContacts.length} total in ${requestCount} requests`
  );
  return buildSuccessResponse(res, allContacts, requestCount, maxRequests);
}
// Helper functions (top-level, only one set)
async function fetchHubSpotContactsPage(
  authToken,
  requestBody,
  pageSize,
  after
) {
  const response = await fetch(
    'https://api.hubapi.com/crm/v3/objects/contacts/search',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: pageSize,
        after: after,
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
  return response;
}

function buildPartialErrorResponse(
  headers,
  allContacts,
  errorText,
  requestCount
) {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      results: allContacts,
      total: allContacts.length,
      hasMore: false,
      error: `Partial results - error on page ${requestCount + 1}: ${errorText}`,
      requestCount,
    }),
  };
}

function buildErrorResponse(headers, errorText, requestCount) {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      results: [],
      total: 0,
      error: errorText,
      hasMore: false,
      requestCount,
    }),
  };
}

function buildSuccessResponse(res, allContacts, requestCount, maxRequests) {
  res.status(200).json({
    results: allContacts,
    total: allContacts.length,
    hasMore: requestCount >= maxRequests, // Indicate if we hit the safety limit
    requestCount,
    maxContactsReached: requestCount >= maxRequests,
  });
}

function buildCatchErrorResponse(res, error) {
  res.status(200).json({
    results: [],
    total: 0,
    error: error.message,
    hasMore: false,
    requestCount: 0,
  });
}
export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  const authToken = validateRequest(req, res);
  if (!authToken) return; // Response already sent by validateRequest

  try {
    const requestBody = req.body;
    const pageSize = Math.min(requestBody.pageSize || 100, 100);
    return await getAllHubSpotContacts(
      authToken,
      requestBody,
      pageSize,
      res
    );
  } catch (error) {
    console.error('💥 Unexpected error in hubspot-contacts-all:', error);
    res.status(500).json({
      results: [],
      total: 0,
      error: error.message,
      hasMore: false,
      requestCount: 0,
      maxRequests: 1000
    });
  }
};
