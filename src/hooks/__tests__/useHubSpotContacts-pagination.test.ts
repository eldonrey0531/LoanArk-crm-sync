/// <reference types="vitest" />
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHubSpotContacts } from '../useHubSpotContacts';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

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

describe('useHubSpotContacts - Pagination Parameters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should accept pagination parameters', () => {
    const mockData = {
      contacts: [
        { hs_object_id: '1', email: 'test@example.com', firstname: 'Test' },
      ],
      total: 100,
      hasMore: true,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(
      () =>
        useHubSpotContacts({
          type: 'sync',
          limit: 25,
          offset: 50,
        }),
      { wrapper: createWrapper() }
    );

    // Check that hook doesn't crash with pagination parameters
    expect(result.current).toBeDefined();
  });

  it('should construct correct API URL with pagination parameters', async () => {
    const mockData = {
      contacts: [],
      total: 0,
      hasMore: false,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    renderHook(
      () =>
        useHubSpotContacts({
          type: 'sync',
          limit: 10,
          offset: 20,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10&offset=20'),
        expect.any(Object)
      );
    });
  });

  it('should use different query keys for different pagination states', () => {
    const mockData = {
      contacts: [],
      total: 0,
      hasMore: false,
    };

    (global.fetch as any).mockResolvedValue(mockData);

    const { rerender } = renderHook(
      ({ limit, offset }: { limit: number; offset: number }) =>
        useHubSpotContacts({
          type: 'sync',
          limit,
          offset,
        }),
      {
        wrapper: createWrapper(),
        initialProps: { limit: 10, offset: 0 },
      }
    );

    // Change pagination parameters
    rerender({ limit: 10, offset: 10 });

    // Should trigger new API call with different parameters
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle pagination metadata in response', async () => {
    const mockData = {
      contacts: [{ hs_object_id: '1', email: 'test@example.com' }],
      total: 150,
      hasMore: true,
      pagination: {
        pageIndex: 1,
        pageSize: 25,
        totalPages: 6,
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(
      () =>
        useHubSpotContacts({
          type: 'sync',
          limit: 25,
          offset: 25,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    expect(result.current.data?.total).toBe(150);
    expect(result.current.data?.hasMore).toBe(true);
  });

  it('should maintain data consistency across pagination requests', async () => {
    const mockData1 = {
      contacts: [{ hs_object_id: '1', email: 'test1@example.com' }],
      total: 50,
      hasMore: true,
    };

    const mockData2 = {
      contacts: [{ hs_object_id: '2', email: 'test2@example.com' }],
      total: 50,
      hasMore: false,
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData1),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData2),
      });

    const { result, rerender } = renderHook(
      ({ offset }: { offset: number }) =>
        useHubSpotContacts({
          type: 'sync',
          limit: 1,
          offset,
        }),
      {
        wrapper: createWrapper(),
        initialProps: { offset: 0 },
      }
    );

    await waitFor(() => {
      expect(result.current.data?.total).toBe(50);
    });

    // Change offset
    rerender({ offset: 1 });

    await waitFor(() => {
      expect(result.current.data?.total).toBe(50); // Should remain consistent
    });
  });

  it('should handle API errors during pagination', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server error' }),
    });

    const { result } = renderHook(
      () =>
        useHubSpotContacts({
          type: 'sync',
          limit: 10,
          offset: 0,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.error?.message).toContain('Failed to fetch contacts');
  });

  it('should support both sync and live data types with pagination', async () => {
    const mockData = {
      contacts: [],
      total: 0,
      hasMore: false,
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    // Test sync type
    const { result: syncResult, rerender: syncRerender } = renderHook(
      () =>
        useHubSpotContacts({
          type: 'sync',
          limit: 10,
          offset: 0,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(syncResult.current.isSuccess).toBe(true);
    });

    // Test live type
    const { result: liveResult } = renderHook(
      () =>
        useHubSpotContacts({
          type: 'live',
          limit: 10,
          offset: 0,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(liveResult.current.isSuccess).toBe(true);
    });

    // Should have made calls to different endpoints
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('hubspot-contacts-sync'),
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('hubspot-contacts-live'),
      expect.any(Object)
    );
  });
});
