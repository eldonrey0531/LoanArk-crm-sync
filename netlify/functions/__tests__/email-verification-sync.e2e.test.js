const { handler: emailVerificationRecordsHandler } = require('../email-verification-records');
const { handler: syncEmailVerificationHandler } = require('../sync-email-verification');
const { handler: syncStatusHandler } = require('../sync-status');

describe('Email Verification Sync End-to-End Tests', () => {
  // Mock Supabase client for E2E tests
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
                },
                {
                  id: 3,
                  email: 'bob.wilson@example.com',
                  firstname: 'Bob',
                  lastname: 'Wilson',
                  email_verification_status: 'pending',
                  hs_object_id: 'contact_125',
                  created_at: '2025-01-01T00:00:00Z',
                  updated_at: '2025-01-02T00:00:00Z'
                }
              ],
              error: null,
              count: 3
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

  describe('Complete User Workflow Scenarios', () => {
    it('should complete full user journey: discover -> sync -> monitor -> verify', async () => {
      const authHeaders = {
        authorization: 'Bearer test-token'
      };

      console.log('🧪 E2E Test: Starting complete user workflow...');

      // === PHASE 1: User Discovers Contacts ===
      console.log('📋 Phase 1: Retrieving email verification records...');

      const discoverEvent = {
        httpMethod: 'GET',
        queryStringParameters: {
          page: '1',
          limit: '10',
          sortBy: 'updated_at',
          sortOrder: 'desc'
        },
        headers: authHeaders
      };

      const discoverResult = await emailVerificationRecordsHandler(discoverEvent, {});
      expect(discoverResult.statusCode).toBe(200);

      const discoverBody = JSON.parse(discoverResult.body);
      expect(discoverBody.success).toBe(true);
      expect(discoverBody.data.records.length).toBeGreaterThan(0);

      const contactToSync = discoverBody.data.records.find(c => c.email_verification_status === 'unverified');
      expect(contactToSync).toBeDefined();

      console.log(`✅ Found ${discoverBody.data.records.length} contacts, selected contact ${contactToSync.id} for sync`);

      // === PHASE 2: User Initiates Sync ===
      console.log('🔄 Phase 2: Initiating email verification sync...');

      const syncEvent = {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          supabaseContactId: contactToSync.id,
          hubspotContactId: contactToSync.hs_object_id,
          emailVerificationStatus: 'verified'
        })
      };

      const syncResult = await syncEmailVerificationHandler(syncEvent, {});
      expect(syncResult.statusCode).toBe(200);

      const syncBody = JSON.parse(syncResult.body);
      expect(syncBody.success).toBe(true);

      const operationId = syncBody.data.operationId;
      console.log(`✅ Sync initiated with operation ID: ${operationId}`);

      // === PHASE 3: User Monitors Progress ===
      console.log('👀 Phase 3: Monitoring sync progress...');

      const monitorEvent = {
        httpMethod: 'GET',
        path: `/api/sync-status/${operationId}`,
        headers: authHeaders
      };

      const monitorResult = await syncStatusHandler(monitorEvent, {});
      expect(monitorResult.statusCode).toBe(200);

      const monitorBody = JSON.parse(monitorResult.body);
      expect(monitorBody.success).toBe(true);
      expect(monitorBody.data.operation.id).toBe(operationId);
      expect(monitorBody.data.operation.status).toBe('completed');

      console.log(`✅ Sync completed successfully for contact ${contactToSync.id}`);

      // === PHASE 4: User Verifies Results ===
      console.log('✅ Phase 4: Verifying sync results...');

      const verifyEvent = {
        httpMethod: 'GET',
        queryStringParameters: {
          page: '1',
          limit: '10'
        },
        headers: authHeaders
      };

      const verifyResult = await emailVerificationRecordsHandler(verifyEvent, {});
      expect(verifyResult.statusCode).toBe(200);

      const verifyBody = JSON.parse(verifyResult.body);
      expect(verifyBody.success).toBe(true);

      // Verify the contact status was updated (in real scenario)
      const updatedContact = verifyBody.data.records.find(c => c.id === contactToSync.id);
      expect(updatedContact).toBeDefined();

      console.log('🎉 E2E Test completed successfully!');
    });

    it('should handle bulk sync operations for multiple contacts', async () => {
      const authHeaders = {
        authorization: 'Bearer test-token'
      };

      console.log('🧪 E2E Test: Starting bulk sync workflow...');

      // Get all contacts that need syncing
      const getContactsEvent = {
        httpMethod: 'GET',
        queryStringParameters: {},
        headers: authHeaders
      };

      const contactsResult = await emailVerificationRecordsHandler(getContactsEvent, {});
      const contactsBody = JSON.parse(contactsResult.body);
      const contactsToSync = contactsBody.data.records.filter(c =>
        c.email_verification_status !== 'verified'
      );

      console.log(`📋 Found ${contactsToSync.length} contacts needing sync`);

      // Perform bulk sync operations
      const syncPromises = contactsToSync.map(async (contact, index) => {
        console.log(`🔄 Syncing contact ${contact.id} (${index + 1}/${contactsToSync.length})...`);

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

        const result = await syncEmailVerificationHandler(syncEvent, {});
        expect(result.statusCode).toBe(200);

        const body = JSON.parse(result.body);
        expect(body.success).toBe(true);

        return body.data.operationId;
      });

      const operationIds = await Promise.all(syncPromises);
      console.log(`✅ Initiated ${operationIds.length} sync operations`);

      // Monitor all operations
      const monitorPromises = operationIds.map(async (operationId, index) => {
        const monitorEvent = {
          httpMethod: 'GET',
          path: `/api/sync-status/${operationId}`,
          headers: authHeaders
        };

        const result = await syncStatusHandler(monitorEvent, {});
        expect(result.statusCode).toBe(200);

        const body = JSON.parse(result.body);
        expect(body.success).toBe(true);
        expect(body.data.operation.status).toBe('completed');

        console.log(`✅ Operation ${operationId} completed (${index + 1}/${operationIds.length})`);
        return body.data.operation;
      });

      const completedOperations = await Promise.all(monitorPromises);
      expect(completedOperations).toHaveLength(contactsToSync.length);

      // Verify bulk operations summary
      const summaryEvent = {
        httpMethod: 'GET',
        path: '/api/sync-status',
        headers: authHeaders
      };

      const summaryResult = await syncStatusHandler(summaryEvent, {});
      const summaryBody = JSON.parse(summaryResult.body);

      expect(summaryBody.data.summary.completed).toBeGreaterThanOrEqual(completedOperations.length);

      console.log('🎉 Bulk sync E2E test completed successfully!');
    });

    it('should handle error scenarios and recovery workflows', async () => {
      const authHeaders = {
        authorization: 'Bearer test-token'
      };

      console.log('🧪 E2E Test: Testing error handling and recovery...');

      // === Test 1: Invalid Contact Sync ===
      console.log('❌ Testing sync with invalid contact...');

      const invalidSyncEvent = {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          supabaseContactId: 99999,
          hubspotContactId: 'contact_invalid',
          emailVerificationStatus: 'verified'
        })
      };

      // Mock contact not found
      mockSupabaseClient.from.mockReturnValueOnce({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: { message: 'Contact not found' }
          }))
        }))
      });

      const invalidSyncResult = await syncEmailVerificationHandler(invalidSyncEvent, {});
      expect(invalidSyncResult.statusCode).toBe(404);

      const invalidSyncBody = JSON.parse(invalidSyncResult.body);
      expect(invalidSyncBody.success).toBe(false);
      expect(invalidSyncBody.error.code).toBe('CONTACT_NOT_FOUND');

      console.log('✅ Error handling for invalid contact works correctly');

      // === Test 2: Authentication Failure ===
      console.log('🔒 Testing authentication failure...');

      const unauthEvent = {
        httpMethod: 'GET',
        queryStringParameters: {},
        headers: {}
      };

      const unauthResult = await emailVerificationRecordsHandler(unauthEvent, {});
      expect(unauthResult.statusCode).toBe(401);

      console.log('✅ Authentication validation works correctly');

      // === Test 3: Invalid Request Format ===
      console.log('📝 Testing invalid request format...');

      const invalidFormatEvent = {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
          ...authHeaders
        },
        body: 'invalid json content'
      };

      const invalidFormatResult = await syncEmailVerificationHandler(invalidFormatEvent, {});
      expect(invalidFormatResult.statusCode).toBe(400);

      const invalidFormatBody = JSON.parse(invalidFormatResult.body);
      expect(invalidFormatBody.success).toBe(false);
      expect(invalidFormatBody.error.code).toBe('INVALID_JSON');

      console.log('✅ Invalid request format handling works correctly');

      // === Test 4: Recovery - Successful Sync After Error ===
      console.log('🔄 Testing recovery with successful sync...');

      const recoveryEvent = {
        httpMethod: 'GET',
        queryStringParameters: {},
        headers: authHeaders
      };

      const recoveryResult = await emailVerificationRecordsHandler(recoveryEvent, {});
      expect(recoveryResult.statusCode).toBe(200);

      const recoveryBody = JSON.parse(recoveryResult.body);
      expect(recoveryBody.success).toBe(true);

      console.log('🎉 Error handling and recovery E2E test completed successfully!');
    });

    it('should handle concurrent user sessions and race conditions', async () => {
      const authHeaders1 = { authorization: 'Bearer user1-token' };
      const authHeaders2 = { authorization: 'Bearer user2-token' };

      console.log('🧪 E2E Test: Testing concurrent user sessions...');

      // Both users retrieve contacts simultaneously
      const user1GetEvent = {
        httpMethod: 'GET',
        queryStringParameters: { page: '1', limit: '5' },
        headers: authHeaders1
      };

      const user2GetEvent = {
        httpMethod: 'GET',
        queryStringParameters: { page: '1', limit: '5' },
        headers: authHeaders2
      };

      const [user1Result, user2Result] = await Promise.all([
        emailVerificationRecordsHandler(user1GetEvent, {}),
        emailVerificationRecordsHandler(user2GetEvent, {})
      ]);

      expect(user1Result.statusCode).toBe(200);
      expect(user2Result.statusCode).toBe(200);

      const user1Body = JSON.parse(user1Result.body);
      const user2Body = JSON.parse(user2Result.body);

      expect(user1Body.success).toBe(true);
      expect(user2Body.success).toBe(true);

      console.log('✅ Concurrent contact retrieval works correctly');

      // Users sync different contacts simultaneously
      const contact1 = user1Body.data.records[0];
      const contact2 = user2Body.data.records[1];

      const user1SyncEvent = {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
          ...authHeaders1
        },
        body: JSON.stringify({
          supabaseContactId: contact1.id,
          hubspotContactId: contact1.hs_object_id,
          emailVerificationStatus: 'verified'
        })
      };

      const user2SyncEvent = {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
          ...authHeaders2
        },
        body: JSON.stringify({
          supabaseContactId: contact2.id,
          hubspotContactId: contact2.hs_object_id,
          emailVerificationStatus: 'verified'
        })
      };

      const [sync1Result, sync2Result] = await Promise.all([
        syncEmailVerificationHandler(user1SyncEvent, {}),
        syncEmailVerificationHandler(user2SyncEvent, {})
      ]);

      expect(sync1Result.statusCode).toBe(200);
      expect(sync2Result.statusCode).toBe(200);

      const sync1Body = JSON.parse(sync1Result.body);
      const sync2Body = JSON.parse(sync2Result.body);

      expect(sync1Body.success).toBe(true);
      expect(sync2Body.success).toBe(true);

      console.log('✅ Concurrent sync operations work correctly');

      // Both users check their operation status
      const status1Event = {
        httpMethod: 'GET',
        path: `/api/sync-status/${sync1Body.data.operationId}`,
        headers: authHeaders1
      };

      const status2Event = {
        httpMethod: 'GET',
        path: `/api/sync-status/${sync2Body.data.operationId}`,
        headers: authHeaders2
      };

      const [status1Result, status2Result] = await Promise.all([
        syncStatusHandler(status1Event, {}),
        syncStatusHandler(status2Event, {})
      ]);

      expect(status1Result.statusCode).toBe(200);
      expect(status2Result.statusCode).toBe(200);

      console.log('🎉 Concurrent sessions E2E test completed successfully!');
    });

    it('should maintain data consistency across operations', async () => {
      const authHeaders = {
        authorization: 'Bearer test-token'
      };

      console.log('🧪 E2E Test: Testing data consistency...');

      // Get initial state
      const initialEvent = {
        httpMethod: 'GET',
        queryStringParameters: {},
        headers: authHeaders
      };

      const initialResult = await emailVerificationRecordsHandler(initialEvent, {});
      const initialBody = JSON.parse(initialResult.body);
      const initialRecords = initialBody.data.records;

      console.log(`📊 Initial state: ${initialRecords.length} records`);

      // Perform multiple operations
      const operations = [];
      for (let i = 0; i < Math.min(3, initialRecords.length); i++) {
        const record = initialRecords[i];
        const syncEvent = {
          httpMethod: 'POST',
          headers: {
            'content-type': 'application/json',
            ...authHeaders
          },
          body: JSON.stringify({
            supabaseContactId: record.id,
            hubspotContactId: record.hs_object_id,
            emailVerificationStatus: 'verified'
          })
        };

        const result = await syncEmailVerificationHandler(syncEvent, {});
        const body = JSON.parse(result.body);
        operations.push(body.data.operationId);
      }

      console.log(`🔄 Performed ${operations.length} sync operations`);

      // Verify all operations completed
      for (const operationId of operations) {
        const statusEvent = {
          httpMethod: 'GET',
          path: `/api/sync-status/${operationId}`,
          headers: authHeaders
        };

        const result = await syncStatusHandler(statusEvent, {});
        const body = JSON.parse(result.body);

        expect(body.data.operation.status).toBe('completed');
        expect(body.data.operation.supabaseContactId).toBeDefined();
        expect(body.data.operation.hubspotContactId).toBeDefined();
      }

      console.log('✅ All operations completed successfully');

      // Verify final state consistency
      const finalEvent = {
        httpMethod: 'GET',
        queryStringParameters: {},
        headers: authHeaders
      };

      const finalResult = await emailVerificationRecordsHandler(finalEvent, {});
      const finalBody = JSON.parse(finalResult.body);

      expect(finalBody.data.records.length).toBe(initialRecords.length);
      expect(finalBody.data.totalRecords).toBe(initialBody.data.totalRecords);

      console.log('🎉 Data consistency E2E test completed successfully!');
    });
  });
});