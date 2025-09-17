// src/components/EmailVerificationDataDisplay.tsx

/**
 * Email Verification Data Display Component
 *
 * Main container component for the Email Verification Data Display feature.
 * Orchestrates data fetching, state management, and renders child components.
 */

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

// Import child components
import { ComparisonTable } from './ComparisonTable';
import { FilterControls } from './FilterControls';
import { SummaryStats } from './SummaryStats';
import { LoadingState } from './LoadingState';
import { ErrorDisplay } from './ErrorDisplay';

// Import types
import {
  EmailVerificationDataDisplayProps,
  ContactComparison,
  TableFilters,
  ComparisonResponse,
} from '@/types/emailVerificationDataDisplay';

// Import custom hooks
import {
  useComparisonData,
  useComparisonDataMutation,
} from '@/hooks/useComparisonData';
import {
  useComparisonFilters,
  useComparisonSelection,
} from '@/hooks/useComparisonFilters';

export const EmailVerificationDataDisplay: React.FC<
  EmailVerificationDataDisplayProps
> = ({
  initialPageSize = 25,
  showFilters = true,
  showSummary = true,
  className,
  onRecordSelect,
  onError,
  onLoadingChange,
  theme = 'light',
}) => {
  // Use custom hooks for state management
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
  } = useComparisonFilters({
    initialPageSize,
    onFiltersChange: newFilters => {
      // Filters changed, data will be refetched automatically
    },
    onPageChange: newPage => {
      // Page changed, data will be refetched automatically
    },
    onPageSizeChange: newPageSize => {
      // Page size changed, data will be refetched automatically
    },
  });

  const {
    selectedIds,
    setSelectedIds,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    hasSelection,
    selectionCount,
  } = useComparisonSelection({
    onSelectionChange: selectedIds => {
      // Selection changed
    },
  });

  // Use React Query for data fetching
  const {
    data,
    summary,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useComparisonData({
    filters,
    page,
    pageSize,
    enabled: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { invalidateComparisonData } = useComparisonDataMutation();

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading || isRefetching);
  }, [isLoading, isRefetching, onLoadingChange]);

  // Notify parent of errors
  useEffect(() => {
    if (isError && error && onError) {
      onError(error.message);
    }
  }, [isError, error, onError]);

  /**
   * Handle filter changes
   */
  const handleFiltersChange = (newFilters: TableFilters) => {
    setFilters(newFilters);
  };

  /**
   * Handle filter reset
   */
  const handleFiltersReset = () => {
    resetFilters();
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  /**
   * Handle page size change
   */
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  /**
   * Handle selection changes
   */
  const handleSelectionChange = (newSelectedIds: string[]) => {
    setSelectedIds(newSelectedIds);
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    invalidateComparisonData();
    refetch();
  };

  /**
   * Handle export
   */
  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    // TODO: Implement export functionality
    console.log(`Exporting data as ${format}`);
  };

  /**
   * Handle retry
   */
  const handleRetry = () => {
    refetch();
  };

  // Show loading state
  if (isLoading && (!data || data.length === 0)) {
    return (
      <LoadingState
        type='table'
        message='Loading contact comparison data...'
        className={className}
      />
    );
  }

  // Show error state
  if (isError && (!data || data.length === 0)) {
    return (
      <ErrorDisplay
        error={error?.message || 'Failed to load data'}
        type='network'
        onRetry={handleRetry}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Summary Statistics */}
      {showSummary && (
        <SummaryStats
          summary={summary}
          totalRecords={pagination.total}
          showPercentages={true}
          compact={false}
        />
      )}

      {/* Filters */}
      {showFilters && (
        <FilterControls
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleFiltersReset}
          showSearch={true}
          showStatusFilter={true}
          showDateFilter={false}
        />
      )}

      {/* Data Table */}
      <ComparisonTable
        data={data || []}
        loading={isLoading || isRefetching}
        error={isError ? error?.message || 'An error occurred' : null}
        pagination={
          pagination || {
            page: 1,
            page_size: pageSize,
            total: 0,
            has_next: false,
            has_previous: false,
          }
        }
        onPageChange={handlePageChange}
        onRetry={handleRetry}
        onRefresh={handleRefresh}
        onExport={handleExport}
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        compact={false}
      />

      {/* Action Bar */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          {hasSelection && (
            <span>
              {selectionCount} record{selectionCount !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={isLoading || isRefetching}
          >
            {isLoading || isRefetching ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <RefreshCw className='h-4 w-4' />
            )}
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};
