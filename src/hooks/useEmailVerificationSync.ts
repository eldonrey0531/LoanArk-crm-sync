// src/hooks/useEmailVerificationSync.ts

import { useState, useCallback, useEffect } from 'react';
import { useEmailVerificationRecords } from './useEmailVerificationRecords';
import HubSpotAuthService from '../services/hubspot-auth';
import { emailVerificationSyncService } from '../services/emailVerificationSyncService';
import {
  SupabaseContact,
  SyncStatus,
  UseEmailVerificationSyncReturn,
  GetEmailVerificationRecordsParams,
} from '../types/emailVerification';

/**
 * Custom hook for managing email verification sync operations
 *
 * This hook combines record loading with sync functionality, providing:
 * - Loading and displaying email verification records
 * - Syncing individual records to HubSpot
 * - Tracking sync status for each record
 * - Retry functionality for failed syncs
 * - Authentication handling
 */
export function useEmailVerificationSync(): UseEmailVerificationSyncReturn {
  const authService = HubSpotAuthService.getInstance();
  const isAuthenticated = authService.isAuthenticated();

  // Use the existing records hook for data fetching
  const recordsHook = useEmailVerificationRecords();

  // Local state for sync operations
  const [syncStatuses, setSyncStatuses] = useState<Record<number, SyncStatus>>(
    {}
  );
  const [syncErrors, setSyncErrors] = useState<Record<number, string>>({});

  // Initialize sync service (this would normally be done at app level)
  useEffect(() => {
    if (isAuthenticated) {
      // Import and initialize services dynamically to avoid circular dependencies
      import('../services/supabaseEmailVerificationService').then(
        ({ supabaseEmailVerificationService }) => {
          import('../services/hubspotEmailVerificationService').then(
            ({ hubspotEmailVerificationService }) => {
              import('../services/emailVerificationSyncService').then(
                ({ initializeEmailVerificationSyncService }) => {
                  initializeEmailVerificationSyncService(
                    supabaseEmailVerificationService,
                    hubspotEmailVerificationService
                  );
                }
              );
            }
          );
        }
      );
    }
  }, [isAuthenticated]);

  /**
   * Load records with optional parameters
   */
  const loadRecords = useCallback(
    async (params?: GetEmailVerificationRecordsParams) => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      try {
        // Use the existing hook's refetch functionality
        await recordsHook.refetch();
      } catch (error) {
        console.error('Error loading email verification records:', error);
        throw error;
      }
    },
    [isAuthenticated, recordsHook]
  );

  /**
   * Sync a single record to HubSpot
   */
  const syncRecord = useCallback(
    async (record: SupabaseContact) => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      if (!record.hs_object_id) {
        throw new Error('Record missing HubSpot object ID');
      }

      if (!record.email_verification_status) {
        throw new Error('Record missing email verification status');
      }

      // Set status to in_progress
      setSyncStatuses(prev => ({
        ...prev,
        [record.id]: 'in_progress',
      }));

      // Clear any previous errors
      setSyncErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[record.id];
        return newErrors;
      });

      try {
        // Perform the sync operation using the singleton service
        const result = await emailVerificationSyncService.syncToHubSpot(
          record.id,
          record.hs_object_id,
          record.email_verification_status
        );

        // Update status based on result
        setSyncStatuses(prev => ({
          ...prev,
          [record.id]: result.status,
        }));

        // If failed, store error message
        if (result.status === 'failed' && result.error) {
          setSyncErrors(prev => ({
            ...prev,
            [record.id]: result.error?.message || 'Sync failed',
          }));
        }
      } catch (error) {
        console.error(`Error syncing record ${record.id}:`, error);

        // Update status to failed
        setSyncStatuses(prev => ({
          ...prev,
          [record.id]: 'failed',
        }));

        // Store error message
        setSyncErrors(prev => ({
          ...prev,
          [record.id]:
            error instanceof Error ? error.message : 'Unknown sync error',
        }));

        throw error;
      }
    },
    [isAuthenticated]
  );

  /**
   * Retry a failed sync operation
   */
  const retrySync = useCallback(
    async (recordId: number) => {
      // Find the record in current data
      const record = recordsHook.data?.records.find(r => r.id === recordId);
      if (!record) {
        throw new Error(`Record ${recordId} not found`);
      }

      // Retry the sync
      await syncRecord(record);
    },
    [recordsHook.data?.records, syncRecord]
  );

  // Combine data from records hook with sync statuses
  const records = recordsHook.data?.records || [];
  const pagination = recordsHook.data?.pagination || {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  // Combine errors from both hooks
  const combinedError =
    recordsHook.error?.message ||
    (Object.keys(syncErrors).length > 0 ? 'Some sync operations failed' : null);

  return {
    records,
    isLoading: recordsHook.isLoading,
    error: combinedError,
    pagination,
    syncStatuses,
    syncErrors,
    loadRecords,
    syncRecord,
    retrySync,
  };
}
