const { createClient } = require('@supabase/supabase-js');

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

  // Get Supabase credentials
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Supabase configuration missing',
        contacts: [],
        total: 0,
        hasMore: false,
      }),
    };
  }

  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Parse query parameters
    const limit = parseInt(event.queryStringParameters?.limit) || 50;
    const offset = parseInt(event.queryStringParameters?.offset) || 0;

    // Query contacts from database
    const { data: contacts, error, count } = await supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('createdate', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Database query failed',
          contacts: [],
          total: 0,
          hasMore: false,
        }),
      };
    }

    // Transform data to match API contract
    const transformedContacts = (contacts || []).map(contact => ({
      hs_object_id: contact.hs_object_id,
      email: contact.email || '',
      email_verification_status: contact.email_verification_status,
      firstname: contact.firstname,
      lastname: contact.lastname,
      phone: contact.phone,
      mobilephone: contact.mobilephone,
      client_type_vip_status: contact.client_type_vip_status,
      client_type_prospects: contact.client_type_prospects,
      address: contact.address,
      city: contact.city,
      zip: contact.zip,
      createdate: contact.createdate || contact.created_at,
      lastmodifieddate: contact.lastmodifieddate || contact.updated_at,
    }));

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contacts: transformedContacts,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0),
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