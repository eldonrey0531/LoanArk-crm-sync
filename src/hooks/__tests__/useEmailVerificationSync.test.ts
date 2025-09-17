/// <reference types="vitest" />
import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, Mock, describe, it, expect, beforeEach } from 'vitest';
import { useEmailVerificationSync } from '../useEmailVerificationSync';
import HubSpotAuthService from '../../services/hubspot-auth';
import { emailVerificationSyncService } from '../../services/emailVerificationSyncService';
import { SupabaseContact } from '../../types/emailVerification';

// Mock the auth service
vi.mock('../../services/hubspot-auth', () => ({
  getInstance: vi.fn(() => ({
    isAuthenticated: vi.fn(),
    getAuthHeader: vi.fn(),
  })),
}));

// Mock the sync service
vi.mock('../../services/emailVerificationSyncService', () => ({
  emailVerificationSyncService: {
    syncToHubSpot: vi.fn(),
  },
}));

// Mock the records hook
vi.mock('../useEmailVerificationRecords', () => ({
  useEmailVerificationRecords: vi.fn(() => ({
    data: {
      records: [],
      pagination: {
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    isAuthenticated: true
  }))
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

// Helper function to create complete mock SupabaseContact
const createMockSupabaseContact = (overrides: Partial<SupabaseContact> = {}): SupabaseContact => ({
  id: 1,
  email: 'test@example.com',
  firstname: 'John',
  lastname: 'Doe',
  email_verification_status: 'verified',
  hs_object_id: 'contact_123',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-02T00:00:00Z',
  createdate: '2025-01-01T00:00:00Z',
  lastmodifieddate: '2025-01-02T00:00:00Z',
  ...overrides
});

describe('useEmailVerificationSync', () => {
  const mockAuthService = HubSpotAuthService.getInstance();
  const mockRecordsHook = vi.mocked(require('../useEmailVerificationRecords').useEmailVerificationRecords);
  const mockSyncService = vi.mocked(emailVerificationSyncService);

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations
    mockRecordsHook.mockReturnValue({
      data: {
        records: [],
        pagination: {
          page: 1,
          limit: 25,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isAuthenticated: true
    });
  });

  it('should return initial state correctly', () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);

    const { result } = renderHook(
      () => useEmailVerificationSync(),
      { wrapper: createWrapper() }
    );

    expect(result.current.records).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.syncStatuses).toEqual({});
    expect(typeof result.current.loadRecords).toBe('function');
    expect(typeof result.current.syncRecord).toBe('function');
    expect(typeof result.current.retrySync).toBe('function');
  });

  it('should handle unauthenticated state', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(false);

    const { result } = renderHook(
      () => useEmailVerificationSync(),
      { wrapper: createWrapper() }
    );

    await expect(result.current.loadRecords()).rejects.toThrow('User not authenticated');
  });

  it('should load records successfully', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    const mockRefetch = vi.fn().mockResolvedValue(undefined);
    mockRecordsHook.mockReturnValue({
      data: {
        records: [],
        pagination: {
          page: 1,
          limit: 25,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isAuthenticated: true
    });

    const { result } = renderHook(
      () => useEmailVerificationSync(),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      await result.current.loadRecords({ page: 1, limit: 10 });
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should sync record successfully', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);

    const mockRecord = createMockSupabaseContact({
      id: 1,
      email: 'test@example.com',
      firstname: 'John',
      lastname: 'Doe',
      email_verification_status: 'verified',
      hs_object_id: 'contact_123'
    });

    const mockSyncResult = {
      id: 'sync_123',
      supabaseContactId: 1,
      hubspotContactId: 'contact_123',
      status: 'completed' as const,
      startedAt: new Date(),
      completedAt: new Date(),
      sourceValue: 'verified',
      targetValue: 'verified',
      retryCount: 0,
      initiatedBy: 'system'
    };

    mockSyncService.syncToHubSpot.mockResolvedValue(mockSyncResult);

    const { result } = renderHook(
      () => useEmailVerificationSync(),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      await result.current.syncRecord(mockRecord);
    });

    expect(mockSyncService.syncToHubSpot).toHaveBeenCalledWith(
      1,
      'contact_123',
      'verified'
    );
    expect(result.current.syncStatuses[1]).toBe('completed');
  });

  it('should handle sync failure', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);

    const mockRecord = createMockSupabaseContact({
      id: 2,
      email: 'test@example.com',
      firstname: 'Jane',
      lastname: 'Smith',
      email_verification_status: 'verified',
      hs_object_id: 'contact_456'
    });

    const mockSyncResult = {
      id: 'sync_456',
      supabaseContactId: 2,
      hubspotContactId: 'contact_456',
      status: 'failed' as const,
      startedAt: new Date(),
      completedAt: new Date(),
      sourceValue: 'verified',
      retryCount: 0,
      initiatedBy: 'system',
      error: {
        code: 'HUBSPOT_API_ERROR',
        message: 'HubSpot API error',
        canRetry: true
      }
    };

    mockSyncService.syncToHubSpot.mockResolvedValue(mockSyncResult);

    const { result } = renderHook(
      () => useEmailVerificationSync(),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      await result.current.syncRecord(mockRecord);
    });

    expect(result.current.syncStatuses[2]).toBe('failed');
    expect(result.current.error).toContain('Some sync operations failed');
  });

  it('should handle record without HubSpot object ID', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);

    const mockRecord = createMockSupabaseContact({
      id: 3,
      email: 'test@example.com',
      firstname: 'Bob',
      lastname: 'Wilson',
      email_verification_status: 'verified',
      hs_object_id: null as any
    });

    const { result } = renderHook(
      () => useEmailVerificationSync(),
      { wrapper: createWrapper() }
    );

    await expect(result.current.syncRecord(mockRecord)).rejects.toThrow(
      'Record missing HubSpot object ID'
    );
  });

  it('should handle record without email verification status', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);

    const mockRecord = createMockSupabaseContact({
      id: 4,
      email: 'test@example.com',
      firstname: 'Alice',
      lastname: 'Brown',
      email_verification_status: null as any,
      hs_object_id: 'contact_789'
    });

    const { result } = renderHook(
      () => useEmailVerificationSync(),
      { wrapper: createWrapper() }
    );

    await expect(result.current.syncRecord(mockRecord)).rejects.toThrow(
      'Record missing email verification status'
    );
  });

  it('should retry sync operation', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);

    const mockRecord = {
      id: 5,
      email: 'retry@example.com',
      firstname: 'Retry',
      lastname: 'Test',
      email_verification_status: 'verified',
      hs_object_id: 'contact_999',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z'
    };

    const mockSyncResult = {
      id: 'sync_retry',
      supabaseContactId: 5,
      hubspotContactId: 'contact_999',
      status: 'completed' as const,
      startedAt: new Date(),
      completedAt: new Date(),
      sourceValue: 'verified',
      targetValue: 'verified',
      retryCount: 0,
      initiatedBy: 'system'
    };

    mockSyncService.syncToHubSpot.mockResolvedValue(mockSyncResult);

    // Mock records hook to return our test record
    mockRecordsHook.mockReturnValue({
      data: {
        records: [mockRecord],
        pagination: {
          page: 1,
          limit: 25,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isAuthenticated: true
    });

    const { result } = renderHook(
      () => useEmailVerificationSync(),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      await result.current.retrySync(5);
    });

    expect(mockSyncService.syncToHubSpot).toHaveBeenCalledWith(
      5,
      'contact_999',
      'verified'
    );
  });

  it('should handle retry for non-existent record', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);

    const { result } = renderHook(
      () => useEmailVerificationSync(),
      { wrapper: createWrapper() }
    );

    await expect(result.current.retrySync(999)).rejects.toThrow(
      'Record 999 not found'
    );
  });

  it('should update sync status during operation', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);

    const mockRecord = createMockSupabaseContact({
      id: 6,
      email: 'status@example.com',
      firstname: 'Status',
      lastname: 'Test',
      email_verification_status: 'verified',
      hs_object_id: 'contact_111'
    });

    // Mock a slow sync operation
    mockSyncService.syncToHubSpot.mockImplementation(
      () => new Promise(resolve => {
        setTimeout(() => {
          resolve({
            id: 'sync_status',
            supabaseContactId: 6,
            hubspotContactId: 'contact_111',
            status: 'completed' as const,
            startedAt: new Date(),
            completedAt: new Date(),
            sourceValue: 'verified',
            targetValue: 'verified',
            retryCount: 0,
            initiatedBy: 'system'
          });
        }, 100);
      })
    );

    const { result } = renderHook(
      () => useEmailVerificationSync(),
      { wrapper: createWrapper() }
    );

    // Start the sync operation
    act(() => {
      result.current.syncRecord(mockRecord);
    });

    // Should be in progress immediately
    expect(result.current.syncStatuses[6]).toBe('in_progress');

    // Wait for completion
    await waitFor(() => {
      expect(result.current.syncStatuses[6]).toBe('completed');
    });
  });

  it('should combine errors from records hook and sync operations', () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);

    // Mock records hook with error
    mockRecordsHook.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Failed to load records' },
      refetch: vi.fn(),
      isAuthenticated: true
    });

    const { result } = renderHook(
      () => useEmailVerificationSync(),
      { wrapper: createWrapper() }
    );

    expect(result.current.error).toBe('Failed to load records');
  });
});
