exports.handler = async (event, context) => {
  // Allow CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
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
      statusCode: 401,
      headers,
      body: JSON.stringify({
        error: 'HubSpot authentication required',
        contacts: [],
        total: 0,
        hasMore: false,
      }),
    };
  }

  const authToken = accessToken || HUBSPOT_API_KEY;

  try {
    // Parse query parameters
    const limit = Math.min(parseInt(event.queryStringParameters?.limit) || 50, 100);
    const offset = parseInt(event.queryStringParameters?.offset) || 0;
    const properties = event.queryStringParameters?.properties ||
      'hs_object_id,email,email_verification_status,firstname,lastname,phone,mobilephone,client_type_vip_status,client_type_prospects,address,city,zip,createdate,lastmodifieddate';

    const propertiesArray = properties.split(',').map(p => p.trim());

    // Build HubSpot API URL
    const baseUrl = 'https://api.hubapi.com/crm/v3/objects/contacts';
    const params = new URLSearchParams({
      limit: limit.toString(),
      properties: propertiesArray.join(','),
    });

    if (offset > 0) {
      params.append('after', offset.toString());
    }

    const apiUrl = `${baseUrl}?${params.toString()}`;

    // Fetch from HubSpot API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            error: 'HubSpot authentication failed',
            contacts: [],
            total: 0,
            hasMore: false,
          }),
        };
      }

      if (response.status === 429) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({
            error: 'HubSpot API rate limit exceeded',
            contacts: [],
            total: 0,
            hasMore: false,
          }),
        };
      }

      throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
    }

    const hubspotData = await response.json();

    // Transform HubSpot response to our format
    const contacts = (hubspotData.results || []).map(contact => {
      const properties = contact.properties || {};

      return {
        hs_object_id: contact.id,
        email: properties.email || '',
        email_verification_status: properties.email_verification_status,
        firstname: properties.firstname,
        lastname: properties.lastname,
        phone: properties.phone,
        mobilephone: properties.mobilephone,
        client_type_vip_status: properties.client_type_vip_status,
        client_type_prospects: properties.client_type_prospects,
        address: properties.address,
        city: properties.city,
        zip: properties.zip,
        createdate: properties.createdate,
        lastmodifieddate: properties.lastmodifieddate,
      };
    });

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contacts,
        total: hubspotData.total || contacts.length,
        hasMore: hubspotData.paging?.next ? true : false,
      }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        contacts: [],
        total: 0,
        hasMore: false,
      }),
    };
  }
};