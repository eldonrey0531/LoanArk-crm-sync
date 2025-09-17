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
        .select('*')
        .not('email_verification_status', 'is', null)
        .not('hs_object_id', 'is', null);

      // Apply sorting
      if (params.sortBy && params.sortOrder) {
        query = query.order(params.sortBy, { ascending: params.sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

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
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Method Not Allowed. Use GET.',
        },
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
      // Return mock data for development
      const mockData = {
        records: [
          {
            id: 1,
            hs_object_id: 'contact_123',
            email_verification_status: 'verified',
            firstname: 'John',
            lastname: 'Doe',
            email: 'john.doe@example.com',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-20T14:45:00Z'
          },
          {
            id: 2,
            hs_object_id: 'contact_124',
            email_verification_status: 'unverified',
            firstname: 'Jane',
            lastname: 'Smith',
            email: 'jane.smith@example.com',
            created_at: '2024-01-16T09:15:00Z',
            updated_at: '2024-01-19T16:20:00Z'
          }
        ],
        pagination: {
          page: params.page,
          limit: params.limit,
          totalRecords: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      const duration = Date.now() - startTime;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: mockData,
          error: null,
          metadata: {
            requestId: `req_${Date.now()}`,
            timestamp: new Date().toISOString(),
            duration: duration
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
      limit: queryParams.limit ? Math.min(parseInt(queryParams.limit), 100) : 25,
      sortBy: queryParams.sortBy || 'updated_at',
      sortOrder: queryParams.sortOrder || 'desc'
    };

    // Validate parameters
    if (params.page < 1) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Page must be greater than 0',
          },
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
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Limit must be between 1 and 100',
          },
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
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Internal server error',
        },
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