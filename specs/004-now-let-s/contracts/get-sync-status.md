# API Contract: Get Sync Operation Status

**Endpoint**: `GET /api/sync-status/{operationId}`
**Purpose**: Check the status of an email verification sync operation
**Authentication**: Required (Bearer token or API key)

## Request

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Path Parameters
```typescript
interface GetSyncStatusPathParams {
  operationId: string;  // UUID or unique identifier for the sync operation
}
```

### Query Parameters
```typescript
interface GetSyncStatusQueryParams {
  // Optional: Include detailed error information
  includeDetails?: boolean;  // Default: false
}
```

## Response

### Success Response - Completed (200)
```typescript
interface GetSyncStatusCompletedResponse {
  success: true;
  data: {
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
  };
}
```

### Success Response - Failed (200)
```typescript
interface GetSyncStatusFailedResponse {
  success: true;
  data: {
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
  };
}
```

### Success Response - Processing (200)
```typescript
interface GetSyncStatusProcessingResponse {
  success: true;
  data: {
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
  };
}
```

### Error Responses

#### 401 Unauthorized
```typescript
{
  success: false;
  error: {
    code: 'UNAUTHORIZED';
    message: 'Authentication required';
  };
}
```

#### 404 Not Found
```typescript
{
  success: false;
  error: {
    code: 'OPERATION_NOT_FOUND';
    message: 'Sync operation not found';
    details: {
      operationId: string;
    };
  };
}
```

#### 500 Internal Server Error
```typescript
{
  success: false;
  error: {
    code: 'STATUS_CHECK_FAILED';
    message: 'Failed to retrieve operation status';
    details?: string;
  };
}
```

## Implementation Notes

### Operation Storage
Operations can be stored in:
- **In-memory cache**: For short-term operations (recommended for initial implementation)
- **Database table**: For persistent operation tracking
- **External queue system**: For distributed processing

### Status Polling Strategy
- **Client-side polling**: Frontend polls every 2-5 seconds for processing operations
- **Exponential backoff**: Increase polling interval for long-running operations
- **Timeout handling**: Stop polling after reasonable timeout (e.g., 5 minutes)

### Cleanup Strategy
- **Completed operations**: Keep for 24 hours for user reference
- **Failed operations**: Keep for 7 days for debugging
- **Expired operations**: Automatically clean up old records

## Testing Contract

### Positive Test Cases
1. Check status of completed operation
2. Check status of failed operation with error details
3. Check status of processing operation
4. Include/exclude error details based on query parameter

### Negative Test Cases
1. Missing authentication
2. Invalid operation ID format
3. Non-existent operation ID
4. Database connection failure during status check

### Performance Test Cases
1. High-frequency polling (every 1 second)
2. Multiple concurrent status checks
3. Large number of stored operations