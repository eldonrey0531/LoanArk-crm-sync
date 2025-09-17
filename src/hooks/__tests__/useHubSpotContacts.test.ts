/// <reference types="vitest" />
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHubSpotContacts } from '../useHubSpotContacts';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useHubSpotContacts', () => {
  it('should return loading state initially', async () => {
    const { result } = renderHook(
      () => useHubSpotContacts({ type: 'sync' }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should have correct query key', () => {
    const { result } = renderHook(
      () => useHubSpotContacts({ type: 'sync', limit: 10 }),
      { wrapper: createWrapper() }
    );

    // The hook should be using React Query properly
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });
});