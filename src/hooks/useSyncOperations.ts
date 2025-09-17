// src/hooks/useSyncOperations.ts

import { useQuery } from '@tanstack/react-query';
import { SyncOperation } from '@/types/emailVerification';

interface UseSyncOperationsReturn {
  data: SyncOperation[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
}

/**
 * Custom hook for fetching sync operations with React Query caching
 */
export function useSyncOperations(): UseSyncOperationsReturn {
  return useQuery({
    queryKey: ['sync-operations'],
    queryFn: async () => {
      // Make API call to Netlify function with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`/.netlify/functions/sync-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch operations: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data.operations || [];
      } else {
        throw new Error(result.error?.message || 'Failed to fetch operations');
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - operations change more frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
