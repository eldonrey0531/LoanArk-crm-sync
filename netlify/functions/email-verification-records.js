// netlify/functions/email-verification-records.js

const { createClient } = require('@supabase/supabase-js');
const { SupabaseEmailVerificationService } = require('../../src/services/supabaseEmailVerificationService');

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
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'Supabase configuration not found',
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

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Initialize service
    const supabaseService = new SupabaseEmailVerificationService();
    // Note: In a real implementation, you'd initialize with the client
    // For now, we'll use mock data since we don't have the actual service integration

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

    // Mock data for now - in production, this would call the actual service
    const mockContacts = [
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
      },
      {
        id: 3,
        hs_object_id: 'contact_125',
        email_verification_status: 'pending',
        firstname: 'Bob',
        lastname: 'Johnson',
        email: 'bob.johnson@example.com',
        created_at: '2024-01-17T11:45:00Z',
        updated_at: '2024-01-18T13:30:00Z'
      }
    ];

    // Apply pagination
    const totalRecords = mockContacts.length;
    const totalPages = Math.ceil(totalRecords / params.limit);
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedRecords = mockContacts.slice(startIndex, endIndex);

    const duration = Date.now() - startTime;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          records: paginatedRecords,
          pagination: {
            page: params.page,
            limit: params.limit,
            total: totalRecords,
            totalPages: totalPages,
            hasNext: params.page < totalPages,
            hasPrev: params.page > 1
          }
        },
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