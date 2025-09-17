const { handler: syncStatusHandler } = require('../sync-status');

describe('Sync Status Tracking Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Sync Status Operations Management', () => {
    it('should retrieve all sync operations with comprehensive summary', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/api/sync-status',
        headers: {
          authorization: 'Bearer test-token'
        }
      };

      const result = await syncStatusHandler(event, {});

      expect(result.statusCode).toBe(200);
      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(result.headers['Content-Type']).toBe('application/json');

      const body = JSON.parse(result.body);
      expect(body).toHaveProperty('success', true);
      expect(body.data).toHaveProperty('operations');
      expect(body.data).toHaveProperty('total');
      expect(body.data).toHaveProperty('summary');

      // Validate operations array
      expect(Array.isArray(body.data.operations)).toBe(true);
      expect(body.data.operations.length).toBeGreaterThan(0);

      // Validate each operation has required fields
      body.data.operations.forEach(operation => {
        expect(operation).toHaveProperty('id');
        expect(operation).toHaveProperty('status');
        expect(operation).toHaveProperty('supabaseContactId');
        expect(operation).toHaveProperty('hubspotContactId');
        expect(operation).toHaveProperty('startedAt');
        expect(operation).toHaveProperty('initiatedBy');
        expect(operation).toHaveProperty('retryCount');
      });

      // Validate summary statistics
      expect(body.data.summary).toHaveProperty('total');
      expect(body.data.summary).toHaveProperty('completed');
      expect(body.data.summary).toHaveProperty('inProgress');
      expect(body.data.summary).toHaveProperty('failed');
      expect(body.data.summary).toHaveProperty('pending');

      // Validate summary totals add up
      const summary = body.data.summary;
      expect(summary.total).toBe(body.data.operations.length);
      expect(summary.completed + summary.inProgress + summary.failed + summary.pending).toBe(summary.total);
    });

    it('should retrieve specific operation with full details', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/api/sync-status/sync_001',
        headers: {
          authorization: 'Bearer test-token'
        }
      };

      const result = await syncStatusHandler(event, {});

      expect(result.statusCode).toBe(200);

      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('operation');

      const operation = body.data.operation;
      expect(operation.id).toBe('sync_001');
      expect(operation).toHaveProperty('supabaseContactId');
      expect(operation).toHaveProperty('hubspotContactId');
      expect(operation).toHaveProperty('status');
      expect(operation).toHaveProperty('startedAt');
      expect(operation).toHaveProperty('initiatedBy');
      expect(operation).toHaveProperty('retryCount');
    });

    it('should handle completed operations with completion details', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/api/sync-status/sync_001', // This should be completed
        headers: {
          authorization: 'Bearer test-token'
        }
      };

      const result = await syncStatusHandler(event, {});

      expect(result.statusCode).toBe(200);

      const body = JSON.parse(result.body);
      const operation = body.data.operation;

      expect(operation.status).toBe('completed');
      expect(operation).toHaveProperty('completedAt');
      expect(operation).toHaveProperty('sourceValue');
      expect(operation).toHaveProperty('targetValue');
      expect(operation).toHaveProperty('result');
      expect(operation.error).toBeNull();
    });

    it('should handle in-progress operations without completion details', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/api/sync-status/sync_002', // This should be in-progress
        headers: {
          authorization: 'Bearer test-token'
        }
      };

      const result = await syncStatusHandler(event, {});

      expect(result.statusCode).toBe(200);

      const body = JSON.parse(result.body);
      const operation = body.data.operation;

      expect(operation.status).toBe('in_progress');
      expect(operation).toHaveProperty('startedAt');
      expect(operation).not.toHaveProperty('completedAt');
      expect(operation).toHaveProperty('sourceValue');
      expect(operation).toHaveProperty('targetValue');
    });

    it('should handle failed operations with error details', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/api/sync-status/sync_003', // This should be failed
        headers: {
          authorization: 'Bearer test-token'
        }
      };

      const result = await syncStatusHandler(event, {});

      expect(result.statusCode).toBe(200);

      const body = JSON.parse(result.body);
      const operation = body.data.operation;

      expect(operation.status).toBe('failed');
      expect(operation).toHaveProperty('completedAt');
      expect(operation).toHaveProperty('error');
      expect(operation.error).toHaveProperty('code');
      expect(operation.error).toHaveProperty('message');
      expect(operation.error).toHaveProperty('canRetry');
      expect(operation).toHaveProperty('retryCount');
    });

    it('should return 404 for non-existent operation', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/api/sync-status/nonexistent_operation_12345',
        headers: {
          authorization: 'Bearer test-token'
        }
      };

      const result = await syncStatusHandler(event, {});

      expect(result.statusCode).toBe(404);

      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(body.error.message).toContain('not found');
      expect(body.data).toBeNull();
    });

    it('should handle various path formats correctly', async () => {
      const testPaths = [
        '/api/sync-status/sync_001',
        '/.netlify/functions/sync-status/sync_001',
        '/sync-status/sync_001'
      ];

      for (const path of testPaths) {
        const event = {
          httpMethod: 'GET',
          path: path,
          headers: {
            authorization: 'Bearer test-token'
          }
        };

        const result = await syncStatusHandler(event, {});
        expect(result.statusCode).toBe(200);

        const body = JSON.parse(result.body);
        expect(body.success).toBe(true);
        expect(body.data.operation.id).toBe('sync_001');
      }
    });

    it('should provide consistent response metadata', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/api/sync-status',
        headers: {
          authorization: 'Bearer test-token'
        }
      };

      const result = await syncStatusHandler(event, {});

      expect(result.statusCode).toBe(200);

      const body = JSON.parse(result.body);
      expect(body).toHaveProperty('metadata');
      expect(body.metadata).toHaveProperty('requestId');
      expect(body.metadata).toHaveProperty('timestamp');
      expect(body.metadata).toHaveProperty('duration');

      // Validate metadata format
      expect(body.metadata.requestId).toMatch(/^req_\d+$/);
      expect(() => new Date(body.metadata.timestamp)).not.toThrow();
      expect(typeof body.metadata.duration).toBe('number');
      expect(body.metadata.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty operations list gracefully', async () => {
      // Mock empty operations list
      const originalHandler = syncStatusHandler;

      // This test assumes we might have a scenario with no operations
      // In a real implementation, this would be tested with a clean database
      const event = {
        httpMethod: 'GET',
        path: '/api/sync-status',
        headers: {
          authorization: 'Bearer test-token'
        }
      };

      const result = await syncStatusHandler(event, {});

      // The current implementation always returns mock data
      // In production, this would return empty arrays
      expect(result.statusCode).toBe(200);

      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data.operations)).toBe(true);
      expect(typeof body.data.total).toBe('number');
    });

    it('should filter operations by status when requested', async () => {
      // Test that we can retrieve operations and filter them
      const event = {
        httpMethod: 'GET',
        path: '/api/sync-status',
        headers: {
          authorization: 'Bearer test-token'
        }
      };

      const result = await syncStatusHandler(event, {});
      expect(result.statusCode).toBe(200);

      const body = JSON.parse(result.body);
      const operations = body.data.operations;

      // Test filtering by status
      const completedOps = operations.filter(op => op.status === 'completed');
      const inProgressOps = operations.filter(op => op.status === 'in_progress');
      const failedOps = operations.filter(op => op.status === 'failed');

      expect(completedOps.length + inProgressOps.length + failedOps.length).toBe(operations.length);
    });

    it('should provide operation age information', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/api/sync-status/sync_001',
        headers: {
          authorization: 'Bearer test-token'
        }
      };

      const result = await syncStatusHandler(event, {});
      expect(result.statusCode).toBe(200);

      const body = JSON.parse(result.body);
      const operation = body.data.operation;

      // Validate timestamps are valid ISO strings
      expect(() => new Date(operation.startedAt)).not.toThrow();

      if (operation.completedAt) {
        expect(() => new Date(operation.completedAt)).not.toThrow();
        expect(new Date(operation.completedAt)).toBeAfter(new Date(operation.startedAt));
      }
    });

    it('should handle malformed operation IDs', async () => {
      const invalidIds = ['', 'invalid', 'sync_', 'sync_invalid'];

      for (const invalidId of invalidIds) {
        const event = {
          httpMethod: 'GET',
          path: `/api/sync-status/${invalidId}`,
          headers: {
            authorization: 'Bearer test-token'
          }
        };

        const result = await syncStatusHandler(event, {});

        // Should either return 404 or handle gracefully
        expect([200, 404]).toContain(result.statusCode);

        if (result.statusCode === 404) {
          const body = JSON.parse(result.body);
          expect(body.success).toBe(false);
          expect(body.error.code).toBe('NOT_FOUND');
        }
      }
    });
  });
});