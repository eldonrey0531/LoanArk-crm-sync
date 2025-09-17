// netlify/functions/email-verification-records.js

const { createClient } = require('@supabase/supabase-js');

// Supabase Email Verification Service - embedded directly in the function
class SupabaseEmailVerificationService {
  constructor(supabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  async getContactsWithEmailVerification(params = {}) {
    try {
      let query = this.supabaseClient
        .from('contacts')
        .select('*', { count: 'exact' })
        .not('email_verification_status', 'is', null)
        .not('hs_object_id', 'is', null);

      // Apply sorting
      const sortBy = params.sortBy || 'updated_at';
      const sortOrder = params.sortOrder || 'desc';
      const ascending = sortOrder === 'asc';

      query = query.order(sortBy, { ascending });

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 50;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      const totalRecords = count || 0;
      const totalPages = Math.ceil(totalRecords / limit);

      return {
        records: data || [],
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }
}

exports.handler = async (event, context) => {
  // Allow CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Check authorization
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Unauthorized',
        data: null,
        metadata: {
          requestId: `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          duration: 0
        }
      }),
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed',
        data: null,
        metadata: {
          requestId: `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          duration: 0
        }
      }),
    };
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Database configuration missing',
          data: null,
          metadata: {
            requestId: `req_${Date.now()}`,
            timestamp: new Date().toISOString(),
            duration: 0
          }
        }),
      };
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Initialize service with client
    const supabaseService = new SupabaseEmailVerificationService(supabaseClient);

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};

    const params = {
      page: queryParams.page ? parseInt(queryParams.page) : 1,
      limit: queryParams.limit ? Math.min(parseInt(queryParams.limit), 100) : 50,
      sortBy: queryParams.sortBy || 'updated_at',
      sortOrder: queryParams.sortOrder || 'desc'
    };

    // Validate parameters
    if (params.page < 1) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Page must be greater than 0',
          data: null,
          metadata: {
            requestId: `req_${Date.now()}`,
            timestamp: new Date().toISOString(),
            duration: 0
          }
        }),
      };
    }

    if (params.limit < 1 || params.limit > 100) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Limit must be between 1 and 100',
          data: null,
          metadata: {
            requestId: `req_${Date.now()}`,
            timestamp: new Date().toISOString(),
            duration: 0
          }
        }),
      };
    }

    const startTime = Date.now();

    // Call the service to get contacts
    const result = await supabaseService.getContactsWithEmailVerification(params);

    const duration = Date.now() - startTime;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result,
        error: null,
        metadata: {
          requestId: `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          duration: duration
        }
      }),
    };

  } catch (error) {
    console.error('Error in email-verification-records function:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        data: null,
        metadata: {
          requestId: `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          duration: 0
        }
      }),
    };
  }
};