const { createClient } = require('@supabase/supabase-js');

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Get Supabase credentials
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    res.status(500).json({
      error: 'Supabase configuration missing',
      contacts: [],
      total: 0,
      hasMore: false,
    });
    return;
  }

  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Parse query parameters
    const limit = parseInt(req.query?.limit) || 50;
    const offset = parseInt(req.query?.offset) || 0;

    // Query contacts from database
    const { data: contacts, error, count } = await supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('createdate', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      res.status(500).json({
        error: 'Database query failed',
        contacts: [],
        total: 0,
        hasMore: false,
      });
      return;
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

    res.status(200).json({
      contacts: transformedContacts,
      total: count || 0,
      hasMore: (offset + limit) < (count || 0),
    });
  } catch (error) {
    console.error('Function error:', error);
    res.status(500).json({
      error: 'Internal server error',
      contacts: [],
      total: 0,
      hasMore: false,
    });
  }
};