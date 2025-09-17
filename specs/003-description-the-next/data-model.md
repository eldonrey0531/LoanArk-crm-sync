# Data Model: Fix Contact Table Pagination and Loading

## Overview

This feature enhances the contact table pagination system to implement server-side pagination, ensuring all contacts can be accessed efficiently across both Supabase Database and HubSpot Live Contacts views.

## Core Entities

### Contact Record (Existing)
**Purpose:** Represents an individual contact from HubSpot CRM
**Source:** Both Supabase (synced) and HubSpot API (live)

**Properties:**
- `hs_object_id`: string (primary identifier)
- `email`: string
- `email_verification_status`: string
- `firstname`: string
- `lastname`: string
- `phone`: string
- `mobilephone`: string
- `client_type_vip_status`: string
- `client_type_prospects`: string
- `address`: string
- `city`: string
- `zip`: string
- `createdate`: string (ISO date)
- `lastmodifieddate`: string (ISO date)

**Validation Rules:**
- `hs_object_id`: Required, unique identifier
- `email`: Optional, valid email format when present
- All other fields: Optional strings

### Pagination State (New)
**Purpose:** Tracks current pagination state for server-side data loading

**Properties:**
- `pageIndex`: number (0-based, current page)
- `pageSize`: number (records per page, default: 25)
- `totalRecords`: number (total available records)
- `hasNextPage`: boolean (true if more data available)
- `hasPreviousPage`: boolean (true if not on first page)
- `isLoading`: boolean (true during data fetch)
- `error`: string | null (error message if fetch failed)

**State Transitions:**
- `pageIndex` changes trigger new API calls
- `isLoading` set to true during fetch, false on completion
- `error` cleared on successful fetch, set on failure
- `hasNextPage`/`hasPreviousPage` updated based on API response

### Table State (Enhanced)
**Purpose:** Manages table sorting, filtering, and pagination display

**Properties:**
- `sorting`: SortingState[] (TanStack Table sorting configuration)
- `globalFilter`: string (search/filter text)
- `columnVisibility`: Record<string, boolean> (visible columns)
- `pagination`: { pageIndex: number, pageSize: number } (client-side pagination state)

**Relationships:**
- Connected to Pagination State for server data coordination
- Independent of API calls for client-side table features

## API Response Models

### ContactListResponse (Existing + Enhanced)
**Purpose:** Standard response format from contact APIs

**Structure:**
```typescript
interface ContactListResponse {
  contacts: ContactRecord[];
  total: number;
  hasMore: boolean;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalPages: number;
  };
}
```

**Enhancements:**
- Added optional `pagination` metadata for client state sync
- `hasMore` field for determining next page availability

### PaginationRequest (New)
**Purpose:** Parameters sent to API for server-side pagination

**Structure:**
```typescript
interface PaginationRequest {
  limit: number;    // records per page
  offset: number;   // starting record index (0-based)
  type: 'sync' | 'live';  // data source type
}
```

## Data Flow Architecture

### Server-Side Pagination Flow

```
User Action → Table State Update → Hook Parameter Change → API Call → Data Load → UI Update

1. User clicks "Next" button
2. ContactsTable calls onPaginationChange callback
3. Page component updates pagination state
4. useHubSpotContacts receives new offset parameter
5. React Query triggers API call with new parameters
6. API returns paginated data
7. ContactsTable receives new data and updates display
8. Pagination controls update based on hasMore/total
```

### State Synchronization

**Hook Level:**
- `useHubSpotContacts` accepts `pageIndex` and `pageSize` parameters
- Converts to `offset = pageIndex * pageSize`
- Maintains separate query keys for different pages

**Component Level:**
- `ContactsTable` receives pagination callbacks
- Parent component manages pagination state
- State lifted to page level for coordination

## Error Handling

### Pagination Errors
- **Network failures:** Retry with exponential backoff
- **Authentication errors:** Redirect to login/re-auth
- **Rate limiting:** Show user-friendly message with retry option
- **Invalid parameters:** Fallback to safe defaults

### Data Consistency
- **Partial loads:** Show available data with error indicator
- **Stale data:** React Query handles cache invalidation
- **Concurrent updates:** Optimistic updates for smooth UX

## Performance Optimizations

### Caching Strategy
- **Page-level caching:** Each page cached separately by React Query
- **Prefetching:** Adjacent pages loaded in background
- **Cache invalidation:** Triggered on data mutations

### Loading States
- **Skeleton loading:** Show placeholder during initial load
- **Incremental loading:** Smooth transitions between pages
- **Error boundaries:** Graceful degradation on failures

## Validation Rules

### Pagination Parameters
- `pageIndex`: >= 0
- `pageSize`: 10-100 (configurable range)
- `offset`: Calculated as `pageIndex * pageSize`
- `limit`: Matches `pageSize`

### Response Validation
- `contacts`: Array of valid ContactRecord objects
- `total`: >= 0, represents total available records
- `hasMore`: Boolean indicating additional pages available

## Migration Considerations

### Backward Compatibility
- Existing API contracts maintained
- Optional pagination parameters
- Graceful fallback to client-side pagination if needed

### Data Integrity
- No changes to existing contact data structure
- Pagination metadata additive only
- Existing functionality preserved during transition