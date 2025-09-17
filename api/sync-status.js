// netlify/functions/sync-status.js

// Embedded Email Verification Sync Service for status tracking
class EmailVerificationSyncService {
  async getSyncOperations() {
    // Mock sync operations data
    return [
      {
        id: 'sync_001',
        supabaseContactId: 123,
        hubspotContactId: 'contact_456',
        status: 'completed',
        startedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        completedAt: new Date(Date.now() - 3500000).toISOString(), // 58 minutes ago
        sourceValue: 'verified',
        targetValue: 'verified',
        initiatedBy: 'system',
        retryCount: 0
      },
      {
        id: 'sync_002',
        supabaseContactId: 124,
        hubspotContactId: 'contact_457',
        status: 'in_progress',
        startedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        sourceValue: 'unverified',
        initiatedBy: 'user',
        retryCount: 0
      },
      {
        id: 'sync_003',
        supabaseContactId: 125,
        hubspotContactId: 'contact_458',
        status: 'failed',
        startedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        completedAt: new Date(Date.now() - 7100000).toISOString(), // 1.97 hours ago
        sourceValue: 'pending',
        error: {
          code: 'CONTACT_NOT_FOUND',
          message: 'HubSpot contact not found',
          canRetry: true
        },
        initiatedBy: 'system',
        retryCount: 2
      }
    ];
  }

  async getSyncOperationById(operationId) {
    const operations = await this.getSyncOperations();
    const operation = operations.find(op => op.id === operationId);

    if (!operation) {
      throw new Error('Sync operation not found');
    }

    return operation;
  }
}

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check authorization
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      data: null,
      metadata: {
        requestId: `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
        duration: 0
      }
    });
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      data: null,
      metadata: {
        requestId: `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
        duration: 0
      }
    });
    return;
  }

  try {
    // Extract operationId from path
    const pathParts = req.url ? req.url.split('/') : [];
    const operationId = pathParts[pathParts.length - 1];

    const startTime = Date.now();

    // Initialize sync service
    const syncService = new EmailVerificationSyncService();

    let result;
    if (!operationId || operationId === 'sync-status') {
      // Return all operations
      const operations = await syncService.getSyncOperations();
      result = {
        operations: operations,
        total: operations.length,
        summary: {
          total: operations.length,
          completed: operations.filter(op => op.status === 'completed').length,
          inProgress: operations.filter(op => op.status === 'in_progress').length,
          failed: operations.filter(op => op.status === 'failed').length,
          pending: operations.filter(op => op.status === 'pending').length
        }
      };
    } else {
      // Return specific operation
      try {
        const operation = await syncService.getSyncOperationById(operationId);
        result = { operation };
      } catch (notFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Operation with ID ${operationId} not found`,
          },
          data: null,
          metadata: {
            requestId: `req_${Date.now()}`,
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime
          }
        });
        return;
      }
    }

    const duration = Date.now() - startTime;

    res.status(200).json({
      success: true,
      data: result,
      error: null,
      metadata: {
        requestId: `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
        duration: duration
      }
    });

  } catch (error) {
    console.error('Error in sync-status function:', error);

    res.status(500).json({
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
    });
  }
};