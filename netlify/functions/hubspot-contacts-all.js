// Helper to validate event and API key
function validateRequest(event, headers) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST')
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY || process.env.VITE_HUBSPOT_API_KEY;
  if (!HUBSPOT_API_KEY)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        results: [],
        total: 0,
        error: 'HubSpot API key not configured',
        hasMore: false,
      }),
    };
  return HUBSPOT_API_KEY;
}
// Helper to fetch all contacts with pagination and error handling
async function getAllHubSpotContacts(HUBSPOT_API_KEY, requestBody, pageSize, headers) {
  let allContacts = [];
  let after = requestBody.after || undefined;
  let hasMore = true;
  let requestCount = 0;
  const maxRequests = 1000;

  while (hasMore && requestCount < maxRequests) {
    console.log(`📄 Fetching page ${requestCount + 1}, after: ${after}`);
    const response = await fetchHubSpotContactsPage(HUBSPOT_API_KEY, requestBody, pageSize, after);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HubSpot API error on page ${requestCount + 1}:`, errorText);
      if (allContacts.length > 0)
        return buildPartialErrorResponse(headers, allContacts, errorText, requestCount);
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
    if (hasMore) await new Promise((resolve) => setTimeout(resolve, 100));
  }
  console.log(
    `✅ Completed fetching all contacts: ${allContacts.length} total in ${requestCount} requests`
  );
  return buildSuccessResponse(headers, allContacts, requestCount, maxRequests);
}
// Helper functions (top-level, only one set)
async function fetchHubSpotContactsPage(HUBSPOT_API_KEY, requestBody, pageSize, after) {
  const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HUBSPOT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      limit: pageSize,
      after: after,
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
  return response;
}

function buildPartialErrorResponse(headers, allContacts, errorText, requestCount) {
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

function buildSuccessResponse(headers, allContacts, requestCount, maxRequests) {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      results: allContacts,
      total: allContacts.length,
      hasMore: requestCount >= maxRequests, // Indicate if we hit the safety limit
      requestCount,
      maxContactsReached: requestCount >= maxRequests,
    }),
  };
}

function buildCatchErrorResponse(headers, error) {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      results: [],
      total: 0,
      error: error.message,
      hasMore: false,
      requestCount: 0,
    }),
  };
}
exports.handler = async (event, context) => {
  // Allow CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  const validationResult = validateRequest(event, headers);
  if (typeof validationResult !== 'string') return validationResult;
  const HUBSPOT_API_KEY = validationResult;

  try {
    const requestBody = JSON.parse(event.body);
    const pageSize = Math.min(requestBody.pageSize || 100, 100);
    return await getAllHubSpotContacts(HUBSPOT_API_KEY, requestBody, pageSize, headers);
  } catch (error) {
    console.error('💥 Unexpected error in hubspot-contacts-all:', error);
    return buildCatchErrorResponse(headers, error);
  }
};
