// src/hooks/useComparisonFilters.ts

/**
 * Custom hook for managing comparison filters and pagination state
 */

import { useState, useCallback, useMemo } from 'react';

// Import types
import {
  TableFilters,
  ComparisonResponse,
} from '@/types/emailVerificationDataDisplay';

export interface UseComparisonFiltersOptions {
  initialFilters?: Partial<TableFilters>;
  initialPage?: number;
  initialPageSize?: number;
  onFiltersChange?: (filters: TableFilters) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export interface UseComparisonFiltersReturn {
  filters: TableFilters;
  page: number;
  pageSize: number;
  setFilters: (filters: TableFilters) => void;
  updateFilters: (updates: Partial<TableFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetPagination: () => void;
  hasActiveFilters: boolean;
  filterCount: number;
}

/**
 * Hook for managing comparison filters and pagination
 */
export const useComparisonFilters = ({
  initialFilters = {},
  initialPage = 1,
  initialPageSize = 25,
  onFiltersChange,
  onPageChange,
  onPageSizeChange,
}: UseComparisonFiltersOptions = {}): UseComparisonFiltersReturn => {
  // Initialize filters
  const [filters, setFiltersState] = useState<TableFilters>({
    search: '',
    status: 'all',
    ...initialFilters,
  });

  // Initialize pagination
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  // Set filters with callback
  const setFilters = useCallback(
    (newFilters: TableFilters) => {
      setFiltersState(newFilters);
      onFiltersChange?.(newFilters);
      // Reset to first page when filters change
      setPageState(1);
      onPageChange?.(1);
    },
    [onFiltersChange, onPageChange]
  );

  // Update filters partially
  const updateFilters = useCallback(
    (updates: Partial<TableFilters>) => {
      const newFilters = { ...filters, ...updates };
      setFilters(newFilters);
    },
    [filters, setFilters]
  );

  // Reset filters to default
  const resetFilters = useCallback(() => {
    const defaultFilters: TableFilters = {
      search: '',
      status: 'all',
    };
    setFilters(defaultFilters);
  }, [setFilters]);

  // Set page with callback
  const setPage = useCallback(
    (newPage: number) => {
      setPageState(newPage);
      onPageChange?.(newPage);
    },
    [onPageChange]
  );

  // Set page size with callback
  const setPageSize = useCallback(
    (newPageSize: number) => {
      setPageSizeState(newPageSize);
      onPageSizeChange?.(newPageSize);
      // Reset to first page when page size changes
      setPageState(1);
      onPageChange?.(1);
    },
    [onPageSizeChange, onPageChange]
  );

  // Reset pagination
  const resetPagination = useCallback(() => {
    setPageState(1);
    setPageSizeState(initialPageSize);
    onPageChange?.(1);
    onPageSizeChange?.(initialPageSize);
  }, [initialPageSize, onPageChange, onPageSizeChange]);

  // Check if there are active filters
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search.trim() !== '' ||
      filters.status !== 'all' ||
      !!filters.dateRange?.start ||
      !!filters.dateRange?.end
    );
  }, [filters]);

  // Count active filters
  const filterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim() !== '') count++;
    if (filters.status !== 'all') count++;
    if (filters.dateRange?.start) count++;
    if (filters.dateRange?.end) count++;
    return count;
  }, [filters]);

  return {
    filters,
    page,
    pageSize,
    setFilters,
    updateFilters,
    resetFilters,
    setPage,
    setPageSize,
    resetPagination,
    hasActiveFilters,
    filterCount,
  };
};

/**
 * Hook for managing selected items in comparison table
 */
export interface UseComparisonSelectionOptions {
  initialSelectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export interface UseComparisonSelectionReturn {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleItem: (id: string) => void;
  selectAll: (allIds: string[]) => void;
  deselectAll: () => void;
  isSelected: (id: string) => boolean;
  hasSelection: boolean;
  selectionCount: number;
}

export const useComparisonSelection = ({
  initialSelectedIds = [],
  onSelectionChange,
}: UseComparisonSelectionOptions = {}): UseComparisonSelectionReturn => {
  const [selectedIds, setSelectedIdsState] =
    useState<string[]>(initialSelectedIds);

  const setSelectedIds = useCallback(
    (ids: string[]) => {
      setSelectedIdsState(ids);
      onSelectionChange?.(ids);
    },
    [onSelectionChange]
  );

  const selectItem = useCallback(
    (id: string) => {
      setSelectedIdsState(prev => {
        if (prev.includes(id)) return prev;
        const newIds = [...prev, id];
        onSelectionChange?.(newIds);
        return newIds;
      });
    },
    [onSelectionChange]
  );

  const deselectItem = useCallback(
    (id: string) => {
      setSelectedIdsState(prev => {
        const newIds = prev.filter(selectedId => selectedId !== id);
        onSelectionChange?.(newIds);
        return newIds;
      });
    },
    [onSelectionChange]
  );

  const toggleItem = useCallback(
    (id: string) => {
      setSelectedIdsState(prev => {
        const newIds = prev.includes(id)
          ? prev.filter(selectedId => selectedId !== id)
          : [...prev, id];
        onSelectionChange?.(newIds);
        return newIds;
      });
    },
    [onSelectionChange]
  );

  const selectAll = useCallback(
    (allIds: string[]) => {
      setSelectedIds(allIds);
    },
    [setSelectedIds]
  );

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, [setSelectedIds]);

  const isSelected = useCallback(
    (id: string) => {
      return selectedIds.includes(id);
    },
    [selectedIds]
  );

  const hasSelection = selectedIds.length > 0;
  const selectionCount = selectedIds.length;

  return {
    selectedIds,
    setSelectedIds,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    isSelected,
    hasSelection,
    selectionCount,
  };
};
