// src/components/PaginationControls.tsx

/**
 * Pagination Controls Component
 *
 * Provides navigation controls for paginated data with page size selection.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

// Import types
import { PaginationControlsProps } from '@/types/emailVerificationDataDisplay';

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = false,
  pageSizeOptions = [10, 25, 50, 100],
  className
}) => {
  const {
    page,
    page_size,
    total,
    has_next,
    has_previous
  } = pagination;

  const totalPages = Math.ceil(total / page_size);
  const startItem = (page - 1) * page_size + 1;
  const endItem = Math.min(page * page_size, total);

  const handleFirstPage = () => {
    if (has_previous) {
      onPageChange(1);
    }
  };

  const handlePreviousPage = () => {
    if (has_previous) {
      onPageChange(page - 1);
    }
  };

  const handleNextPage = () => {
    if (has_next) {
      onPageChange(page + 1);
    }
  };

  const handleLastPage = () => {
    if (has_next) {
      onPageChange(totalPages);
    }
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize, 10);
    if (onPageSizeChange) {
      onPageSizeChange(size);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (page <= 3) {
        // Near the start
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        // Near the end
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // In the middle
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }

    return pages;
  };

  if (total === 0) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between ${className || ''}`}>
      {/* Results info */}
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {total} results
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Page size selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={page_size.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          {/* First page */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleFirstPage}
            disabled={!has_previous}
            className="px-2"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={!has_previous}
            className="px-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((pageNum, index) => (
              <React.Fragment key={index}>
                {pageNum === '...' ? (
                  <span className="px-2 py-1 text-sm text-muted-foreground">...</span>
                ) : (
                  <Button
                    variant={pageNum === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNum as number)}
                    className="min-w-8 px-2"
                  >
                    {pageNum}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next page */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!has_next}
            className="px-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLastPage}
            disabled={!has_next}
            className="px-2"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};