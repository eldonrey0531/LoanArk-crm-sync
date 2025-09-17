// src/hooks/useComparisonData.ts

/**
 * Custom hook for fetching and managing comparison data using React Query
 */

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

// Import types
import {
  ContactComparison,
  TableFilters,
  ComparisonResponse,
  ComparisonRequest,
} from '@/types/emailVerificationDataDisplay';

// Import services
import { comparisonApiService } from '@/services/comparisonApiService';

export interface UseComparisonDataOptions {
  filters: TableFilters;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

export interface UseComparisonDataReturn {
  data: ContactComparison[] | undefined;
  summary: ComparisonResponse['summary'] | undefined;
  pagination: ComparisonResponse['pagination'] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}

/**
 * Hook for fetching comparison data with React Query
 */
export const useComparisonData = ({
  filters,
  page = 1,
  pageSize = 25,
  enabled = true,
  refetchOnWindowFocus = false,
  staleTime = 5 * 60 * 1000, // 5 minutes
}: UseComparisonDataOptions): UseComparisonDataReturn => {
  // Create query key based on filters and pagination
  const queryKey = useMemo(() => {
    return [
      'comparison-data',
      {
        page,
        pageSize,
        filter_status: filters.status,
        search: filters.search,
        dateRange: filters.dateRange,
      },
    ];
  }, [page, pageSize, filters]);

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<ComparisonResponse> => {
      const request: ComparisonRequest = {
        page,
        page_size: pageSize,
        filter_status: filters.status !== 'all' ? filters.status : undefined,
        search: filters.search || undefined,
      };

      const result = await comparisonApiService.fetchComparison(request);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch comparison data');
      }

      return result;
    },
    enabled,
    refetchOnWindowFocus,
    staleTime,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    data: response?.data,
    summary: response?.summary,
    pagination: response?.pagination,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    isRefetching,
  };
};

/**
 * Hook for managing comparison data mutations (refresh, invalidate)
 */
export const useComparisonDataMutation = () => {
  const queryClient = useQueryClient();

  const invalidateComparisonData = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['comparison-data'],
    });
  }, [queryClient]);

  const prefetchComparisonData = useCallback(
    (filters: TableFilters, page: number = 1, pageSize: number = 25) => {
      const queryKey = [
        'comparison-data',
        {
          page,
          pageSize,
          filter_status: filters.status,
          search: filters.search,
          dateRange: filters.dateRange,
        },
      ];

      queryClient.prefetchQuery({
        queryKey,
        queryFn: async (): Promise<ComparisonResponse> => {
          const request: ComparisonRequest = {
            page,
            page_size: pageSize,
            filter_status:
              filters.status !== 'all' ? filters.status : undefined,
            search: filters.search || undefined,
          };

          const result = await comparisonApiService.fetchComparison(request);

          if (!result.success) {
            throw new Error(result.error || 'Failed to fetch comparison data');
          }

          return result;
        },
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );

  return {
    invalidateComparisonData,
    prefetchComparisonData,
  };
};

/**
 * Hook for optimistic updates and cache management
 */
export const useComparisonDataCache = () => {
  const queryClient = useQueryClient();

  const updateComparisonData = useCallback(
    (
      updater: (
        oldData: ComparisonResponse | undefined
      ) => ComparisonResponse | undefined
    ) => {
      queryClient.setQueriesData({ queryKey: ['comparison-data'] }, updater);
    },
    [queryClient]
  );

  const getComparisonData = useCallback(
    (filters: TableFilters, page: number = 1, pageSize: number = 25) => {
      const queryKey = [
        'comparison-data',
        {
          page,
          pageSize,
          filter_status: filters.status,
          search: filters.search,
          dateRange: filters.dateRange,
        },
      ];

      return queryClient.getQueryData<ComparisonResponse>(queryKey);
    },
    [queryClient]
  );

  return {
    updateComparisonData,
    getComparisonData,
  };
};
