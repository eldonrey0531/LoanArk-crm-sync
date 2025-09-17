// src/hooks/useSyncStatus.ts

import { useQuery } from '@tanstack/react-query';
import HubSpotAuthService from '../services/hubspot-auth';
import { SyncOperation } from '../types/emailVerification';

interface SyncStatusData {
  operations?: SyncOperation[];
  operation?: SyncOperation;
  summary?: {
    total: number;
    completed: number;
    inProgress: number;
    failed: number;
    pending: number;
  };
}

interface UseSyncStatusReturn {
  operations: SyncOperation[] | undefined;
  operation: SyncOperation | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
  summary:
    | {
        total: number;
        completed: number;
        inProgress: number;
        failed: number;
        pending: number;
      }
    | undefined;
}

/**
 * Custom hook for monitoring sync operation status
 *
 * Can monitor all operations or a specific operation by ID
 */
export function useSyncStatus(operationId?: string): UseSyncStatusReturn {
  const authService = HubSpotAuthService.getInstance();
  const isAuthenticated = authService.isAuthenticated();

  const query = useQuery<SyncStatusData>({
    queryKey: operationId ? ['sync-status', operationId] : ['sync-status'],
    queryFn: async () => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      // Get authentication header
      const authHeader = await authService.getAuthHeader();
      if (!authHeader) {
        throw new Error('Failed to get authentication token');
      }

      // Make API call to Netlify function with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const url = operationId
        ? `/.netlify/functions/sync-status/${operationId}`
        : `/.netlify/functions/sync-status`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404 && operationId) {
          throw new Error(`Operation with ID ${operationId} not found`);
        }
        throw new Error(`Failed to fetch sync status: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch sync status');
      }

      return result.data;
    },
    enabled: isAuthenticated,
    staleTime: operationId ? 30 * 1000 : 2 * 60 * 1000, // 30 seconds for specific operation, 2 minutes for all
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (except 429)
      if (error instanceof Error) {
        if (error.message.includes('not found')) return false;
        if (error.message.includes('401') || error.message.includes('403'))
          return false;
      }
      return failureCount < 3;
    },
    refetchInterval: query => {
      // Auto-refresh for operations that are still in progress
      const data = query.state.data;
      if (operationId && data?.operation) {
        const status = data.operation.status;
        if (status === 'in_progress' || status === 'pending') {
          return 5000; // Refresh every 5 seconds
        }
      } else if (data?.operations) {
        // Check if any operations are still in progress
        const hasInProgress = data.operations.some(
          (op: SyncOperation) =>
            op.status === 'in_progress' || op.status === 'pending'
        );
        if (hasInProgress) {
          return 10000; // Refresh every 10 seconds
        }
      }
      return false; // No auto-refresh
    },
  });

  // Extract data based on whether we're fetching all operations or a specific one
  const operations = operationId ? undefined : query.data?.operations;
  const operation = operationId ? query.data?.operation : undefined;
  const summary = operationId ? undefined : query.data?.summary;

  return {
    operations,
    operation,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
    summary,
  };
}
