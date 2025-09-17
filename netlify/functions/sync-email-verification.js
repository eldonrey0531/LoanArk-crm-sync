// netlify/functions/sync-email-verification.js

const { createClient } = require('@supabase/supabase-js');
const { SupabaseEmailVerificationService } = require('../../src/services/supabaseEmailVerificationService');
const { EmailVerificationSyncService } = require('../../src/services/emailVerificationSyncService');

exports.handler = async (event, context) => {
  // Allow CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Method Not Allowed. Use POST.',
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
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 200,
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
        statusCode: 200,
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
        statusCode: 200,
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
        statusCode: 200,
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

    // Initialize services (mock for now)
    const syncService = new EmailVerificationSyncService();

    // Perform the sync operation
    const syncResult = await syncService.syncToHubSpot(
      supabaseContactId,
      hubspotContactId,
      emailVerificationStatus
    );

    const duration = Date.now() - startTime;

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