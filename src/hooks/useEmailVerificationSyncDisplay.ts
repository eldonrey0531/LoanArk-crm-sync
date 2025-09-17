// src/hooks/useEmailVerificationSyncDisplay.ts

import { useQuery } from '@tanstack/react-query';
import HubSpotAuthService from '../services/hubspot-auth';
import {
  ContactComparison,
  ComparisonResponse,
  TableFilters
} from '@/types/emailVerificationDataDisplay';

interface UseEmailVerificationSyncDisplayReturn {
  data: ContactComparison[] | undefined;
  summary: ComparisonResponse['summary'] | undefined;
  pagination: ComparisonResponse['pagination'] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
  isAuthenticated: boolean;
}

/**
 * Custom hook for fetching email verification sync display data with React Query caching
 * Fetches both Supabase and HubSpot data for side-by-side comparison
 */
export function useEmailVerificationSyncDisplay(
  filters: TableFilters = { search: '', status: 'all' }
): UseEmailVerificationSyncDisplayReturn {
  const authService = HubSpotAuthService.getInstance();
  const isAuthenticated = authService.isAuthenticated();

  const queryKey = ['email-verification-sync-display', filters, isAuthenticated];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<ComparisonResponse> => {
      // Check authentication first
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      // Get authentication header
      const authHeader = await authService.getAuthHeader();
      if (!authHeader) {
        throw new Error('Failed to get authentication token');
      }

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (filters.page) queryParams.set('page', filters.page.toString());
      if (filters.pageSize) queryParams.set('limit', filters.pageSize.toString());
      if (filters.status && filters.status !== 'all') queryParams.set('status', filters.status);

      // Make API call to combined sync display endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`/.netlify/functions/email-verification-sync-display?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader, // Include authentication header
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle specific HTTP status codes
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Insufficient permissions.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Failed to fetch sync display data: ${response.status} ${response.statusText}`);
        }
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch data');
      }

      // Transform API response to expected format
      const apiData = result.data;

      // Combine all records into ContactComparison format
      const allComparisons: ContactComparison[] = [
        // Matched records
        ...apiData.matchedRecords.map((match: any) => ({
          id: match.supabase?.hs_object_id || match.hubspot?.id || `match-${Date.now()}`,
          supabase: match.supabase,
          hubspot: match.hubspot,
          match_status: 'matched' as const,
          differences: [],
          last_sync: apiData.metadata?.lastSync
        })),
        // Supabase-only records
        ...apiData.unmatchedRecords.supabaseOnly.map((record: any) => ({
          id: record.hs_object_id || `supabase-${record.id}`,
          supabase: record,
          hubspot: null,
          match_status: 'supabase_only' as const,
          differences: [],
          last_sync: apiData.metadata?.lastSync
        })),
        // HubSpot-only records
        ...apiData.unmatchedRecords.hubspotOnly.map((record: any) => ({
          id: record.id,
          supabase: null,
          hubspot: record,
          match_status: 'hubspot_only' as const,
          differences: [],
          last_sync: apiData.metadata?.lastSync
        }))
      ];

      return {
        data: allComparisons,
        summary: {
          total_matched: apiData.metadata?.matchedCount || 0,
          total_supabase_only: apiData.unmatchedRecords?.supabaseOnly?.length || 0,
          total_hubspot_only: apiData.unmatchedRecords?.hubspotOnly?.length || 0,
          total_mismatches: 0
        },
        pagination: apiData.pagination
      } as ComparisonResponse;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('Authentication failed') ||
          error.message.includes('not authenticated')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    data: query.data?.data,
    summary: query.data?.summary,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
    isAuthenticated,
  };
}