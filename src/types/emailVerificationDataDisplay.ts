// src/types/emailVerificationDataDisplay.ts

/**
 * Email Verification Data Display Types
 *
 * This file contains comprehensive TypeScript interfaces and types for the
 * Email Verification Data Display feature, which provides side-by-side comparison
 * of contact data between Supabase and HubSpot with email verification status.
 */

// =============================================================================
// DATA MODELS
// =============================================================================

/**
 * Represents a contact record in the Supabase database
 */
export interface SupabaseContact {
  id: number;
  name: string;
  email: string;
  email_verification_status: string | null;
  hs_object_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Represents a contact record in HubSpot CRM
 */
export interface HubSpotContact {
  id: string;
  properties: {
    firstname: string;
    lastname: string;
    email: string;
    email_verification_status?: string;
    hs_object_id: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents the comparison between Supabase and HubSpot contact data
 */
export interface ContactComparison {
  id: string;
  supabase: SupabaseContact | null;
  hubspot: HubSpotContact | null;
  match_status: 'matched' | 'supabase_only' | 'hubspot_only' | 'mismatch';
  differences: ContactDifference[];
  last_sync?: string;
}

/**
 * Represents a difference between Supabase and HubSpot data
 */
export interface ContactDifference {
  field: string;
  supabase_value: any;
  hubspot_value: any;
  severity: 'info' | 'warning' | 'error';
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

// Supabase API Types
export interface SupabaseContactsRequest {
  page?: number;
  page_size?: number;
  filter_verified?: boolean;
  search?: string;
  sort_by?: 'name' | 'email' | 'created_at' | 'email_verification_status';
  sort_order?: 'asc' | 'desc';
}

export interface SupabaseContactRequest {
  id: number;
}

export interface SupabaseContactsResponse {
  success: boolean;
  data: SupabaseContact[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    has_next: boolean;
    has_previous: boolean;
  };
  error?: string;
}

export interface SupabaseContactResponse {
  success: boolean;
  data: SupabaseContact | null;
  error?: string;
}

// HubSpot API Types
export interface HubSpotContactsRequest {
  after?: string;
  limit?: number;
  properties?: string[];
  filterGroups?: HubSpotFilterGroup[];
}

export interface HubSpotContactRequest {
  contactId: string;
  properties?: string[];
}

export interface HubSpotContactsResponse {
  success: boolean;
  data: HubSpotContact[];
  pagination: {
    next_after?: string;
    has_more: boolean;
  };
  error?: string;
}

export interface HubSpotContactResponse {
  success: boolean;
  data: HubSpotContact | null;
  error?: string;
}

// Comparison API Types
export interface ComparisonRequest {
  page?: number;
  page_size?: number;
  filter_status?: 'all' | 'matched' | 'supabase_only' | 'hubspot_only' | 'mismatch';
  search?: string;
  has_hubspot_match?: boolean;
}

export interface ComparisonResponse {
  success: boolean;
  data: ContactComparison[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    has_next: boolean;
    has_previous: boolean;
  };
  summary: {
    total_matched: number;
    total_supabase_only: number;
    total_hubspot_only: number;
    total_mismatches: number;
  };
  error?: string;
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

// Main Container Component
export interface EmailVerificationDataDisplayProps {
  initialPageSize?: number;
  showFilters?: boolean;
  showSummary?: boolean;
  className?: string;
  onRecordSelect?: (comparison: ContactComparison) => void;
  onError?: (error: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  theme?: 'light' | 'dark' | 'auto';
}

// Data Table Component
export interface ComparisonTableProps {
  data: ContactComparison[];
  loading: boolean;
  error: string | null;
  pagination: ComparisonResponse['pagination'];
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onRefresh: () => void;
  onExport?: (format: 'csv' | 'json') => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  filters?: TableFilters;
  onFiltersChange?: (filters: TableFilters) => void;
  className?: string;
  compact?: boolean;
}

// Individual Row Component
export interface ComparisonRowProps {
  comparison: ContactComparison;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (comparison: ContactComparison) => void;
  onClick?: (comparison: ContactComparison) => void;
  showDifferences?: boolean;
  highlightMismatches?: boolean;
  actions?: RowAction[];
  className?: string;
}

// Filter Controls Component
export interface FilterControlsProps {
  filters: TableFilters;
  onFiltersChange: (filters: TableFilters) => void;
  onReset: () => void;
  showSearch?: boolean;
  showStatusFilter?: boolean;
  showDateFilter?: boolean;
  className?: string;
}

// Summary Statistics Component
export interface SummaryStatsProps {
  summary: ComparisonResponse['summary'];
  totalRecords: number;
  showPercentages?: boolean;
  compact?: boolean;
  className?: string;
}

// Loading States Component
export interface LoadingStateProps {
  type: 'table' | 'card' | 'inline';
  message?: string;
  className?: string;
}

// Error Display Component
export interface ErrorDisplayProps {
  error: string;
  type: 'network' | 'auth' | 'validation' | 'server';
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  details?: any;
  className?: string;
}

// Status Indicator Component
export interface StatusIndicatorProps {
  status: ContactComparison['match_status'];
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
}

// Data Cell Component
export interface DataCellProps {
  value: any;
  field: string;
  source: 'supabase' | 'hubspot';
  truncate?: boolean;
  maxLength?: number;
  format?: 'text' | 'date' | 'email' | 'status';
  className?: string;
  highlight?: boolean;
}

// Difference Highlight Component
export interface DifferenceHighlightProps {
  difference: ContactComparison['differences'][0];
  showValues?: boolean;
  compact?: boolean;
  className?: string;
}

// Pagination Controls Component
export interface PaginationControlsProps {
  pagination: ComparisonResponse['pagination'];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  className?: string;
}

// Export Controls Component
export interface ExportControlsProps {
  formats: ('csv' | 'json' | 'pdf')[];
  disabled?: boolean;
  onExport: (format: 'csv' | 'json' | 'pdf') => void;
  className?: string;
}

// Search Input Component
export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

// =============================================================================
// SHARED TYPES
// =============================================================================

export interface TableFilters {
  search: string;
  status: 'all' | 'matched' | 'supabase_only' | 'hubspot_only' | 'mismatch';
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RowAction {
  id: string;
  label: string;
  icon?: string;
  onClick: (comparison: ContactComparison) => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

// =============================================================================
// COMPONENT STATE TYPES
// =============================================================================

export interface TableState {
  data: ContactComparison[];
  loading: boolean;
  error: string | null;
  pagination: ComparisonResponse['pagination'];
  filters: TableFilters;
  selectedIds: string[];
  lastUpdated: Date | null;
}

export interface TableEvents {
  onDataLoad: (data: ContactComparison[]) => void;
  onError: (error: string) => void;
  onSelectionChange: (selectedIds: string[]) => void;
  onFiltersChange: (filters: TableFilters) => void;
  onPageChange: (page: number) => void;
}

// =============================================================================
// ACCESSIBILITY TYPES
// =============================================================================

export interface AriaLabels {
  table: string;
  row: (comparison: ContactComparison) => string;
  cell: (field: string, source: string) => string;
  pagination: string;
  filters: string;
  search: string;
  export: string;
}

// =============================================================================
// THEME CONFIGURATION
// =============================================================================

export interface ThemeConfig {
  colors: {
    matched: string;
    supabaseOnly: string;
    hubspotOnly: string;
    mismatch: string;
    error: string;
    warning: string;
    success: string;
  };
  spacing: {
    table: {
      cellPadding: string;
      rowHeight: string;
      headerHeight: string;
    };
  };
  typography: {
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
  };
}

// =============================================================================
// HUBSPOT FILTER TYPES
// =============================================================================

export interface HubSpotFilterGroup {
  filters: HubSpotFilter[];
}

export interface HubSpotFilter {
  propertyName: string;
  operator: 'EQ' | 'NEQ' | 'LT' | 'GT' | 'LTE' | 'GTE' | 'HAS_PROPERTY' | 'NOT_HAS_PROPERTY';
  value?: any;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * ApiError class for creating error instances
 */
export class ApiError extends Error {
  public readonly type: 'network' | 'auth' | 'validation' | 'server' | 'rate_limit';
  public readonly details?: any;
  public readonly retryable: boolean;
  public readonly retry_after?: number;

  constructor(params: {
    type: 'network' | 'auth' | 'validation' | 'server' | 'rate_limit';
    message: string;
    details?: any;
    retryable?: boolean;
    retry_after?: number;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.type = params.type;
    this.details = params.details;
    this.retryable = params.retryable ?? false;
    this.retry_after = params.retry_after;
  }
}

// Type alias for backwards compatibility
export type ApiErrorType = {
  type: 'network' | 'auth' | 'validation' | 'server' | 'rate_limit';
  message: string;
  details?: any;
  retryable: boolean;
  retry_after?: number;
};

// =============================================================================
// SERVICE INTERFACES
// =============================================================================

export interface SupabaseApiService {
  fetchContacts(params?: SupabaseContactsRequest): Promise<SupabaseContactsResponse>;
  fetchContact(params: SupabaseContactRequest): Promise<SupabaseContactResponse>;
}

export interface HubSpotApiService {
  fetchContacts(params?: HubSpotContactsRequest): Promise<HubSpotContactsResponse>;
  fetchContact(params: HubSpotContactRequest): Promise<HubSpotContactResponse>;
}

export interface ComparisonApiService {
  fetchComparison(params?: ComparisonRequest): Promise<ComparisonResponse>;
}

// =============================================================================
// HOOK TYPES
// =============================================================================

export interface UseComparisonDataReturn {
  data: ContactComparison[];
  loading: boolean;
  error: string | null;
  pagination: ComparisonResponse['pagination'];
  summary: ComparisonResponse['summary'];
  filters: TableFilters;
  selectedIds: string[];
  refetch: () => Promise<void>;
  updateFilters: (filters: Partial<TableFilters>) => void;
  updateSelection: (selectedIds: string[]) => void;
  goToPage: (page: number) => void;
  exportData: (format: 'csv' | 'json' | 'pdf') => Promise<void>;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type ExportFormat = 'csv' | 'json' | 'pdf';
export type MatchStatus = ContactComparison['match_status'];
export type DifferenceSeverity = ContactDifference['severity'];
export type LoadingType = LoadingStateProps['type'];
export type ErrorType = ErrorDisplayProps['type'];
export type ThemeType = EmailVerificationDataDisplayProps['theme'];
export type StatusSize = StatusIndicatorProps['size'];
export type DataFormat = DataCellProps['format'];
export type RowActionVariant = RowAction['variant'];
export type FilterStatus = TableFilters['status'];
export type SortOrder = NonNullable<TableFilters['sortOrder']>;

// =============================================================================
// VALIDATION RULES
// =============================================================================

export const ValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  pageSize: {
    min: 1,
    max: 100,
    default: 25,
  },
  search: {
    minLength: 0,
    maxLength: 100,
  },
  dateRange: {
    maxDays: 365,
  },
};

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DefaultTableFilters: TableFilters = {
  search: '',
  status: 'all',
  sortOrder: 'desc',
};

export const DefaultPagination = {
  page: 1,
  page_size: 25,
  total: 0,
  has_next: false,
  has_previous: false,
};

export const DefaultSummary = {
  total_matched: 0,
  total_supabase_only: 0,
  total_hubspot_only: 0,
  total_mismatches: 0,
};

// =============================================================================
// TYPE GUARDS
// =============================================================================

export const isSupabaseContact = (contact: any): contact is SupabaseContact => {
  return contact && typeof contact.id === 'number' && typeof contact.hs_object_id === 'string';
};

export const isHubSpotContact = (contact: any): contact is HubSpotContact => {
  return contact && typeof contact.id === 'string' && contact.properties;
};

export const isContactComparison = (comparison: any): comparison is ContactComparison => {
  return comparison && typeof comparison.id === 'string' && typeof comparison.match_status === 'string';
};

export const isApiError = (error: any): error is ApiError => {
  return error && typeof error.type === 'string' && typeof error.message === 'string';
};