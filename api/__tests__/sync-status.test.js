const { handler } = require('../sync-status');

describe('GET /api/sync-status/{operationId}', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should return specific sync operation by ID', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/api/sync-status/sync_001',
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(result.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('operation');
    expect(body.data.operation).toHaveProperty('id', 'sync_001');
    expect(body.data.operation).toHaveProperty('status');
    expect(body.data.operation).toHaveProperty('supabaseContactId');
    expect(body.data.operation).toHaveProperty('hubspotContactId');
    expect(body.data.operation).toHaveProperty('startedAt');
    expect(body.data.operation).toHaveProperty('sourceValue');
    expect(body.data.operation).toHaveProperty('targetValue');
    expect(body).toHaveProperty('error', null);
    expect(body).toHaveProperty('metadata');
  });

  it('should return all sync operations when no operationId provided', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/api/sync-status',
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('success', true);
    expect(body.data).toHaveProperty('operations');
    expect(body.data).toHaveProperty('total');
    expect(body.data).toHaveProperty('summary');
    expect(Array.isArray(body.data.operations)).toBe(true);
    expect(body.data.operations.length).toBeGreaterThan(0);
    expect(body.data.summary).toHaveProperty('total');
    expect(body.data.summary).toHaveProperty('completed');
    expect(body.data.summary).toHaveProperty('inProgress');
    expect(body.data.summary).toHaveProperty('failed');
  });

  it('should return 401 for missing authorization', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/api/sync-status/sync_001',
      headers: {}
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(401);

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('error', 'Unauthorized');
  });

  it('should return 405 for unsupported HTTP methods', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/api/sync-status/sync_001',
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(405);

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('error', 'Method not allowed');
  });

  it('should return 404 when operation not found', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/api/sync-status/nonexistent_operation',
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(404);

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'NOT_FOUND');
    expect(body.error.message).toContain('not found');
  });

  it('should handle completed operations correctly', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/api/sync-status/sync_001', // This should be a completed operation
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.data.operation.status).toBe('completed');
    expect(body.data.operation).toHaveProperty('completedAt');
    expect(body.data.operation).toHaveProperty('sourceValue');
    expect(body.data.operation).toHaveProperty('targetValue');
  });

  it('should handle in-progress operations correctly', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/api/sync-status/sync_002', // This should be an in-progress operation
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.data.operation.status).toBe('in_progress');
    expect(body.data.operation).toHaveProperty('startedAt');
    expect(body.data.operation).not.toHaveProperty('completedAt');
  });

  it('should handle failed operations with error details', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/api/sync-status/sync_003', // This should be a failed operation
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.data.operation.status).toBe('failed');
    expect(body.data.operation).toHaveProperty('error');
    expect(body.data.operation.error).toHaveProperty('code');
    expect(body.data.operation.error).toHaveProperty('message');
    expect(body.data.operation.error).toHaveProperty('canRetry');
  });

  it('should include operation metadata in response', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/api/sync-status/sync_001',
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.data.operation).toHaveProperty('initiatedBy');
    expect(body.data.operation).toHaveProperty('retryCount');
  });

  it('should handle internal server errors gracefully', async () => {
    // Mock a service that throws an error
    const originalHandler = require('../sync-status').handler;

    // Temporarily replace the handler to simulate an error
    require('../sync-status').handler = async () => {
      throw new Error('Simulated internal error');
    };

    const event = {
      httpMethod: 'GET',
      path: '/api/sync-status/sync_001',
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await require('../sync-status').handler(event, {});

    // Restore original handler
    require('../sync-status').handler = originalHandler;

    expect(result.statusCode).toBe(500);

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'INTERNAL_ERROR');
  });
});