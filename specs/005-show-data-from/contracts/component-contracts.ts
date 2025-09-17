// Component Contracts for Email Verification Data Display Feature
// This file defines the exact props, state, and behavior contracts for all React components

import { ContactComparison, ComparisonResponse } from './api-contracts';

// Main Container Component
export interface EmailVerificationDataDisplayProps {
  // Configuration
  initialPageSize?: number;
  showFilters?: boolean;
  showSummary?: boolean;
  className?: string;

  // Callbacks
  onRecordSelect?: (comparison: ContactComparison) => void;
  onError?: (error: string) => void;
  onLoadingChange?: (loading: boolean) => void;

  // Styling
  theme?: 'light' | 'dark' | 'auto';
}

// Data Table Component
export interface ComparisonTableProps {
  // Data
  data: ContactComparison[];
  loading: boolean;
  error: string | null;

  // Pagination
  pagination: ComparisonResponse['pagination'];
  onPageChange: (page: number) => void;

  // Actions
  onRetry: () => void;
  onRefresh: () => void;
  onExport?: (format: 'csv' | 'json') => void;

  // Selection
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;

  // Filtering
  filters?: TableFilters;
  onFiltersChange?: (filters: TableFilters) => void;

  // Styling
  className?: string;
  compact?: boolean;
}

// Individual Row Component
export interface ComparisonRowProps {
  // Data
  comparison: ContactComparison;

  // Interaction
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (comparison: ContactComparison) => void;
  onClick?: (comparison: ContactComparison) => void;

  // Display options
  showDifferences?: boolean;
  highlightMismatches?: boolean;

  // Actions
  actions?: RowAction[];

  // Styling
  className?: string;
}

// Filter Controls Component
export interface FilterControlsProps {
  // Current filters
  filters: TableFilters;

  // Callbacks
  onFiltersChange: (filters: TableFilters) => void;
  onReset: () => void;

  // Configuration
  showSearch?: boolean;
  showStatusFilter?: boolean;
  showDateFilter?: boolean;

  // Styling
  className?: string;
}

// Summary Statistics Component
export interface SummaryStatsProps {
  // Data
  summary: ComparisonResponse['summary'];
  totalRecords: number;

  // Display options
  showPercentages?: boolean;
  compact?: boolean;

  // Styling
  className?: string;
}

// Loading States Component
export interface LoadingStateProps {
  // Configuration
  type: 'table' | 'card' | 'inline';
  message?: string;

  // Styling
  className?: string;
}

// Error Display Component
export interface ErrorDisplayProps {
  // Error information
  error: string;
  type: 'network' | 'auth' | 'validation' | 'server';

  // Actions
  onRetry?: () => void;
  onDismiss?: () => void;

  // Display options
  showDetails?: boolean;
  details?: any;

  // Styling
  className?: string;
}

// Status Indicator Component
export interface StatusIndicatorProps {
  // Status information
  status: ContactComparison['match_status'];
  size?: 'sm' | 'md' | 'lg';

  // Display options
  showLabel?: boolean;
  showIcon?: boolean;

  // Styling
  className?: string;
}

// Data Cell Component
export interface DataCellProps {
  // Data
  value: any;
  field: string;
  source: 'supabase' | 'hubspot';

  // Display options
  truncate?: boolean;
  maxLength?: number;
  format?: 'text' | 'date' | 'email' | 'status';

  // Styling
  className?: string;
  highlight?: boolean;
}

// Difference Highlight Component
export interface DifferenceHighlightProps {
  // Difference data
  difference: ContactComparison['differences'][0];

  // Display options
  showValues?: boolean;
  compact?: boolean;

  // Styling
  className?: string;
}

// Pagination Controls Component
export interface PaginationControlsProps {
  // Pagination data
  pagination: ComparisonResponse['pagination'];

  // Callbacks
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  // Configuration
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];

  // Styling
  className?: string;
}

// Export Controls Component
export interface ExportControlsProps {
  // Configuration
  formats: ('csv' | 'json' | 'pdf')[];
  disabled?: boolean;

  // Callbacks
  onExport: (format: 'csv' | 'json' | 'pdf') => void;

  // Styling
  className?: string;
}

// Search Input Component
export interface SearchInputProps {
  // Current value
  value: string;

  // Callbacks
  onChange: (value: string) => void;
  onClear?: () => void;

  // Configuration
  placeholder?: string;
  debounceMs?: number;

  // Styling
  className?: string;
}

// Shared Types
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

// Component State Types
export interface TableState {
  data: ContactComparison[];
  loading: boolean;
  error: string | null;
  pagination: ComparisonResponse['pagination'];
  filters: TableFilters;
  selectedIds: string[];
  lastUpdated: Date | null;
}

// Event Types
export interface TableEvents {
  onDataLoad: (data: ContactComparison[]) => void;
  onError: (error: string) => void;
  onSelectionChange: (selectedIds: string[]) => void;
  onFiltersChange: (filters: TableFilters) => void;
  onPageChange: (page: number) => void;
}

// Accessibility Types
export interface AriaLabels {
  table: string;
  row: (comparison: ContactComparison) => string;
  cell: (field: string, source: string) => string;
  pagination: string;
  filters: string;
  search: string;
  export: string;
}

// Theme Configuration
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
    fontWeight: {
      normal: string;
      bold: string;
    };
  };
}

// Responsive Breakpoints
export const Breakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280
} as const;

// Default Props
export const DefaultProps = {
  EmailVerificationDataDisplay: {
    initialPageSize: 50,
    showFilters: true,
    showSummary: true,
    theme: 'auto' as const
  },
  ComparisonTable: {
    selectable: false,
    compact: false,
    showDifferences: true,
    highlightMismatches: true
  },
  ComparisonRow: {
    selectable: false,
    showDifferences: true,
    highlightMismatches: true
  },
  FilterControls: {
    showSearch: true,
    showStatusFilter: true,
    showDateFilter: false
  },
  SummaryStats: {
    showPercentages: true,
    compact: false
  },
  StatusIndicator: {
    size: 'md' as const,
    showLabel: true,
    showIcon: true
  },
  DataCell: {
    truncate: true,
    maxLength: 50,
    format: 'text' as const
  },
  PaginationControls: {
    showPageSizeSelector: true,
    pageSizeOptions: [25, 50, 100, 200]
  },
  SearchInput: {
    placeholder: 'Search contacts...',
    debounceMs: 300
  }
} as const;

// Validation Rules for Props
export const PropValidation = {
  pageSize: {
    min: 10,
    max: 200,
    default: 50
  },
  searchQuery: {
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s@._-]*$/
  },
  selectedIds: {
    maxItems: 1000
  }
} as const;