// src/hooks/useSyncStatistics.ts

import { useQuery } from '@tanstack/react-query';

interface SyncStatistics {
  totalContacts: number;
  verifiedContacts: number;
  unverifiedContacts: number;
  pendingContacts: number;
  lastSyncDate?: string;
}

interface UseSyncStatisticsReturn {
  data: SyncStatistics | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
}

/**
 * Custom hook for fetching sync statistics with React Query caching
 */
export function useSyncStatistics(): UseSyncStatisticsReturn {
  return useQuery({
    queryKey: ['sync-statistics'],
    queryFn: async () => {
      // Make API call to get records and calculate statistics with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`/.netlify/functions/email-verification-records?limit=1000`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data?.records) {
        const records = result.data.records;
        const verifiedContacts = records.filter((r: any) => r.email_verification_status === 'verified').length;
        const unverifiedContacts = records.filter((r: any) => r.email_verification_status === 'unverified').length;
        const pendingContacts = records.filter((r: any) => r.email_verification_status === 'pending').length;

        const statistics: SyncStatistics = {
          totalContacts: records.length,
          verifiedContacts,
          unverifiedContacts,
          pendingContacts,
          lastSyncDate: new Date().toISOString()
        };

        return statistics;
      } else {
        throw new Error(result.error?.message || 'Failed to fetch statistics');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}