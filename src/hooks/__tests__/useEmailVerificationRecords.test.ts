/// <reference types="vitest" />
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, Mock } from 'vitest';
import { useEmailVerificationRecords } from '../useEmailVerificationRecords';
import HubSpotAuthService from '../../services/hubspot-auth';

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

describe('useEmailVerificationRecords', () => {
  const mockAuthService = HubSpotAuthService.getInstance();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    const { result } = renderHook(() => useEmailVerificationRecords(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle unauthenticated state', () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(false);

    const { result } = renderHook(() => useEmailVerificationRecords(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true); // Query is disabled
  });

  it('should fetch data successfully', async () => {
    const mockData = {
      records: [
        {
          id: 1,
          email: 'john.doe@example.com',
          firstname: 'John',
          lastname: 'Doe',
          email_verification_status: 'verified',
          hs_object_id: 'contact_123',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-02T00:00:00Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 25,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };

    const mockResponse = {
      success: true,
      data: mockData,
      error: null,
      metadata: {
        requestId: 'req_123',
        timestamp: '2025-01-01T00:00:00Z',
        duration: 150,
      },
    };

    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(
      () => useEmailVerificationRecords({ page: 1, limit: 25 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith(
      '/.netlify/functions/email-verification-records?page=1&limit=25',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('should handle authentication errors', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useEmailVerificationRecords(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toContain(
      'Failed to get authentication token'
    );
  });

  it('should handle 401 authentication errors from API', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer invalid-token',
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    const { result } = renderHook(() => useEmailVerificationRecords(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toContain('Authentication failed');
  });

  it('should handle 403 forbidden errors', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });

    const { result } = renderHook(() => useEmailVerificationRecords(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toContain('Access denied');
  });

  it('should handle API errors gracefully', async () => {
    const mockErrorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid parameters',
      },
      data: null,
      metadata: {
        requestId: 'req_123',
        timestamp: '2025-01-01T00:00:00Z',
        duration: 150,
      },
    };

    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockErrorResponse),
    });

    const { result } = renderHook(() => useEmailVerificationRecords(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toContain('Invalid parameters');
  });

  it('should build query parameters correctly', async () => {
    const mockData = {
      records: [],
      pagination: {
        page: 2,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };

    const mockResponse = {
      success: true,
      data: mockData,
      error: null,
      metadata: {
        requestId: 'req_123',
        timestamp: '2025-01-01T00:00:00Z',
        duration: 150,
      },
    };

    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(
      () =>
        useEmailVerificationRecords({
          page: 2,
          limit: 10,
          sortBy: 'firstname',
          sortOrder: 'asc',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/.netlify/functions/email-verification-records?page=2&limit=10&sortBy=firstname&sortOrder=asc',
      expect.any(Object)
    );
  });

  it('should handle network errors', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useEmailVerificationRecords(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toContain('Network error');
  });

  it('should handle timeout correctly', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    // Mock a delayed response that exceeds timeout
    mockFetch.mockImplementationOnce(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () =>
                  Promise.resolve({
                    success: true,
                    data: { records: [], pagination: {} },
                  }),
              }),
            11000
          )
        ) // 11 seconds, exceeds 10 second timeout
    );

    const { result } = renderHook(() => useEmailVerificationRecords(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toContain('AbortError');
  });

  it('should disable query when not authenticated', () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(false);

    const { result } = renderHook(() => useEmailVerificationRecords(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true); // Query is disabled but still in loading state initially
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should provide refetch function', async () => {
    (mockAuthService.isAuthenticated as Mock).mockReturnValue(true);
    (mockAuthService.getAuthHeader as Mock).mockResolvedValue({
      Authorization: 'Bearer test-token',
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { records: [], pagination: {} },
          error: null,
          metadata: {},
        }),
    });

    const { result } = renderHook(() => useEmailVerificationRecords(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});
