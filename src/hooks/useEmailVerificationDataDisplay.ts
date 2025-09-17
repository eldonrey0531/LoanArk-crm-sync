// src/hooks/useEmailVerificationDataDisplay.ts

/**
 * Combined hook for Email Verification Data Display
 *
 * This hook combines all the data fetching, filtering, and state management
 * logic for the Email Verification Data Display feature.
 */

import { useMemo } from 'react';

// Import custom hooks
import { useComparisonData } from './useComparisonData';
import { useComparisonFilters, useComparisonSelection } from './useComparisonFilters';

// Import types
import {
  EmailVerificationDataDisplayProps,
  ContactComparison,
  TableFilters,
  ComparisonResponse
} from '@/types/emailVerificationDataDisplay';

export interface UseEmailVerificationDataDisplayOptions {
  initialPageSize?: number;
  showFilters?: boolean;
  showSummary?: boolean;
  onRecordSelect?: (comparison: ContactComparison) => void;
  onError?: (error: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export interface UseEmailVerificationDataDisplayReturn {
  // Data
  data: ContactComparison[] | undefined;
  summary: ComparisonResponse['summary'] | undefined;
  pagination: ComparisonResponse['pagination'] | undefined;

  // Loading states
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  error: Error | null;

  // Filters and pagination
  filters: TableFilters;
  page: number;
  pageSize: number;
  hasActiveFilters: boolean;
  filterCount: number;

  // Selection
  selectedIds: string[];
  hasSelection: boolean;
  selectionCount: number;

  // Actions
  setFilters: (filters: TableFilters) => void;
  updateFilters: (updates: Partial<TableFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  refetch: () => void;
  invalidateData: () => void;

  // Selection actions
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleItem: (id: string) => void;
  selectAll: (allIds: string[]) => void;
  deselectAll: () => void;
  isSelected: (id: string) => boolean;

  // Computed values
  totalRecords: number;
  currentPageRecords: number;
  hasData: boolean;
  isEmpty: boolean;
}

/**
 * Combined hook for Email Verification Data Display
 */
export const useEmailVerificationDataDisplay = ({
  initialPageSize = 25,
  onRecordSelect,
  onError,
  onLoadingChange
}: UseEmailVerificationDataDisplayOptions = {}): UseEmailVerificationDataDisplayReturn => {
  // Use filter and selection hooks
  const {
    filters,
    page,
    pageSize,
    setFilters,
    updateFilters,
    resetFilters,
    setPage,
    setPageSize,
    hasActiveFilters,
    filterCount
  } = useComparisonFilters({
    initialPageSize,
    onFiltersChange: () => {
      // Filters changed, data will be refetched automatically
    },
    onPageChange: () => {
      // Page changed, data will be refetched automatically
    },
    onPageSizeChange: () => {
      // Page size changed, data will be refetched automatically
    }
  });

  const {
    selectedIds,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    isSelected,
    hasSelection,
    selectionCount
  } = useComparisonSelection({
    onSelectionChange: () => {
      // Selection changed
    }
  });

  // Use data fetching hook
  const {
    data,
    summary,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching
  } = useComparisonData({
    filters,
    page,
    pageSize,
    enabled: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Computed values
  const totalRecords = pagination?.total || 0;
  const currentPageRecords = data?.length || 0;
  const hasData = !!data && data.length > 0;
  const isEmpty = !isLoading && !hasData;

  // Handle record selection
  const handleRecordSelect = (comparison: ContactComparison) => {
    onRecordSelect?.(comparison);
  };

  // Handle errors
  const handleError = (errorMessage: string) => {
    onError?.(errorMessage);
  };

  // Handle loading changes
  const handleLoadingChange = (loading: boolean) => {
    onLoadingChange?.(loading);
  };

  // Invalidate data function
  const invalidateData = () => {
    // This would typically use the mutation hook
    refetch();
  };

  return {
    // Data
    data,
    summary,
    pagination,

    // Loading states
    isLoading,
    isError,
    isRefetching,
    error,

    // Filters and pagination
    filters,
    page,
    pageSize,
    hasActiveFilters,
    filterCount,

    // Selection
    selectedIds,
    hasSelection,
    selectionCount,

    // Actions
    setFilters,
    updateFilters,
    resetFilters,
    setPage,
    setPageSize,
    refetch,
    invalidateData,

    // Selection actions
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    isSelected,

    // Computed values
    totalRecords,
    currentPageRecords,
    hasData,
    isEmpty
  };
};

/**
 * Hook for data display statistics
 */
export interface UseDataDisplayStatsReturn {
  matchRate: number;
  mismatchRate: number;
  completionRate: number;
  totalProcessed: number;
  estimatedTimeRemaining: number | null;
  progressPercentage: number;
}

export const useDataDisplayStats = (
  summary: ComparisonResponse['summary'] | undefined,
  isLoading: boolean
): UseDataDisplayStatsReturn => {
  return useMemo(() => {
    if (!summary) {
      return {
        matchRate: 0,
        mismatchRate: 0,
        completionRate: 0,
        totalProcessed: 0,
        estimatedTimeRemaining: null,
        progressPercentage: 0
      };
    }

    const total = summary.total_matched + summary.total_supabase_only + summary.total_hubspot_only + summary.total_mismatches;
    const matched = summary.total_matched;
    const mismatched = summary.total_supabase_only + summary.total_hubspot_only + summary.total_mismatches;

    const matchRate = total > 0 ? (matched / total) * 100 : 0;
    const mismatchRate = total > 0 ? (mismatched / total) * 100 : 0;
    const completionRate = total > 0 ? (matched / total) * 100 : 0;

    // Simple progress calculation
    const progressPercentage = isLoading ? 75 : completionRate;

    return {
      matchRate: Math.round(matchRate),
      mismatchRate: Math.round(mismatchRate),
      completionRate: Math.round(completionRate),
      totalProcessed: total,
      estimatedTimeRemaining: null, // Could be calculated based on processing rate
      progressPercentage: Math.round(progressPercentage)
    };
  }, [summary, isLoading]);
};