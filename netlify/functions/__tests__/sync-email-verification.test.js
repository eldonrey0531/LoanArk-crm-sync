const { handler } = require('../sync-email-verification');

describe('POST /api/sync-email-verification', () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 1,
              email: 'john.doe@example.com',
              firstname: 'John',
              lastname: 'Doe',
              email_verification_status: 'verified',
              hs_object_id: 'contact_123',
              created_at: '2025-01-01T00:00:00Z',
              updated_at: '2025-01-02T00:00:00Z'
            },
            error: null
          }))
        }))
      }))
    }))
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';

    // Mock createClient to return our mock client
    jest.doMock('@supabase/supabase-js', () => ({
      createClient: jest.fn(() => mockSupabaseClient)
    }));
  });

  it('should successfully sync email verification status', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer test-token'
      },
      body: JSON.stringify({
        supabaseContactId: 1,
        hubspotContactId: 'contact_123',
        emailVerificationStatus: 'verified'
      })
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(result.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('operationId');
    expect(body.data).toHaveProperty('status');
    expect(body.data).toHaveProperty('supabaseContactId', 1);
    expect(body.data).toHaveProperty('hubspotContactId', 'contact_123');
    expect(body.data).toHaveProperty('startedAt');
    expect(body.data).toHaveProperty('completedAt');
    expect(body.data).toHaveProperty('sourceValue');
    expect(body.data).toHaveProperty('targetValue');
    expect(body.data).toHaveProperty('result');
    expect(body).toHaveProperty('error', null);
    expect(body).toHaveProperty('metadata');
    expect(body.metadata).toHaveProperty('requestId');
    expect(body.metadata).toHaveProperty('timestamp');
    expect(body.metadata).toHaveProperty('duration');
  });

  it('should return 401 for missing authorization', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        supabaseContactId: 1,
        hubspotContactId: 'contact_123',
        emailVerificationStatus: 'verified'
      })
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(401);

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('error', 'Unauthorized');
  });

  it('should return 405 for unsupported HTTP methods', async () => {
    const event = {
      httpMethod: 'GET',
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

  it('should return 400 for invalid JSON in request body', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer test-token'
      },
      body: 'invalid json'
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(400);

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'INVALID_JSON');
    expect(body.error).toHaveProperty('message');
  });

  it('should return 400 for missing required fields', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer test-token'
      },
      body: JSON.stringify({
        supabaseContactId: 1
        // missing hubspotContactId and emailVerificationStatus
      })
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(400);

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(body.error.message).toContain('Missing required fields');
  });

  it('should return 400 for invalid field types', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer test-token'
      },
      body: JSON.stringify({
        supabaseContactId: 'invalid', // should be number
        hubspotContactId: 123, // should be string
        emailVerificationStatus: 'verified'
      })
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(400);

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(body.error.message).toContain('supabaseContactId must be a number');
  });

  it('should return 400 for invalid email verification status', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer test-token'
      },
      body: JSON.stringify({
        supabaseContactId: 1,
        hubspotContactId: 'contact_123',
        emailVerificationStatus: 'invalid_status'
      })
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(400);

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(body.error.message).toContain('Invalid email verification status');
  });

  it('should return 404 when contact not found', async () => {
    // Mock contact not found
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: { message: 'Contact not found' }
          }))
        }))
      }))
    });

    const event = {
      httpMethod: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer test-token'
      },
      body: JSON.stringify({
        supabaseContactId: 999,
        hubspotContactId: 'contact_999',
        emailVerificationStatus: 'verified'
      })
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(404);

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'CONTACT_NOT_FOUND');
  });

  it('should handle database errors gracefully', async () => {
    // Mock database error
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: { message: 'Database connection failed' }
          }))
        }))
      }))
    });

    const event = {
      httpMethod: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer test-token'
      },
      body: JSON.stringify({
        supabaseContactId: 1,
        hubspotContactId: 'contact_123',
        emailVerificationStatus: 'verified'
      })
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(500);

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'INTERNAL_ERROR');
  });

  it('should return 500 when Supabase configuration is missing', async () => {
    // Clear environment variables
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;

    const event = {
      httpMethod: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer test-token'
      },
      body: JSON.stringify({
        supabaseContactId: 1,
        hubspotContactId: 'contact_123',
        emailVerificationStatus: 'verified'
      })
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(500);

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'CONFIGURATION_ERROR');
  });
});