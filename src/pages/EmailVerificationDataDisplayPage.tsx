// src/pages/EmailVerificationDataDisplayPage.tsx

/**
 * Email Verification Data Display Page
 *
 * Main page component for the Email Verification Data Display feature.
 * Provides a comprehensive view of contact data comparison between Supabase and HubSpot.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw,
  Database,
  ArrowRightLeft,
  Loader2,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import our new components (to be created)
import { EmailVerificationDataDisplay } from '@/components/EmailVerificationDataDisplay';
import { ComparisonTable } from '@/components/ComparisonTable';
import { FilterControls } from '@/components/FilterControls';
import { SummaryStats } from '@/components/SummaryStats';

// Import types
import {
  ContactComparison,
  TableFilters,
  ComparisonResponse
} from '@/types/emailVerificationDataDisplay';

// Import services
import { comparisonApiService } from '@/services/comparisonApiService';

export default function EmailVerificationDataDisplayPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<ContactComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TableFilters>({
    search: '',
    status: 'all'
  });
  const [summary, setSummary] = useState<ComparisonResponse['summary']>({
    total_matched: 0,
    total_supabase_only: 0,
    total_hubspot_only: 0,
    total_mismatches: 0
  });
  const [pagination, setPagination] = useState<ComparisonResponse['pagination']>({
    page: 1,
    page_size: 25,
    total: 0,
    has_next: false,
    has_previous: false
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [showSummary, setShowSummary] = useState(true);

  const { toast } = useToast();

  // Load data on component mount and when filters change
  useEffect(() => {
    loadData();
  }, [filters]);

  /**
   * Load comparison data from the API
   */
  const loadData = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const request = {
        page,
        page_size: pagination.page_size,
        filter_status: filters.status,
        search: filters.search || undefined
      };

      const response = await comparisonApiService.fetchComparison(request);

      if (response.success) {
        setData(response.data);
        setSummary(response.summary);
        setPagination(response.pagination);
      } else {
        setError(response.error || 'Failed to load data');
        toast({
          title: 'Error',
          description: response.error || 'Failed to load comparison data',
          variant: 'destructive'
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle page change
   */
  const handlePageChange = (page: number) => {
    loadData(page);
  };

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
    setFilters({
      search: '',
      status: 'all'
    });
  };

  /**
   * Handle selection changes
   */
  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedIds(selectedIds);
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    loadData(pagination.page);
  };

  /**
   * Handle export
   */
  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    // TODO: Implement export functionality
    toast({
      title: 'Export',
      description: `Exporting data as ${format.toUpperCase()}...`,
    });
  };

  /**
   * Handle record selection
   */
  const handleRecordSelect = (comparison: ContactComparison) => {
    toast({
      title: 'Record Selected',
      description: `Selected comparison for ${comparison.supabase?.name || comparison.hubspot?.properties.firstname || 'Unknown'}`,
    });
  };

  /**
   * Handle errors
   */
  const handleError = (error: string) => {
    setError(error);
    toast({
      title: 'Error',
      description: error,
      variant: 'destructive'
    });
  };

  /**
   * Handle loading state changes
   */
  const handleLoadingChange = (loading: boolean) => {
    setLoading(loading);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Verification Data Display</h1>
          <p className="text-muted-foreground">
            Compare contact data between Supabase and HubSpot with email verification status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSummary(!showSummary)}
          >
            {showSummary ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showSummary ? 'Hide' : 'Show'} Summary
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      {showSummary && (
        <SummaryStats
          summary={summary}
          totalRecords={pagination.total}
          showPercentages={true}
          compact={false}
        />
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="table">Data Table</TabsTrigger>
          <TabsTrigger value="comparison">Side-by-Side</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{summary.total_matched}</div>
                  <div className="text-sm text-muted-foreground">Matched</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{summary.total_supabase_only}</div>
                  <div className="text-sm text-muted-foreground">Supabase Only</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{summary.total_hubspot_only}</div>
                  <div className="text-sm text-muted-foreground">HubSpot Only</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{summary.total_mismatches}</div>
                  <div className="text-sm text-muted-foreground">Mismatches</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
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
            data={data}
            loading={loading}
            error={error}
            pagination={pagination}
            onPageChange={handlePageChange}
            onRetry={handleRefresh}
            onRefresh={handleRefresh}
            onExport={handleExport}
            selectable={true}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            compact={false}
          />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          {/* Full Email Verification Data Display */}
          <EmailVerificationDataDisplay
            initialPageSize={25}
            showFilters={showFilters}
            showSummary={false}
            onRecordSelect={handleRecordSelect}
            onError={handleError}
            onLoadingChange={handleLoadingChange}
            theme="light"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}