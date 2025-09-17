/// <reference types="vitest" />
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, Mock, describe, it, expect, beforeEach } from 'vitest';
import { useSyncStatus } from '../useSyncStatus';
import HubSpotAuthService from '../../services/hubspot-auth';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

// Mock the auth service
vi.mock('../../services/hubspot-auth', () => ({
  getInstance: vi.fn(() => ({
    isAuthenticated: vi.fn(),
    getAuthHeader: vi.fn(),
  })),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useSyncStatus', () => {
  const mockAuthService = HubSpotAuthService.getInstance();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state correctly for all operations', () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    const { result } = renderHook(() => useSyncStatus(), {
      wrapper: createWrapper(),
    });

    expect(result.current.operations).toBeUndefined();
    expect(result.current.operation).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.summary).toBeUndefined();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should return initial state correctly for specific operation', () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    const { result } = renderHook(() => useSyncStatus('sync_123'), {
      wrapper: createWrapper(),
    });

    expect(result.current.operations).toBeUndefined();
    expect(result.current.operation).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.summary).toBeUndefined();
  });

  it('should handle unauthenticated state', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(false);

    const { result } = renderHook(() => useSyncStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toContain('User not authenticated');
  });

  it('should handle authentication header failure', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useSyncStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toContain(
      'Failed to get authentication token'
    );
  });

  it('should fetch all operations successfully', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    const mockOperations = [
      {
        id: 'sync_001',
        supabaseContactId: 123,
        hubspotContactId: 'contact_456',
        status: 'completed',
        startedAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 3500000),
        sourceValue: 'verified',
        targetValue: 'verified',
        initiatedBy: 'system',
        retryCount: 0,
      },
      {
        id: 'sync_002',
        supabaseContactId: 124,
        hubspotContactId: 'contact_457',
        status: 'in_progress',
        startedAt: new Date(Date.now() - 300000),
        sourceValue: 'unverified',
        initiatedBy: 'user',
        retryCount: 0,
      },
    ];

    const mockResponse = {
      success: true,
      data: {
        operations: mockOperations,
        total: 2,
        summary: {
          total: 2,
          completed: 1,
          inProgress: 1,
          failed: 0,
          pending: 0,
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useSyncStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.operations).toEqual(mockOperations);
    expect(result.current.summary).toEqual({
      total: 2,
      completed: 1,
      inProgress: 1,
      failed: 0,
      pending: 0,
    });
    expect(result.current.error).toBeNull();
  });

  it('should fetch specific operation successfully', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    const mockOperation = {
      id: 'sync_123',
      supabaseContactId: 123,
      hubspotContactId: 'contact_456',
      status: 'completed',
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3500000),
      sourceValue: 'verified',
      targetValue: 'verified',
      initiatedBy: 'system',
      retryCount: 0,
    };

    const mockResponse = {
      success: true,
      data: {
        operation: mockOperation,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useSyncStatus('sync_123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.operation).toEqual(mockOperation);
    expect(result.current.operations).toBeUndefined();
    expect(result.current.summary).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('should handle operation not found', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const { result } = renderHook(() => useSyncStatus('nonexistent'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toContain(
      'Operation with ID nonexistent not found'
    );
  });

  it('should handle API errors', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => useSyncStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toContain(
      'Failed to fetch sync status'
    );
  });

  it('should handle API response errors', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    const mockResponse = {
      success: false,
      error: {
        message: 'Database connection failed',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useSyncStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toContain(
      'Database connection failed'
    );
  });

  it('should make correct API call for all operations', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { operations: [] } }),
    });

    renderHook(() => useSyncStatus(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/sync-status',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  it('should make correct API call for specific operation', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { operation: {} } }),
    });

    renderHook(() => useSyncStatus('sync_123'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/sync-status/sync_123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  it('should handle timeout', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    // Mock a slow response that exceeds timeout
    mockFetch.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ success: true, data: {} }),
            });
          }, 15000); // 15 seconds, exceeds 10 second timeout
        })
    );

    const { result } = renderHook(() => useSyncStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have an abort error
    expect(result.current.error).toBeDefined();
  });
});
