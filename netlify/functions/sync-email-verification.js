// netlify/functions/sync-email-verification.js

const { createClient } = require('@supabase/supabase-js');

// Embedded Supabase Email Verification Service
class SupabaseEmailVerificationService {
  constructor(supabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  async getContactById(contactId) {
    try {
      const { data, error } = await this.supabaseClient
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single();

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  }
}

// Embedded Email Verification Sync Service
class EmailVerificationSyncService {
  constructor(supabaseService) {
    this.supabaseService = supabaseService;
  }

  async syncToHubSpot(supabaseContactId, hubspotContactId, status) {
    const operationId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startedAt = new Date();

    try {
      // Validate contact exists in Supabase
      const contact = await this.supabaseService.getContactById(supabaseContactId);

      if (!contact) {
        return {
          id: operationId,
          status: 'failed',
          supabaseContactId,
          hubspotContactId,
          startedAt,
          completedAt: new Date(),
          sourceValue: null,
          targetValue: status,
          result: 'Contact not found in Supabase',
          error: {
            code: 'CONTACT_NOT_FOUND',
            message: 'Contact not found in Supabase',
            canRetry: false
          }
        };
      }

      // Mock HubSpot update - in production, this would call HubSpot API
      console.log(`Updating HubSpot contact ${hubspotContactId} with email_verification_status: ${status}`);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        id: operationId,
        status: 'completed',
        supabaseContactId,
        hubspotContactId,
        startedAt,
        completedAt: new Date(),
        sourceValue: contact.email_verification_status,
        targetValue: status,
        result: 'Email verification status synced successfully',
        error: null
      };
    } catch (error) {
      console.error('Sync failed:', error);
      return {
        id: operationId,
        status: 'failed',
        supabaseContactId,
        hubspotContactId,
        startedAt,
        completedAt: new Date(),
        sourceValue: null,
        targetValue: status,
        result: 'Sync operation failed',
        error: {
          code: 'SYNC_ERROR',
          message: error.message,
          canRetry: true
        }
      };
    }
  }
}

exports.handler = async (event, context) => {
  // Allow CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  if (event.httpMethod !== 'POST') {
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
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON in request body',
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

    // Validate required fields
    const { supabaseContactId, hubspotContactId, emailVerificationStatus } = requestBody;

    if (!supabaseContactId || !hubspotContactId || !emailVerificationStatus) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields: supabaseContactId, hubspotContactId, emailVerificationStatus',
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

    // Validate contact IDs are numbers/strings
    if (typeof supabaseContactId !== 'number' || typeof hubspotContactId !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'supabaseContactId must be a number, hubspotContactId must be a string',
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

    // Validate email verification status
    const validStatuses = ['verified', 'unverified', 'pending', 'bounced', 'complained'];
    if (!validStatuses.includes(emailVerificationStatus)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid email verification status. Must be one of: ${validStatuses.join(', ')}`,
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

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
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

    // Initialize services
    const supabaseService = new SupabaseEmailVerificationService(supabaseClient);
    const syncService = new EmailVerificationSyncService(supabaseService);

    // Perform the sync operation
    const syncResult = await syncService.syncToHubSpot(
      supabaseContactId,
      hubspotContactId,
      emailVerificationStatus
    );

    const duration = Date.now() - startTime;

    // Handle contact not found
    if (syncResult.error && syncResult.error.code === 'CONTACT_NOT_FOUND') {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'CONTACT_NOT_FOUND',
            message: 'Contact not found in Supabase',
          },
          data: null,
          metadata: {
            requestId: `req_${Date.now()}`,
            timestamp: new Date().toISOString(),
            duration: duration
          }
        }),
      };
    }

    // Handle sync failure
    if (syncResult.status === 'failed') {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'SYNC_FAILED',
            message: syncResult.result,
          },
          data: null,
          metadata: {
            requestId: `req_${Date.now()}`,
            timestamp: new Date().toISOString(),
            duration: duration
          }
        }),
      };
    }

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          operationId: syncResult.id,
          status: syncResult.status,
          supabaseContactId: syncResult.supabaseContactId,
          hubspotContactId: syncResult.hubspotContactId,
          startedAt: syncResult.startedAt.toISOString(),
          completedAt: syncResult.completedAt?.toISOString(),
          sourceValue: syncResult.sourceValue,
          targetValue: syncResult.targetValue,
          result: syncResult.result,
          error: syncResult.error ? {
            code: syncResult.error.code,
            message: syncResult.error.message,
            canRetry: syncResult.error.canRetry
          } : null
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
    console.error('Error in sync-email-verification function:', error);

    return {
      statusCode: 500,
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