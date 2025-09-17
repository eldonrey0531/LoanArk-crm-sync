// src/types/emailVerification.ts

/**
 * Email Verification Status Sync Types
 *
 * This file contains TypeScript interfaces and types for the email verification
 * status sync feature, which synchronizes email verification status from
 * Supabase contacts to HubSpot contacts.
 */

// =============================================================================
// ENTITY INTERFACES
// =============================================================================

/**
 * Represents a contact record in the internal Supabase database
 * that contains email verification status information.
 */
export interface SupabaseContact {
  // Primary identifier
  id: number;

  // HubSpot matching identifier
  hs_object_id: string;

  // Email verification status (core field for this feature)
  email_verification_status: string | null;

  // Contact information
  firstname: string | null;
  lastname: string | null;
  email: string | null;

  // Additional metadata
  created_at: string | null;
  updated_at: string | null;
  createdate: string | null;
  lastmodifieddate: string | null;

  // Other fields (not relevant for this feature)
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  mobilephone?: string | null;
  client_type_prospects?: string | null;
  client_type_vip_status?: string | null;
  sync_source?: string | null;
}

/**
 * Represents the corresponding contact in HubSpot CRM that will
 * receive the email verification status update.
 */
export interface HubSpotContact {
  // HubSpot identifiers
  id: string;  // This matches Supabase hs_object_id
  properties: {
    // Core contact properties
    firstname?: string;
    lastname?: string;
    email?: string;

    // Email verification status (target field for sync)
    email_verification_status?: string;

    // Metadata
    createdate?: string;
    lastmodifieddate?: string;
    hs_object_id?: string;
  };
}

/**
 * Tracks the status and results of individual sync operations
 * between Supabase and HubSpot.
 */
export interface SyncOperation {
  // Operation identifiers
  id: string;  // Unique operation ID
  supabaseContactId: number;
  hubspotContactId: string;

  // Operation status
  status: SyncStatus;
  startedAt: Date;
  completedAt?: Date;

  // Operation data
  sourceValue: string;  // email_verification_status from Supabase
  targetValue?: string; // email_verification_status sent to HubSpot

  // Result data (for completed operations)
  result?: {
    previousValue?: string;
    newValue: string;
    hubspotResponse: any; // HubSpot API response
  };

  // Error handling
  error?: SyncError;

  // Metadata
  initiatedBy: string;  // User or system identifier
  retryCount: number;
}

// =============================================================================
// ENUMS AND TYPES
// =============================================================================

/**
 * Possible statuses for a sync operation
 */
export type SyncStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * Error information for failed sync operations
 */
export interface SyncError {
  code: string;
  message: string;
  details?: any;
  retryCount?: number;
  canRetry?: boolean;
}

/**
 * Pagination information for API responses
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

/**
 * Request parameters for fetching email verification records
 */
export interface GetEmailVerificationRecordsParams {
  // Pagination
  page?: number;        // Default: 1
  limit?: number;       // Default: 25, Max: 100

  // Sorting
  sortBy?: 'created_at' | 'updated_at' | 'firstname' | 'lastname';
  sortOrder?: 'asc' | 'desc';  // Default: 'desc'

  // Filtering (future enhancement)
  search?: string;      // Search by name or email
}

/**
 * Response for email verification records API
 */
export interface GetEmailVerificationRecordsResponse extends ApiResponse<{
  records: SupabaseContact[];
  pagination: PaginationInfo;
}> {}

/**
 * Request body for sync email verification operation
 */
export interface SyncEmailVerificationRequest {
  // Supabase contact identifier
  supabaseContactId: number;

  // HubSpot contact identifier (for validation)
  hubspotContactId: string;

  // Email verification status to sync
  emailVerificationStatus: string;

  // Optional metadata
  options?: {
    // Whether to validate HubSpot contact exists before sync
    validateContact?: boolean;  // Default: true

    // Whether to retry on failure
    retryOnFailure?: boolean;   // Default: false

    // Custom retry delay in milliseconds
    retryDelay?: number;        // Default: 1000
  };
}

/**
 * Response for sync email verification operation
 */
export interface SyncEmailVerificationResponse extends ApiResponse<{
  operationId: string;
  supabaseContactId: number;
  hubspotContactId: string;
  status: 'completed';
  syncedAt: string;  // ISO 8601 timestamp
  previousValue?: string;  // Previous email_verification_status in HubSpot
  newValue: string;        // New email_verification_status set in HubSpot
  hubspotResponse: {
    id: string;
    updatedAt: string;
    properties: {
      email_verification_status: string;
    };
  };
}> {}

/**
 * Processing response for async sync operations
 */
export interface SyncEmailVerificationProcessingResponse extends ApiResponse<{
  operationId: string;
  supabaseContactId: number;
  hubspotContactId: string;
  status: 'processing';
  message: string;  // Human-readable status message
  estimatedCompletion: string;  // ISO 8601 timestamp
}> {}

/**
 * Request parameters for sync status check
 */
