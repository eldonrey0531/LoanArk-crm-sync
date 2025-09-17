const { handler: emailVerificationRecordsHandler } = require('../email-verification-records');
const { handler: syncEmailVerificationHandler } = require('../sync-email-verification');
const { handler: syncStatusHandler } = require('../sync-status');

describe('Email Verification Sync Integration Tests', () => {
  // Mock Supabase client for integration tests
  const mockSupabaseClient = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        not: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => ({
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
                  email_verification_status: 'unverified',
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
      })),
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
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';

    // Mock createClient
    jest.doMock('@supabase/supabase-js', () => ({
      createClient: jest.fn(() => mockSupabaseClient)
    }));
  });

  describe('Complete Email Verification Sync Workflow', () => {
    it('should complete full sync workflow: retrieve contacts -> sync status -> check status', async () => {
      const authHeaders = {
        authorization: 'Bearer test-token'
      };

      // Step 1: Retrieve email verification records
      const getRecordsEvent = {
        httpMethod: 'GET',
        queryStringParameters: {},
        headers: authHeaders
      };

      const recordsResult = await emailVerificationRecordsHandler(getRecordsEvent, {});
      expect(recordsResult.statusCode).toBe(200);

      const recordsBody = JSON.parse(recordsResult.body);
      expect(recordsBody.success).toBe(true);
      expect(recordsBody.data.records).toHaveLength(2);

      // Get the first contact for syncing
      const contactToSync = recordsBody.data.records[0];
      expect(contactToSync).toHaveProperty('id');
      expect(contactToSync).toHaveProperty('hs_object_id');
      expect(contactToSync).toHaveProperty('email_verification_status');

      // Step 2: Sync email verification status
      const syncEvent = {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          supabaseContactId: contactToSync.id,
          hubspotContactId: contactToSync.hs_object_id,
          emailVerificationStatus: 'verified' // Different status to test sync
        })
      };

      const syncResult = await syncEmailVerificationHandler(syncEvent, {});
      expect(syncResult.statusCode).toBe(200);

      const syncBody = JSON.parse(syncResult.body);
      expect(syncBody.success).toBe(true);
      expect(syncBody.data).toHaveProperty('operationId');
      expect(syncBody.data.status).toBe('completed');

      const operationId = syncBody.data.operationId;

      // Step 3: Check sync operation status
      const statusEvent = {
        httpMethod: 'GET',
        path: `/api/sync-status/${operationId}`,
        headers: authHeaders
      };

      const statusResult = await syncStatusHandler(statusEvent, {});
      expect(statusResult.statusCode).toBe(200);

      const statusBody = JSON.parse(statusResult.body);
      expect(statusBody.success).toBe(true);
      expect(statusBody.data.operation.id).toBe(operationId);
      expect(statusBody.data.operation.status).toBe('completed');
      expect(statusBody.data.operation.supabaseContactId).toBe(contactToSync.id);
      expect(statusBody.data.operation.hubspotContactId).toBe(contactToSync.hs_object_id);
    });

    it('should handle sync failure and status tracking', async () => {
      // Mock contact not found for sync failure
      mockSupabaseClient.from.mockReturnValueOnce({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: { message: 'Contact not found' }
          }))
        }))
      });

      const authHeaders = {
        authorization: 'Bearer test-token'
      };

      // Attempt to sync non-existent contact
      const syncEvent = {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          supabaseContactId: 999,
          hubspotContactId: 'contact_999',
          emailVerificationStatus: 'verified'
        })
      };

      const syncResult = await syncEmailVerificationHandler(syncEvent, {});
      expect(syncResult.statusCode).toBe(404); // Should return 404 for contact not found

      const syncBody = JSON.parse(syncResult.body);
      expect(syncBody.success).toBe(false);
      expect(syncBody.error.code).toBe('CONTACT_NOT_FOUND');
    });

    it('should handle pagination in records retrieval and sync multiple contacts', async () => {
      const authHeaders = {
        authorization: 'Bearer test-token'
      };

      // Test pagination
      const paginatedEvent = {
        httpMethod: 'GET',
        queryStringParameters: {
          page: '1',
          limit: '1'
        },
        headers: authHeaders
      };

      const paginatedResult = await emailVerificationRecordsHandler(paginatedEvent, {});
      expect(paginatedResult.statusCode).toBe(200);

      const paginatedBody = JSON.parse(paginatedResult.body);
      expect(paginatedBody.success).toBe(true);
      expect(paginatedBody.data.records).toHaveLength(1);
      expect(paginatedBody.data.pagination.page).toBe(1);
      expect(paginatedBody.data.pagination.limit).toBe(1);
      expect(paginatedBody.data.pagination.totalRecords).toBe(2);
    });

    it('should handle sorting and filtering in records retrieval', async () => {
      const authHeaders = {
        authorization: 'Bearer test-token'
      };

      // Test sorting
      const sortedEvent = {
        httpMethod: 'GET',
        queryStringParameters: {
          sortBy: 'firstname',
          sortOrder: 'asc'
        },
        headers: authHeaders
      };

      const sortedResult = await emailVerificationRecordsHandler(sortedEvent, {});
      expect(sortedResult.statusCode).toBe(200);

      const sortedBody = JSON.parse(sortedResult.body);
      expect(sortedResult.statusCode).toBe(200);
      expect(sortedBody.success).toBe(true);
    });

    it('should retrieve all sync operations summary', async () => {
      const authHeaders = {
        authorization: 'Bearer test-token'
      };

      const allOperationsEvent = {
        httpMethod: 'GET',
        path: '/api/sync-status',
        headers: authHeaders
      };

      const allOperationsResult = await syncStatusHandler(allOperationsEvent, {});
      expect(allOperationsResult.statusCode).toBe(200);

      const allOperationsBody = JSON.parse(allOperationsResult.body);
      expect(allOperationsBody.success).toBe(true);
      expect(allOperationsBody.data).toHaveProperty('operations');
      expect(allOperationsBody.data).toHaveProperty('total');
      expect(allOperationsBody.data).toHaveProperty('summary');
      expect(Array.isArray(allOperationsBody.data.operations)).toBe(true);
      expect(allOperationsBody.data.operations.length).toBeGreaterThan(0);
    });

    it('should handle concurrent sync operations', async () => {
      const authHeaders = {
        authorization: 'Bearer test-token'
      };

      // Get records first
      const getRecordsEvent = {
        httpMethod: 'GET',
        queryStringParameters: {},
        headers: authHeaders
      };

      const recordsResult = await emailVerificationRecordsHandler(getRecordsEvent, {});
      const recordsBody = JSON.parse(recordsResult.body);
      const contacts = recordsBody.data.records;

      // Perform multiple sync operations concurrently
      const syncPromises = contacts.map(contact => {
        const syncEvent = {
          httpMethod: 'POST',
          headers: {
            'content-type': 'application/json',
            ...authHeaders
          },
          body: JSON.stringify({
            supabaseContactId: contact.id,
            hubspotContactId: contact.hs_object_id,
            emailVerificationStatus: 'verified'
          })
        };
        return syncEmailVerificationHandler(syncEvent, {});
      });

      const syncResults = await Promise.all(syncPromises);

      // All sync operations should succeed
      syncResults.forEach(result => {
        expect(result.statusCode).toBe(200);
        const body = JSON.parse(result.body);
        expect(body.success).toBe(true);
      });
    });

    it('should validate request authentication across all endpoints', async () => {
      // Test missing auth on all endpoints
      const endpoints = [
        {
          handler: emailVerificationRecordsHandler,
          event: { httpMethod: 'GET', queryStringParameters: {}, headers: {} }
        },
        {
          handler: syncEmailVerificationHandler,
          event: {
            httpMethod: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              supabaseContactId: 1,
              hubspotContactId: 'contact_123',
              emailVerificationStatus: 'verified'
            })
          }
        },
        {
          handler: syncStatusHandler,
          event: { httpMethod: 'GET', path: '/api/sync-status/sync_001', headers: {} }
        }
      ];

      for (const { handler, event } of endpoints) {
        const result = await handler(event, {});
        expect(result.statusCode).toBe(401);
        const body = JSON.parse(result.body);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Unauthorized');
      }
    });

    it('should handle malformed requests gracefully', async () => {
      const authHeaders = {
        authorization: 'Bearer test-token'
      };

      // Test invalid JSON in sync request
      const invalidJsonEvent = {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
          ...authHeaders
        },
        body: 'invalid json'
      };

      const invalidJsonResult = await syncEmailVerificationHandler(invalidJsonEvent, {});
      expect(invalidJsonResult.statusCode).toBe(400);

      const invalidJsonBody = JSON.parse(invalidJsonResult.body);
      expect(invalidJsonBody.success).toBe(false);
      expect(invalidJsonBody.error.code).toBe('INVALID_JSON');
    });
  });
});