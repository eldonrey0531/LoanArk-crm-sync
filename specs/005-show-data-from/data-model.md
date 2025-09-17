# Data Model: Email Verification Data Display

**Feature**: Email Verification Data Display
**Date**: September 17, 2025
**Designer**: AI Assistant

## Overview

This document defines the data structures and interfaces required for displaying email verification data in a side-by-side comparison format between Supabase and HubSpot.

## Core Data Structures

### Contact Data Interfaces

```typescript
// Base contact interface
interface BaseContact {
  id: string;
  name: string;
  email: string;
  email_verification_status: string | null;
}

// Supabase contact data
interface SupabaseContact extends BaseContact {
  supabase_id: number;
  hs_object_id: string;
  created_at: string;
  updated_at: string;
}

// HubSpot contact data
interface HubSpotContact extends BaseContact {
  hs_object_id: string;
  properties: {
    firstname: string;
    lastname: string;
    email: string;
    email_verification_status?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Comparison Data Structures

```typescript
// Individual record comparison
interface ContactComparison {
  supabase: SupabaseContact | null;
  hubspot: HubSpotContact | null;
  match_status: 'matched' | 'supabase_only' | 'hubspot_only' | 'mismatch';
  differences: ContactDifference[];
}

// Difference tracking
interface ContactDifference {
  field: string;
  supabase_value: any;
  hubspot_value: any;
  severity: 'info' | 'warning' | 'error';
}

// Page-level data structure
interface ComparisonPageData {
  contacts: ContactComparison[];
  pagination: {
    page: number;
    page_size: number;
    total_records: number;
    has_next: boolean;
    has_previous: boolean;
  };
  summary: {
    total_matched: number;
    total_supabase_only: number;
    total_hubspot_only: number;
    total_mismatches: number;
  };
}
```

## API Response Contracts

### Supabase API Response

```typescript
interface SupabaseContactsResponse {
  data: SupabaseContact[];
  error: string | null;
  count: number;
}

// Individual contact fetch
interface SupabaseContactResponse {
  data: SupabaseContact | null;
  error: string | null;
}
```

### HubSpot API Response

```typescript
interface HubSpotContactsResponse {
  results: HubSpotContact[];
  paging?: {
    next?: {
      after: string;
      link: string;
    };
  };
}

// Individual contact fetch
interface HubSpotContactResponse {
  id: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

## Component Props Interfaces

### Data Display Component

```typescript
interface EmailVerificationDataDisplayProps {
  initialPageSize?: number;
  showFilters?: boolean;
  onRecordSelect?: (comparison: ContactComparison) => void;
  className?: string;
}
```

### Comparison Table Component

```typescript
interface ComparisonTableProps {
  data: ContactComparison[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  pagination: ComparisonPageData['pagination'];
}
```

### Individual Row Component

```typescript
interface ComparisonRowProps {
  comparison: ContactComparison;
  onSelect?: (comparison: ContactComparison) => void;
  selected?: boolean;
}
```

## Hook Interfaces

### Data Fetching Hook

```typescript
interface UseEmailVerificationDataReturn {
  data: ComparisonPageData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  pagination: {
    currentPage: number;
    setPage: (page: number) => void;
    pageSize: number;
    setPageSize: (size: number) => void;
  };
}
```

### Comparison Logic Hook

```typescript
interface UseContactComparisonReturn {
  compareContacts: (supabaseContacts: SupabaseContact[], hubspotContacts: HubSpotContact[]) => ContactComparison[];
  findDifferences: (supabase: SupabaseContact, hubspot: HubSpotContact) => ContactDifference[];
  matchContacts: (supabaseContacts: SupabaseContact[], hubspotContacts: HubSpotContact[]) => ContactComparison[];
}
```

## Service Layer Contracts

### Data Service Interface

```typescript
interface EmailVerificationDataService {
  fetchSupabaseContacts(params: {
    page?: number;
    pageSize?: number;
    filterVerified?: boolean;
  }): Promise<SupabaseContactsResponse>;

  fetchHubSpotContacts(params: {
    after?: string;
    limit?: number;
    properties?: string[];
  }): Promise<HubSpotContactsResponse>;

  fetchContactById(id: string, source: 'supabase' | 'hubspot'): Promise<SupabaseContact | HubSpotContact | null>;
}
```

## Error Handling Types

```typescript
interface DataFetchError {
  type: 'network' | 'auth' | 'validation' | 'server';
  message: string;
  details?: any;
  retryable: boolean;
}

interface ComparisonError {
  type: 'data_mismatch' | 'missing_record' | 'sync_error';
  affectedRecords: string[];
  suggestedAction: string;
}
```

## Validation Rules

### Data Validation

```typescript
interface ContactValidationRules {
  email: {
    required: boolean;
    format: RegExp;
  };
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  email_verification_status: {
    allowedValues: string[];
    nullable: boolean;
  };
}
```

## State Management Types

### Component State

```typescript
interface DataDisplayState {
  data: ComparisonPageData | null;
  loading: boolean;
  error: DataFetchError | null;
  selectedRecords: string[];
  filters: {
    showMatched: boolean;
    showUnmatched: boolean;
    showMismatches: boolean;
    searchTerm: string;
  };
}
```

## Constants and Enums

```typescript
enum MatchStatus {
  MATCHED = 'matched',
  SUPABASE_ONLY = 'supabase_only',
  HUBSPOT_ONLY = 'hubspot_only',
  MISMATCH = 'mismatch'
}

enum DifferenceSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;
const CONTACT_PROPERTIES = [
  'firstname',
  'lastname',
  'email',
  'email_verification_status'
] as const;
```

## Database Schema References

### Supabase Contacts Table

```sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verification_status VARCHAR(50),
  hs_object_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### HubSpot Custom Property

- Property Name: `email_verification_status`
- Property Type: Single-line text
- Group: Contact information
- Field Type: Text

## Migration Considerations

- Ensure `hs_object_id` mapping exists for all contacts
- Validate email verification status values match expected formats
- Consider data migration for existing records without verification status

## Performance Considerations

- Implement pagination for datasets > 1000 records
- Use React.memo for comparison components
- Cache API responses for 5-minute intervals
- Implement virtual scrolling for large tables

## Security Considerations

- All API calls must use authenticated requests
- Validate user permissions for data access
- Sanitize all displayed data to prevent XSS
- Implement rate limiting for API calls