export interface GetSyncStatusPathParams {
  operationId: string;  // UUID or unique identifier for the sync operation
}

/**
 * Query parameters for sync status check
 */
export interface GetSyncStatusQueryParams {
  // Optional: Include detailed error information
  includeDetails?: boolean;  // Default: false
}

/**
 * Completed sync status response
 */
export interface GetSyncStatusCompletedResponse extends ApiResponse<{
  operationId: string;
  status: 'completed';
  supabaseContactId: number;
  hubspotContactId: string;
  startedAt: string;   // ISO 8601 timestamp
  completedAt: string; // ISO 8601 timestamp
  duration: number;    // Duration in milliseconds
  result: {
    previousValue?: string;
    newValue: string;
    hubspotResponse: {
      id: string;
      updatedAt: string;
      properties: {
        email_verification_status: string;
      };
    };
  };
}> {}

/**
 * Failed sync status response
 */
export interface GetSyncStatusFailedResponse extends ApiResponse<{
  operationId: string;
  status: 'failed';
  supabaseContactId: number;
  hubspotContactId: string;
  startedAt: string;
  completedAt: string;
  duration: number;
  error: {
    code: string;
    message: string;
    details?: any;  // Only included if includeDetails=true
    retryCount: number;
    canRetry: boolean;
  };
}> {}

/**
 * Processing sync status response
 */
export interface GetSyncStatusProcessingResponse extends ApiResponse<{
  operationId: string;
  status: 'processing' | 'pending';
  supabaseContactId: number;
  hubspotContactId: string;
  startedAt: string;
  message: string;  // Human-readable status message
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
}> {}

// =============================================================================
// SERVICE INTERFACES
// =============================================================================

/**
 * Service for managing email verification sync operations
 */
export interface EmailVerificationSyncService {
  /**
   * Sync email verification status from Supabase to HubSpot
   */
  syncToHubSpot(
    supabaseContactId: number,
    hubspotContactId: string,
    status: string
  ): Promise<SyncOperation>;

  /**
   * Get sync operation status by ID
   */
  getSyncStatus(operationId: string): Promise<SyncOperation | null>;

  /**
   * Validate email verification status value
   */
  validateStatus(status: string): boolean;

  /**
   * Get all pending sync operations
   */
  getPendingOperations(): Promise<SyncOperation[]>;
}

/**
 * Service for querying Supabase email verification records
 */
export interface SupabaseEmailVerificationService {
  /**
   * Get contacts with email verification status
   */
  getContactsWithEmailVerification(
    params?: GetEmailVerificationRecordsParams
  ): Promise<{ records: SupabaseContact[]; pagination: PaginationInfo }>;

  /**
   * Get specific contact by ID
   */
  getContactById(id: number): Promise<SupabaseContact | null>;

  /**
   * Validate contact exists and has required fields
   */
  validateContactForSync(id: number): Promise<boolean>;
}

/**
 * Service for HubSpot contact operations
 */
export interface HubSpotEmailVerificationService {
  /**
   * Update contact's email verification status
   */
  updateEmailVerificationStatus(
    contactId: string,
    status: string
  ): Promise<{
    id: string;
    updatedAt: string;
    properties: { email_verification_status: string };
  }>;

  /**
   * Get contact by ID
   */
  getContactById(contactId: string): Promise<HubSpotContact | null>;

  /**
   * Validate contact exists
   */
  validateContactExists(contactId: string): Promise<boolean>;
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

/**
 * Props for EmailVerificationSync page component
 */
export interface EmailVerificationSyncPageProps {
  // No specific props needed for basic implementation
}

/**
 * Props for SyncStatus component
 */
export interface SyncStatusProps {
  status: 'idle' | 'pending' | 'success' | 'error';
  onRetry?: () => void;
  message?: string;
}

/**
 * Props for EmailVerificationTable component
 */
export interface EmailVerificationTableProps {
  records: SupabaseContact[];
  isLoading?: boolean;
  onSync?: (record: SupabaseContact) => void;
  syncStatuses?: Record<number, SyncStatus>;
}

// =============================================================================
// HOOK TYPES
// =============================================================================

/**
 * Return type for useEmailVerificationSync hook
 */
export interface UseEmailVerificationSyncReturn {
  records: SupabaseContact[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  syncStatuses: Record<number, SyncStatus>;
  loadRecords: (params?: GetEmailVerificationRecordsParams) => Promise<void>;
  syncRecord: (record: SupabaseContact) => Promise<void>;
  retrySync: (recordId: number) => Promise<void>;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Configuration for email verification status validation
 */
export interface EmailVerificationConfig {
  validStatuses: string[];
  maxRetries: number;
  retryDelay: number;
  rateLimitDelay: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_EMAIL_VERIFICATION_CONFIG: EmailVerificationConfig = {
  validStatuses: ['verified', 'unverified', 'pending', 'bounced', 'complained'],
  maxRetries: 3,
  retryDelay: 1000,
  rateLimitDelay: 60000, // 1 minute
};