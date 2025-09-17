# API Contract: Get Email Verification Records

**Endpoint**: `GET /api/email-verification-records`
**Purpose**: Retrieve Supabase contacts that have email verification status set (non-null)
**Authentication**: Required (Bearer token or API key)

## Request

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Query Parameters
```typescript
interface GetEmailVerificationRecordsParams {
  // Pagination
  page?: number;        // Default: 1
  limit?: number;       // Default: 25, Max: 100

  // Sorting
  sortBy?: 'created_at' | 'updated_at' | 'firstname' | 'lastname';
  sortOrder?: 'asc' | 'desc';  // Default: 'desc'

  // Filtering (future enhancement)
  search?: string;      // Search by name or email
}
```

## Response

### Success Response (200)
```typescript
interface GetEmailVerificationRecordsResponse {
  success: true;
  data: {
    records: SupabaseContact[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

interface SupabaseContact {
  id: number;
  hs_object_id: string;
  email_verification_status: string;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  created_at: string | null;
  updated_at: string | null;
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

#### 500 Internal Server Error
```typescript
{
  success: false;
  error: {
    code: 'DATABASE_ERROR';
    message: 'Failed to retrieve records from database';
    details?: string;
  };
}
```

## Implementation Notes

### Database Query
```sql
SELECT
  id,
  hs_object_id,
  email_verification_status,
  firstname,
  lastname,
  email,
  created_at,
  updated_at
FROM contacts
WHERE email_verification_status IS NOT NULL
ORDER BY created_at DESC
LIMIT $limit OFFSET $offset;
```

### Performance Considerations
- Implement database indexing on `email_verification_status` for efficient filtering
- Use pagination to handle large result sets
- Consider caching for frequently accessed data

### Validation Rules
- `email_verification_status` must be non-null for inclusion
- `hs_object_id` must be present and valid format
- Results should be ordered by most recent first (created_at DESC)

## Testing Contract

### Positive Test Cases
1. Retrieve records with default pagination
2. Retrieve records with custom pagination parameters
3. Retrieve records with sorting options
4. Handle empty result set gracefully

### Negative Test Cases
1. Missing authentication
2. Invalid pagination parameters
3. Database connection failure
4. Invalid sort parameters