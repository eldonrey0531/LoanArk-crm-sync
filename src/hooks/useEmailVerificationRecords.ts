// src/hooks/useEmailVerificationRecords.ts

import { useQuery } from '@tanstack/react-query';
import {
  SupabaseContact,
  GetEmailVerificationRecordsParams,
  PaginationInfo
} from '@/types/emailVerification';

interface UseEmailVerificationRecordsReturn {
  data: {
    records: SupabaseContact[];
    pagination: PaginationInfo;
  } | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
}

/**
 * Custom hook for fetching email verification records with React Query caching
 */
export function useEmailVerificationRecords(
  params: GetEmailVerificationRecordsParams = {}
): UseEmailVerificationRecordsReturn {
  const queryKey = ['email-verification-records', params];

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.set('page', params.page.toString());
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.sortBy) queryParams.set('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);

      // Make API call to Netlify function with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`/.netlify/functions/email-verification-records?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch records: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Failed to fetch records');
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