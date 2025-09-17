// src/hooks/useEmailVerificationRecords.ts

import { useQuery } from '@tanstack/react-query';
import HubSpotAuthService from '../services/hubspot-auth';
import {
  SupabaseContact,
  GetEmailVerificationRecordsParams,
  PaginationInfo,
  GetEmailVerificationRecordsResponse
} from '@/types/emailVerification';

interface UseEmailVerificationRecordsReturn {
  data: {
    records: SupabaseContact[];
    pagination: PaginationInfo;
  } | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
  isAuthenticated: boolean;
}

/**
 * Custom hook for fetching email verification records with React Query caching
 * Includes authentication handling and proper error management
 */
export function useEmailVerificationRecords(
  params: GetEmailVerificationRecordsParams = {}
): UseEmailVerificationRecordsReturn {
  const authService = HubSpotAuthService.getInstance();
  const isAuthenticated = authService.isAuthenticated();

  const queryKey = ['email-verification-records', params, isAuthenticated];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<{ records: SupabaseContact[]; pagination: PaginationInfo }> => {
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
      if (params.page) queryParams.set('page', params.page.toString());
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.sortBy) queryParams.set('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);

      // Make API call to Netlify function with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`/.netlify/functions/email-verification-records?${queryParams}`, {
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
          throw new Error(`Failed to fetch records: ${response.status} ${response.statusText}`);
        }
      }

      const result: GetEmailVerificationRecordsResponse = await response.json();

      if (result.success && result.data) {
        return result.data;
      } else {
        const errorMessage = result.error?.message || 'Failed to fetch records';
        throw new Error(errorMessage);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof Error && (
        error.message.includes('Authentication failed') ||
        error.message.includes('not authenticated') ||
        error.message.includes('401')
      )) {
        return false;
      }

      // Don't retry on 4xx errors (except 408, 429)
      if (error instanceof Error && error.message.includes('4') &&
          !error.message.includes('408') && !error.message.includes('429')) {
        return false;
      }

      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: isAuthenticated, // Only run query if user is authenticated
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
    isAuthenticated,
  };
}