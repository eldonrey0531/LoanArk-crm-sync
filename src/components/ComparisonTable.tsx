// src/components/ComparisonTable.tsx

/**
 * Comparison Table Component
 *
 * Displays contact comparison data in a tabular format with pagination,
 * selection, and action capabilities.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Minus,
  Loader2,
  Database,
  ArrowRightLeft
} from 'lucide-react';

// Import child components
import { LoadingState } from './LoadingState';
import { ErrorDisplay } from './ErrorDisplay';
import { PaginationControls } from './PaginationControls';

// Import types
import {
  ComparisonTableProps,
  ContactComparison,
  TableFilters
} from '@/types/emailVerificationDataDisplay';

// Import accessibility utilities
import {
  generateTableAriaLabels,
  generateStatusDescriptions,
  generateLiveAnnouncements,
  createAccessibleTableProps,
  createAccessibleRowProps,
  createAccessibleCellProps,
  createAccessibleButtonProps,
  announceToScreenReader,
  focusManagement
} from '@/utils/accessibility';

// Import keyboard navigation hook
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  data,
  loading,
  error,
  pagination,
  onPageChange,
  onRetry,
  onRefresh,
  onExport,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  filters,
  onFiltersChange,
  compact = false,
  className
}) => {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const tableRef = useRef<HTMLTableElement>(null);

  // Generate ARIA labels
  const ariaLabels = generateTableAriaLabels();
  const statusDescriptions = generateStatusDescriptions();

  // Keyboard navigation setup
  const { containerRef, focusFirst, focusNext, focusPrevious } = useKeyboardNavigation({
    enabled: true,
    direction: 'vertical',
    loop: false,
    onEnter: (element) => {
      // Handle Enter key on table rows
      if (element.closest('[role="row"]') && selectable) {
        const row = element.closest('[role="row"]');
        const checkbox = row?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (checkbox) {
          checkbox.click();
        }
      }
    },
    onSpace: (element) => {
      // Handle Space key on table rows
      if (element.closest('[role="row"]') && selectable) {
        const row = element.closest('[role="row"]');
        const checkbox = row?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (checkbox) {
          checkbox.click();
        }
      }
    },
    onEscape: () => {
      // Handle Escape key - could close any open menus or clear selection
      if (selectedIds.length > 0 && onSelectionChange) {
        onSelectionChange([]);
        announceToScreenReader('Selection cleared');
      }
    }
  });

  // Announce data changes to screen readers
  useEffect(() => {
    if (!loading && data.length > 0) {
      announceToScreenReader(generateLiveAnnouncements.loaded(data.length), 'polite');
    }
  }, [data.length, loading]);

  // Announce loading state
  useEffect(() => {
    if (loading) {
      announceToScreenReader(generateLiveAnnouncements.loading('contact comparison data'), 'polite');
    }
  }, [loading]);

  // Announce errors
  useEffect(() => {
    if (error) {
      announceToScreenReader(generateLiveAnnouncements.error(error), 'assertive');
    }
  }, [error]);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = data.map(item => item.id);
      onSelectionChange?.(allIds);
    } else {
      onSelectionChange?.([]);
    }
  };

  // Handle individual selection
  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedIds, id]);
    } else {
      onSelectionChange?.(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);

    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        sortBy: field,
        sortOrder: newDirection
      } as TableFilters);
    }
  };

  // Get status icon and color
  const getStatusDisplay = (status: ContactComparison['match_status']) => {
    switch (status) {
      case 'matched':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          label: 'Matched'
        };
      case 'supabase_only':
        return {
          icon: <Minus className="h-4 w-4" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          label: 'Supabase Only'
        };
      case 'hubspot_only':
        return {
          icon: <Minus className="h-4 w-4" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          label: 'HubSpot Only'
        };
      case 'mismatch':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          label: 'Mismatch'
        };
      default:
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          label: 'Unknown'
        };
    }
  };

  // Show loading state
  if (loading && data.length === 0) {
    return (
      <LoadingState
        type="table"
        message="Loading comparison data..."
        className={className}
      />
    );
  }

  // Show error state
  if (error && data.length === 0) {
    return (
      <ErrorDisplay
        error={error}
        type="network"
        onRetry={onRetry}
        className={className}
      />
    );
  }

  return (
    <Card className={className} ref={containerRef as React.Ref<HTMLDivElement>}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Contact Comparison Data</CardTitle>
          <div className="flex items-center gap-2">
            {onExport && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport('csv')}
                  disabled={loading}
                  {...createAccessibleButtonProps('Export as CSV', 'Export current data as CSV file')}
                >
                  <Download className="h-4 w-4 mr-1" aria-hidden="true" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport('json')}
                  disabled={loading}
                  {...createAccessibleButtonProps('Export as JSON', 'Export current data as JSON file')}
                >
                  <Download className="h-4 w-4 mr-1" aria-hidden="true" />
                  JSON
                </Button>
              </div>
            )}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                {...createAccessibleButtonProps(
                  loading ? 'Refreshing data' : 'Refresh data',
                  'Reload the current data from the server'
                )}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            )}
          </div>
        </div>
        {/* Status summary for screen readers */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {data.length > 0 && `Showing ${data.length} of ${pagination?.total || 0} contacts`}
          {selectedIds.length > 0 && `, ${selectedIds.length} selected`}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table
            {...createAccessibleTableProps(
              ariaLabels.table,
              `Table showing contact comparison data with ${data.length} rows and ${pagination?.total || 0} total records`,
              loading
            )}
            ref={tableRef}
          >
            <TableHeader>
              <TableRow role="row">
                {selectable && (
                  <TableHead
                    {...createAccessibleCellProps('Select all rows', true)}
                    className="w-12"
                  >
                    <Checkbox
                      checked={selectedIds.length === data.length && data.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label={selectedIds.length === data.length ? 'Deselect all rows' : 'Select all rows'}
                    />
                  </TableHead>
                )}
                {/* Supabase Columns */}
                <TableHead
                  {...createAccessibleCellProps('Supabase contact name', true)}
                  className="text-center border-r-2 border-gray-300 bg-blue-50"
                  colSpan={3}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-700">Supabase</span>
                  </div>
                </TableHead>
                {/* HubSpot Columns */}
                <TableHead
                  {...createAccessibleCellProps('HubSpot contact data', true)}
                  className="text-center bg-green-50"
                  colSpan={3}
                >
                  <div className="flex items-center justify-center gap-2">
                    <ArrowRightLeft className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-700">HubSpot</span>
                  </div>
                </TableHead>
              </TableRow>
              <TableRow role="row">
                {selectable && <TableHead />}
                {/* Supabase Sub-headers */}
                <TableHead
                  {...createAccessibleCellProps('Supabase contact name', true)}
                  className="text-center bg-blue-50 font-medium text-blue-700 border-r border-gray-200"
                >
                  Name
                </TableHead>
                <TableHead
                  {...createAccessibleCellProps('Supabase HubSpot object ID', true)}
                  className="text-center bg-blue-50 font-medium text-blue-700 border-r border-gray-200"
                >
                  HS Object ID
                </TableHead>
                <TableHead
                  {...createAccessibleCellProps('Supabase email verification status', true)}
                  className="text-center bg-blue-50 font-medium text-blue-700 border-r-2 border-gray-300"
                >
                  Email Verification
                </TableHead>
                {/* HubSpot Sub-headers */}
                <TableHead
                  {...createAccessibleCellProps('HubSpot contact name', true)}
                  className="text-center bg-green-50 font-medium text-green-700 border-r border-gray-200"
                >
                  Name
                </TableHead>
                <TableHead
                  {...createAccessibleCellProps('HubSpot object ID', true)}
                  className="text-center bg-green-50 font-medium text-green-700 border-r border-gray-200"
                >
                  HS Object ID
                </TableHead>
                <TableHead
                  {...createAccessibleCellProps('HubSpot email verification status', true)}
                  className="text-center bg-green-50 font-medium text-green-700"
                >
                  Email Verification
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((comparison) => {
                const statusDisplay = getStatusDisplay(comparison.match_status);
                const isSelected = selectedIds.includes(comparison.id);
                const contactName = comparison.supabase?.name ||
                  `${comparison.hubspot?.properties?.firstname || ''} ${comparison.hubspot?.properties?.lastname || ''}`.trim() ||
                  'Unknown Contact';

                return (
                  <TableRow
                    key={comparison.id}
                    {...createAccessibleRowProps(
                      ariaLabels.row(comparison),
                      isSelected,
                      false
                    )}
                    className={`${isSelected ? 'bg-muted/50' : ''} ${compact ? 'py-2' : ''}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (selectable) {
                          handleSelectItem(comparison.id, !isSelected);
                        }
                      }
                    }}
                  >
                    {selectable && (
                      <TableCell {...createAccessibleCellProps('Select row')}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectItem(comparison.id, checked as boolean)}
                          aria-label={`${isSelected ? 'Deselect' : 'Select'} ${contactName}`}
                        />
                      </TableCell>
                    )}
                    {/* Supabase Data */}
                    <TableCell
                      {...createAccessibleCellProps(`Supabase name: ${comparison.supabase?.name || 'N/A'}`)}
                      className="bg-blue-50/30 border-r border-gray-200"
                    >
                      <span className="text-blue-700">
                        {comparison.supabase?.name || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell
                      {...createAccessibleCellProps(`Supabase HS Object ID: ${comparison.supabase?.hs_object_id || 'N/A'}`)}
                      className="bg-blue-50/30 border-r border-gray-200"
                    >
                      <span className="font-mono text-sm text-blue-700">
                        {comparison.supabase?.hs_object_id || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell
                      {...createAccessibleCellProps(`Supabase email verification: ${comparison.supabase?.email_verification_status || 'N/A'}`)}
                      className="bg-blue-50/30 border-r-2 border-gray-300"
                    >
                      <span className="font-mono text-sm text-blue-700">
                        {comparison.supabase?.email_verification_status || 'N/A'}
                      </span>
                    </TableCell>
                    {/* HubSpot Data */}
                    <TableCell
                      {...createAccessibleCellProps(`HubSpot name: ${comparison.hubspot ? `${comparison.hubspot.properties.firstname || ''} ${comparison.hubspot.properties.lastname || ''}`.trim() || 'N/A' : 'N/A'}`)}
                      className="bg-green-50/30 border-r border-gray-200"
                    >
                      <span className="text-green-700">
                        {comparison.hubspot
                          ? `${comparison.hubspot.properties.firstname || ''} ${comparison.hubspot.properties.lastname || ''}`.trim() || 'N/A'
                          : 'N/A'
                        }
                      </span>
                    </TableCell>
                    <TableCell
                      {...createAccessibleCellProps(`HubSpot HS Object ID: ${comparison.hubspot?.id || 'N/A'}`)}
                      className="bg-green-50/30 border-r border-gray-200"
                    >
                      <span className="font-mono text-sm text-green-700">
                        {comparison.hubspot?.id || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell
                      {...createAccessibleCellProps(`HubSpot email verification: ${comparison.hubspot?.properties.email_verification_status || 'N/A'}`)}
                      className="bg-green-50/30"
                    >
                      <span className="font-mono text-sm text-green-700">
                        {comparison.hubspot?.properties.email_verification_status || 'N/A'}
                      </span>
                    </TableCell>
                    {!compact && (
                      <TableCell {...createAccessibleCellProps(`Last sync: ${comparison.last_sync ? new Date(comparison.last_sync).toLocaleDateString() : 'Never'}`)}>
                        {comparison.last_sync ? (
                          <span className="text-sm text-muted-foreground">
                            {new Date(comparison.last_sync).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4" aria-label={ariaLabels.pagination}>
          <PaginationControls
            pagination={pagination}
            onPageChange={onPageChange}
            showPageSizeSelector={true}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </div>

        {/* Selection summary */}
        {selectedIds.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground" aria-live="polite">
            {selectedIds.length} of {data.length} records selected
          </div>
        )}
      </CardContent>
    </Card>
  );
};