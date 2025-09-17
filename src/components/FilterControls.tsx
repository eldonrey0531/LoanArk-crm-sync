// src/components/FilterControls.tsx

/**
 * Filter Controls Component
 *
 * Provides filtering and search controls for the data display.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Search,
  Filter,
  X,
  Calendar as CalendarIcon,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';

// Import types
import { FilterControlsProps, TableFilters } from '@/types/emailVerificationDataDisplay';

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange,
  onReset,
  showSearch = true,
  showStatusFilter = true,
  showDateFilter = false,
  className
}) => {
  const [searchValue, setSearchValue] = useState(filters.search);
  const [statusValue, setStatusValue] = useState(filters.status);
  const [startDate, setStartDate] = useState<Date | undefined>(filters.dateRange?.start);
  const [endDate, setEndDate] = useState<Date | undefined>(filters.dateRange?.end);

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        handleFiltersChange({ ...filters, search: searchValue });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, filters, handleFiltersChange]);

  const handleFiltersChange = (newFilters: TableFilters) => {
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleStatusChange = (value: string) => {
    const status = value as TableFilters['status'];
    setStatusValue(status);
    handleFiltersChange({
      ...filters,
      status
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    handleFiltersChange({
      ...filters,
      dateRange: {
        start: date,
        end: endDate
      }
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    handleFiltersChange({
      ...filters,
      dateRange: {
        start: startDate,
        end: date
      }
    });
  };

  const handleClearDateRange = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    handleFiltersChange({
      ...filters,
      dateRange: undefined
    });
  };

  const handleReset = () => {
    setSearchValue('');
    setStatusValue('all');
    setStartDate(undefined);
    setEndDate(undefined);
    onReset();
  };

  const hasActiveFilters = filters.search ||
                          filters.status !== 'all' ||
                          filters.dateRange?.start ||
                          filters.dateRange?.end;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="ml-auto"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          {showSearch && (
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
                {searchValue && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSearchChange('')}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Status Filter */}
          {showStatusFilter && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusValue} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="matched">Matched</SelectItem>
                  <SelectItem value="supabase_only">Supabase Only</SelectItem>
                  <SelectItem value="hubspot_only">HubSpot Only</SelectItem>
                  <SelectItem value="mismatch">Mismatches</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Range - Start Date */}
          {showDateFilter && (
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Date Range - End Date */}
          {showDateFilter && (
            <div className="space-y-2">
              <Label>End Date</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {(startDate || endDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearDateRange}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                  <span>Search: "{filters.search}"</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSearchChange('')}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {filters.status !== 'all' && (
                <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                  <span>Status: {filters.status.replace('_', ' ')}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange('all')}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {filters.dateRange?.start && (
                <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                  <span>From: {format(filters.dateRange.start, 'PP')}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartDateChange(undefined)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {filters.dateRange?.end && (
                <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                  <span>To: {format(filters.dateRange.end, 'PP')}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEndDateChange(undefined)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};