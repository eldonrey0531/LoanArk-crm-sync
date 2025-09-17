// src/services/emailVerificationSyncService.ts

/**
 * Email Verification Sync Service
 *
 * This service orchestrates the synchronization of email verification status
 * from Supabase contacts to HubSpot contacts. It handles the complete sync
 * workflow including validation, API calls, error handling, and status tracking.
 */

import {
  SyncOperation,
  SyncStatus,
  SyncError,
  SupabaseContact,
  HubSpotContact,
  EmailVerificationSyncService as IEmailVerificationSyncService,
  SupabaseEmailVerificationService,
  HubSpotEmailVerificationService
} from '../types/emailVerification';

// Service dependencies
let supabaseService: SupabaseEmailVerificationService;
let hubspotService: HubSpotEmailVerificationService;

// In-memory storage for operation tracking (in production, this would be a database)
const operationsStore = new Map<string, SyncOperation>();

/**
 * Generate a simple unique ID for operations
 * In production, this would use a proper UUID library
 */
function generateOperationId(): string {
  return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Initialize the sync service with required dependencies
 */
export function initializeEmailVerificationSyncService(
  supabaseSvc: SupabaseEmailVerificationService,
  hubspotSvc: HubSpotEmailVerificationService
) {
  supabaseService = supabaseSvc;
  hubspotService = hubspotSvc;
}

/**
 * Main Email Verification Sync Service implementation
 */
export class EmailVerificationSyncService implements IEmailVerificationSyncService {

  /**
   * Sync email verification status from Supabase to HubSpot
   *
   * @param supabaseContactId - The ID of the Supabase contact
   * @param hubspotContactId - The HubSpot contact ID to sync to
   * @param status - The email verification status to sync
   * @returns Promise<SyncOperation> - The sync operation result
   */
  async syncToHubSpot(
    supabaseContactId: number,
    hubspotContactId: string,
    status: string
  ): Promise<SyncOperation> {
    const operationId = generateOperationId();
    const startTime = new Date();

    // Create initial operation record
    const operation: SyncOperation = {
      id: operationId,
      supabaseContactId,
      hubspotContactId,
      status: 'in_progress',
      startedAt: startTime,
      sourceValue: status,
      retryCount: 0,
      initiatedBy: 'system' // Default to system-initiated
    };

    // Store the operation
    operationsStore.set(operationId, operation);

    try {
      // Step 1: Validate the email verification status
      if (!this.validateStatus(status)) {
        throw new Error(`Invalid email verification status: ${status}`);
      }

      // Step 2: Validate Supabase contact exists and has required data
      const contactValid = await supabaseService.validateContactForSync(supabaseContactId);
      if (!contactValid) {
        throw new Error(`Supabase contact ${supabaseContactId} not found or invalid`);
      }

      // Step 3: Get the contact data for logging
      const contact = await supabaseService.getContactById(supabaseContactId);
      if (!contact) {
        throw new Error(`Failed to retrieve Supabase contact ${supabaseContactId}`);
      }

      // Step 4: Validate HubSpot contact exists (if required)
      const hubspotContactExists = await hubspotService.validateContactExists(hubspotContactId);
      if (!hubspotContactExists) {
        throw new Error(`HubSpot contact ${hubspotContactId} not found`);
      }

      // Step 5: Perform the sync
      const hubspotResult = await hubspotService.updateEmailVerificationStatus(
        hubspotContactId,
        status
      );

      // Step 6: Update operation as completed
      const endTime = new Date();
      const completedOperation: SyncOperation = {
        ...operation,
        status: 'completed',
        completedAt: endTime,
        targetValue: status,
        result: {
          previousValue: undefined, // Would need to be retrieved from HubSpot if needed
          newValue: status,
          hubspotResponse: hubspotResult
        }
      };

      operationsStore.set(operationId, completedOperation);
      return completedOperation;

    } catch (error) {
      // Handle sync failure
      const endTime = new Date();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      const failedOperation: SyncOperation = {
        ...operation,
        status: 'failed',
        completedAt: endTime,
        error: {
          code: this.categorizeError(error),
          message: errorMessage,
          details: error,
          retryCount: operation.retryCount,
          canRetry: this.canRetryError(error)
        }
      };

      operationsStore.set(operationId, failedOperation);
      return failedOperation;
    }
  }

  /**
   * Get sync operation status by ID
   *
   * @param operationId - The operation ID to check
   * @returns Promise<SyncOperation | null> - The operation status or null if not found
   */
  async getSyncStatus(operationId: string): Promise<SyncOperation | null> {
    return operationsStore.get(operationId) || null;
  }

  /**
   * Validate email verification status value
   *
   * @param status - The status value to validate
   * @returns boolean - True if valid, false otherwise
   */
  validateStatus(status: string): boolean {
    const validStatuses = [
      'verified',
      'unverified',
      'pending',
      'bounced',
      'complained'
    ];

    return validStatuses.includes(status);
  }

  /**
   * Get all pending sync operations
   *
   * @returns Promise<SyncOperation[]> - Array of pending operations
   */
  async getPendingOperations(): Promise<SyncOperation[]> {
    const pending: SyncOperation[] = [];

    for (const operation of operationsStore.values()) {
      if (operation.status === 'pending' || operation.status === 'in_progress') {
        pending.push(operation);
      }
    }

    return pending;
  }

  /**
   * Retry a failed sync operation
   *
   * @param operationId - The operation ID to retry
   * @returns Promise<SyncOperation | null> - The new operation result or null if not found
   */
  async retryOperation(operationId: string): Promise<SyncOperation | null> {
    const existingOperation = operationsStore.get(operationId);

    if (!existingOperation || existingOperation.status !== 'failed') {
      return null;
    }

    if (!existingOperation.error?.canRetry) {
      return existingOperation;
    }

    // Create new operation with incremented retry count
    const newOperationId = generateOperationId();
    const retryOperation: SyncOperation = {
      id: newOperationId,
      supabaseContactId: existingOperation.supabaseContactId,
      hubspotContactId: existingOperation.hubspotContactId,
      status: 'pending',
      startedAt: new Date(),
      sourceValue: existingOperation.sourceValue,
      retryCount: existingOperation.retryCount + 1,
      initiatedBy: existingOperation.initiatedBy
    };

    operationsStore.set(newOperationId, retryOperation);

    // TODO: Implement actual retry logic (queue the operation for processing)
    // For now, just mark as pending
    return retryOperation;
  }

  /**
   * Clean up old completed/failed operations
   *
   * @param olderThanHours - Remove operations older than this many hours
   * @returns Promise<number> - Number of operations cleaned up
   */
  async cleanupOldOperations(olderThanHours: number = 24): Promise<number> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - olderThanHours);

    let cleanedCount = 0;

    for (const [operationId, operation] of operationsStore.entries()) {
      const operationTime = operation.completedAt || operation.startedAt;

      if (operationTime < cutoffTime) {
        operationsStore.delete(operationId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Categorize error for consistent error handling
   *
   * @param error - The error to categorize
   * @returns string - Error code
   */
  private categorizeError(error: any): string {
    if (error.message?.includes('not found')) {
      return 'CONTACT_NOT_FOUND';
    }

    if (error.message?.includes('rate limit') || error.status === 429) {
      return 'RATE_LIMITED';
    }

    if (error.message?.includes('authentication') || error.status === 401) {
      return 'AUTH_ERROR';
    }

    if (error.message?.includes('HubSpot') || error.status >= 500) {
      return 'HUBSPOT_API_ERROR';
    }

    if (error.message?.includes('database') || error.code === 'PGRST') {
      return 'DATABASE_ERROR';
    }

    return 'SYNC_FAILED';
  }

  /**
   * Determine if an error can be retried
   *
   * @param error - The error to check
   * @returns boolean - True if retryable, false otherwise
   */
  private canRetryError(error: any): boolean {
    const retryableErrors = [
      'RATE_LIMITED',
      'HUBSPOT_API_ERROR',
      'DATABASE_ERROR',
      'NETWORK_ERROR'
    ];

    const errorCode = this.categorizeError(error);
    return retryableErrors.includes(errorCode);
  }
}

// Export singleton instance
export const emailVerificationSyncService = new EmailVerificationSyncService();

// Export the service class and instance
export default EmailVerificationSyncService;