// src/components/SyncFilters.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { GetEmailVerificationRecordsParams } from '@/types/emailVerification';

interface SyncFiltersProps {
  filters: GetEmailVerificationRecordsParams;
  onFiltersChange: (filters: GetEmailVerificationRecordsParams) => void;
}

/**
 * Component for filtering sync operations and records
 */
export function SyncFilters({ filters, onFiltersChange }: SyncFiltersProps) {
  const updateFilter = (key: keyof GetEmailVerificationRecordsParams, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value =>
    value !== undefined && value !== null && value !== ''
  );

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Filter className="w-4 h-4 mr-2" />
        Filters
      </Button>

      {/* Page Size */}
      <div className="flex items-center gap-2">
        <Label htmlFor="pageSize" className="text-sm">Show:</Label>
        <Select
          value={filters.limit?.toString() || '25'}
          onValueChange={(value) => updateFilter('limit', parseInt(value))}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort By */}
      <div className="flex items-center gap-2">
        <Label htmlFor="sortBy" className="text-sm">Sort:</Label>
        <Select
          value={filters.sortBy || 'updated_at'}
          onValueChange={(value) => updateFilter('sortBy', value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">Updated</SelectItem>
            <SelectItem value="created_at">Created</SelectItem>
            <SelectItem value="firstname">First Name</SelectItem>
            <SelectItem value="lastname">Last Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Order */}
      <div className="flex items-center gap-2">
        <Select
          value={filters.sortOrder || 'desc'}
          onValueChange={(value) => updateFilter('sortOrder', value)}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">↑ Asc</SelectItem>
            <SelectItem value="desc">↓ Desc</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" />
          Clear
        </Button>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1 ml-4">
          <span className="text-sm text-muted-foreground">Active:</span>
          {filters.limit && filters.limit !== 25 && (
            <Badge variant="secondary" className="text-xs">
              {filters.limit} per page
            </Badge>
          )}
          {filters.sortBy && filters.sortBy !== 'updated_at' && (
            <Badge variant="secondary" className="text-xs">
              Sort: {filters.sortBy}
            </Badge>
          )}
          {filters.sortOrder && filters.sortOrder !== 'desc' && (
            <Badge variant="secondary" className="text-xs">
              Order: {filters.sortOrder}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}