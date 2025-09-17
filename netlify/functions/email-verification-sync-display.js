// netlify/functions/email-verification-sync-display.js

const { createClient } = require('@supabase/supabase-js');
const https = require('https');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight response' })
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only GET method is allowed',
          timestamp: new Date().toISOString(),
          requestId: context.awsRequestId
        }
      })
    };
  }

  try {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};

    // Pagination parameters
    const page = parseInt(queryParams.page) || 1;
    const limit = Math.min(parseInt(queryParams.limit) || 50, 100);
    const offset = (page - 1) * limit;

    // Filter parameters
    const statusFilter = queryParams.status ? queryParams.status.split(',') : null;
    const hasHubSpotMatch = queryParams.hasHubSpotMatch === 'true';

    // Step 1: Fetch Supabase records with email verification status
    console.log('Fetching Supabase records...');
    const supabaseResult = await fetchSupabaseRecords({
      page,
      limit,
      offset,
      statusFilter,
      hasHubSpotMatch
    });

    if (supabaseResult.records.length === 0) {
      // No records to process, return empty result
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            supabaseRecords: [],
            hubspotRecords: [],
            matchedRecords: [],
            unmatchedRecords: {
              supabaseOnly: [],
              hubspotOnly: []
            },
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPreviousPage: false
            },
            metadata: {
              totalSupabaseRecords: 0,
              totalHubSpotRecords: 0,
              matchedCount: 0,
              lastSync: new Date().toISOString()
            }
          }
        })
      };
    }

    // Step 2: Extract HubSpot object IDs
    const hsObjectIds = supabaseResult.records
      .map(record => record.hs_object_id)
      .filter(id => id && id.trim().length > 0);

    console.log(`Found ${hsObjectIds.length} HubSpot object IDs to match`);

    // Step 3: Fetch HubSpot contact data
    console.log('Fetching HubSpot contact data...');
    let hubspotResult;
    try {
      hubspotResult = await fetchHubSpotContacts(hsObjectIds);
    } catch (hubspotError) {
      console.error('HubSpot API error:', hubspotError);

      // Return partial result with Supabase data only
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            supabaseRecords: supabaseResult.records,
            hubspotRecords: [],
            matchedRecords: [],
            unmatchedRecords: {
              supabaseOnly: supabaseResult.records,
              hubspotOnly: []
            },
            pagination: supabaseResult.pagination,
            metadata: {
              totalSupabaseRecords: supabaseResult.total,
              totalHubSpotRecords: 0,
              matchedCount: 0,
              lastSync: new Date().toISOString(),
              hubspotError: process.env.NODE_ENV === 'development' ? hubspotError.message : 'HubSpot API unavailable'
            }
          }
        })
      };
    }

    // Step 4: Match records between Supabase and HubSpot
    console.log('Matching records...');
    const { matchedRecords, unmatchedSupabase, unmatchedHubspot } = matchRecords(
      supabaseResult.records,
      hubspotResult.contacts
    );

    // Step 5: Return combined result
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          supabaseRecords: supabaseResult.records,
          hubspotRecords: hubspotResult.contacts,
          matchedRecords,
          unmatchedRecords: {
            supabaseOnly: unmatchedSupabase,
            hubspotOnly: unmatchedHubspot
          },
          pagination: supabaseResult.pagination,
          metadata: {
            totalSupabaseRecords: supabaseResult.total,
            totalHubSpotRecords: hubspotResult.contacts.length,
            matchedCount: matchedRecords.length,
            lastSync: new Date().toISOString()
          }
        }
      })
    };

  } catch (error) {
    console.error('Unexpected error in email-verification-sync-display:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          timestamp: new Date().toISOString(),
          requestId: context.awsRequestId
        }
      })
    };
  }
};

// Helper function to fetch Supabase records
async function fetchSupabaseRecords({ page, limit, offset, statusFilter, hasHubSpotMatch }) {
  let query = supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .not('email_verification_status', 'is', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply status filter if provided
  if (statusFilter && statusFilter.length > 0) {
    query = query.in('email_verification_status', statusFilter);
  }

  // Apply HubSpot match filter if requested
  if (hasHubSpotMatch) {
    query = query.not('hs_object_id', 'is', null);
  }

  const { data: records, error, count } = await query;

  if (error) {
    throw new Error(`Supabase query failed: ${error.message}`);
  }

  const totalPages = Math.ceil(count / limit);

  return {
    records: records || [],
    total: count,
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
}

// Helper function to fetch HubSpot contacts
async function fetchHubSpotContacts(hsObjectIds) {
  if (!hsObjectIds || hsObjectIds.length === 0) {
    return { contacts: [] };
  }

  const hubspotApiKey = process.env.HUBSPOT_API_KEY;
  if (!hubspotApiKey) {
    throw new Error('HubSpot API key not configured');
  }

  // Process in batches of 10 (HubSpot limit)
  const batchSize = 10;
  const allContacts = [];

  for (let i = 0; i < hsObjectIds.length; i += batchSize) {
    const batch = hsObjectIds.slice(i, i + batchSize);
    const batchContacts = await fetchHubSpotContactsBatch(batch, hubspotApiKey);
    allContacts.push(...batchContacts);

    // Small delay between batches
    if (i + batchSize < hsObjectIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return { contacts: allContacts };
}

// Helper function to fetch HubSpot contacts in batches
async function fetchHubSpotContactsBatch(hsObjectIds, apiKey) {
  const inputs = hsObjectIds.map(id => ({ id }));
  const properties = ['firstname', 'lastname', 'email'];

  const url = 'https://api.hubapi.com/crm/v3/objects/contacts/batch/read';

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            resolve(response.results || []);
          } else if (res.statusCode === 429) {
            reject(new Error('RATE_LIMIT_EXCEEDED'));
          } else {
            reject(new Error(`HubSpot API error: ${res.statusCode}`));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse HubSpot response: ${parseError.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Network error: ${error.message}`));
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(JSON.stringify({
      inputs,
      properties
    }));

    req.end();
  });
}

// Helper function to match records between Supabase and HubSpot
function matchRecords(supabaseRecords, hubspotContacts) {
  const matchedRecords = [];
  const unmatchedSupabase = [];
  const unmatchedHubspot = [...hubspotContacts];

  supabaseRecords.forEach(supabaseRecord => {
    const hubspotMatch = hubspotContacts.find(
      hubspotContact => hubspotContact.id === supabaseRecord.hs_object_id
    );

    if (hubspotMatch) {
      matchedRecords.push({
        supabaseContact: supabaseRecord,
        hubspotContact: hubspotMatch,
        matchConfidence: 'exact',
        matchedAt: new Date().toISOString()
      });

      // Remove from unmatched HubSpot list
      const index = unmatchedHubspot.findIndex(c => c.id === hubspotMatch.id);
      if (index > -1) {
        unmatchedHubspot.splice(index, 1);
      }
    } else {
      unmatchedSupabase.push(supabaseRecord);
    }
  });

  return {
    matchedRecords,
    unmatchedSupabase,
    unmatchedHubspot
  };
}