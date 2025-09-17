const { handler } = require('../email-verification-records');

describe('GET /api/email-verification-records', () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        not: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => ({
              // Mock successful response
              data: [
                {
                  id: 1,
                  email: 'john.doe@example.com',
                  firstname: 'John',
                  lastname: 'Doe',
                  email_verification_status: 'verified',
                  hs_object_id: 'contact_123',
                  created_at: '2025-01-01T00:00:00Z',
                  updated_at: '2025-01-02T00:00:00Z'
                },
                {
                  id: 2,
                  email: 'jane.smith@example.com',
                  firstname: 'Jane',
                  lastname: 'Smith',
                  email_verification_status: 'pending',
                  hs_object_id: 'contact_124',
                  created_at: '2025-01-01T00:00:00Z',
                  updated_at: '2025-01-02T00:00:00Z'
                }
              ],
              error: null,
              count: 2
            }))
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

  it('should return email verification records with proper structure', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {},
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
    expect(body.data).toHaveProperty('records');
    expect(body.data).toHaveProperty('pagination');

    expect(Array.isArray(body.data.records)).toBe(true);
    expect(body.data.records).toHaveLength(2);

    // Check record structure
    const record = body.data.records[0];
    expect(record).toHaveProperty('id');
    expect(record).toHaveProperty('email');
    expect(record).toHaveProperty('firstname');
    expect(record).toHaveProperty('lastname');
    expect(record).toHaveProperty('email_verification_status');
    expect(record).toHaveProperty('hs_object_id');
    expect(record).toHaveProperty('created_at');
    expect(record).toHaveProperty('updated_at');

    // Check pagination structure
    expect(body.data.pagination).toHaveProperty('page', 1);
    expect(body.data.pagination).toHaveProperty('limit', 50);
    expect(body.data.pagination).toHaveProperty('totalRecords', 2);
    expect(body.data.pagination).toHaveProperty('totalPages', 1);
    expect(body.data.pagination).toHaveProperty('hasNext', false);
    expect(body.data.pagination).toHaveProperty('hasPrev', false);
  });

  it('should handle pagination parameters correctly', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        page: '2',
        limit: '10'
      },
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.data.pagination.page).toBe(2);
    expect(body.data.pagination.limit).toBe(10);
  });

  it('should handle sorting parameters correctly', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        sortBy: 'firstname',
        sortOrder: 'asc'
      },
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.success).toBe(true);
  });

  it('should return 401 for missing authorization', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {},
      headers: {}
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(401);

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('error', 'Unauthorized');
  });

  it('should return 405 for unsupported HTTP methods', async () => {
    const event = {
      httpMethod: 'POST',
      queryStringParameters: {},
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(405);

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('error', 'Method not allowed');
  });

  it('should handle database errors gracefully', async () => {
    // Mock database error
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        not: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => ({
              data: null,
              error: { message: 'Database connection failed' },
              count: null
            }))
          }))
        }))
      }))
    });

    const event = {
      httpMethod: 'GET',
      queryStringParameters: {},
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(500);

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('error');
    expect(body.error).toContain('Database connection failed');
  });

  it('should return empty records array when no data found', async () => {
    // Mock empty response
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        not: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => ({
              data: [],
              error: null,
              count: 0
            }))
          }))
        }))
      }))
    });

    const event = {
      httpMethod: 'GET',
      queryStringParameters: {},
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.data.records).toEqual([]);
    expect(body.data.pagination.totalRecords).toBe(0);
  });
});