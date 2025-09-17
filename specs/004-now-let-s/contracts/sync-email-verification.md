# API Contract: Sync Email Verification Status

**Endpoint**: `POST /api/sync-email-verification`
**Purpose**: Update HubSpot contact with email verification status from Supabase
**Authentication**: Required (Bearer token or API key)

## Request

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body
```typescript
interface SyncEmailVerificationRequest {
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
```

## Response

### Success Response (200)
```typescript
interface SyncEmailVerificationResponse {
  success: true;
  data: {
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
  };
}
```

### Processing Response (202)
```typescript
interface SyncEmailVerificationProcessingResponse {
  success: true;
  data: {
    operationId: string;
    supabaseContactId: number;
    hubspotContactId: string;
    status: 'processing';
    message: 'Sync operation initiated';
    estimatedCompletion: string;  // ISO 8601 timestamp
  };
}
```

### Error Responses

#### 400 Bad Request
```typescript
interface SyncEmailVerificationErrorResponse {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'INVALID_CONTACT' | 'INVALID_STATUS';
    message: string;
    details?: {
      supabaseContactId?: number;
      hubspotContactId?: string;
      emailVerificationStatus?: string;
      validationErrors?: string[];
    };
  };
}
```

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
    code: 'CONTACT_NOT_FOUND';
    message: 'HubSpot contact not found';
    details: {
      hubspotContactId: string;
    };
  };
}
```

#### 409 Conflict
```typescript
{
  success: false;
  error: {
    code: 'SYNC_CONFLICT';
    message: 'Contact is currently being synced by another operation';
    details: {
      operationId: string;
      startedAt: string;
    };
  };
}
```

#### 429 Too Many Requests
```typescript
{
  success: false;
  error: {
    code: 'RATE_LIMITED';
    message: 'Too many sync requests. Please try again later.';
    details: {
      retryAfter: number;  // Seconds to wait
      limit: number;       // Requests per minute
      remaining: number;   // Remaining requests in current window
    };
  };
}
```

#### 500 Internal Server Error
```typescript
{
  success: false;
  error: {
    code: 'SYNC_FAILED' | 'HUBSPOT_API_ERROR' | 'DATABASE_ERROR';
    message: string;
    details?: {
      operationId?: string;
      hubspotError?: any;
      databaseError?: string;
    };
  };
}
```

## Implementation Notes

### Sync Process Flow
1. **Validate Request**: Check authentication and required parameters
2. **Validate Contact**: Ensure Supabase contact exists and has valid data
3. **Check HubSpot**: Verify HubSpot contact exists (if validation enabled)
4. **Validate Status**: Ensure email_verification_status is valid for HubSpot
5. **Execute Sync**: Update HubSpot contact property
6. **Record Result**: Log operation outcome and return response

### HubSpot API Integration
```javascript
// Example HubSpot API call
const hubspotResponse = await fetch(
  `https://api.hubapi.com/crm/v3/objects/contacts/${hubspotContactId}`,
  {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        email_verification_status: emailVerificationStatus
      }
    })
  }
);
```

### Error Handling Strategy
- **Network Errors**: Retry with exponential backoff
- **Authentication Errors**: Return 401 with clear message
- **Validation Errors**: Return 400 with specific validation details
- **HubSpot Errors**: Map to appropriate HTTP status codes
- **Rate Limiting**: Implement proper backoff and user feedback

### Idempotency
- Each sync operation should be idempotent
- Use operation IDs to prevent duplicate processing
- Allow safe retries of failed operations

## Testing Contract

### Positive Test Cases
1. Successful sync with valid data
2. Sync with existing email_verification_status (update scenario)
3. Sync with retry on transient failure
4. Async processing for long-running operations

### Negative Test Cases
1. Missing authentication
2. Invalid Supabase contact ID
3. Non-existent HubSpot contact
4. Invalid email verification status
5. HubSpot API rate limiting
6. Network connectivity issues
7. Database connection failures

### Edge Cases
1. Concurrent sync requests for same contact
2. HubSpot contact deleted during sync
3. Invalid hs_object_id format
4. Very long email verification status values
5. Unicode characters in status values