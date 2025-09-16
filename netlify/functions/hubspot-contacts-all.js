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
        hasMore: false,
      }),
    };
  }

  try {
    const requestBody = JSON.parse(event.body);
    // Remove maxContacts default limit - fetch all available
    const pageSize = Math.min(requestBody.pageSize || 100, 100); // HubSpot max is 100 per request

    let allContacts = [];
    let after = requestBody.after || undefined;
    let hasMore = true;
    let requestCount = 0;
    const maxRequests = 1000; // Safety limit to prevent infinite loops

    while (hasMore && requestCount < maxRequests) {
      console.log(`📄 Fetching page ${requestCount + 1}, after: ${after}`);

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HubSpot API error on page ${requestCount + 1}:`, errorText);

        // Return what we have so far if we get an error mid-pagination
        if (allContacts.length > 0) {
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

      const data = await response.json();
      allContacts.push(...(data.results || []));
      requestCount++;

      // Check if there are more pages
      hasMore = !!(data.paging && data.paging.next && data.paging.next.after);
      after = hasMore ? data.paging.next.after : undefined;

      console.log(
        `📥 Page ${requestCount}: ${data.results?.length || 0} contacts, total so far: ${
          allContacts.length
        }`
      );

      // Add small delay to respect rate limits
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(
      `✅ Completed fetching all contacts: ${allContacts.length} total in ${requestCount} requests`
    );

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
  } catch (error) {
    console.error('💥 Unexpected error in hubspot-contacts-all:', error);
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
};
