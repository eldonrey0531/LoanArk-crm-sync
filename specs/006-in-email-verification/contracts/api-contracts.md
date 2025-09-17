# API Contracts: Email Verification Sync Data Display

**Feature**: `006-in-email-verification`
**Date**: September 17, 2025
**Status**: Contract Definition Complete

## 📋 Contract Overview

This document defines the API contracts for the email verification sync data display feature, ensuring consistent request/response formats and error handling across all endpoints.

---

## 🔗 API Endpoints

### 1. Email Verification Records Endpoint

**Endpoint**: `GET /api/email-verification-records`  
**Purpose**: Fetch Supabase contact records that have email verification status entries

#### Request Format
```typescript
interface EmailVerificationRecordsRequest {
  pagination?: {
    page: number;      // Default: 1
    limit: number;     // Default: 50, Max: 1000
  };
  filters?: {
    status?: string[]; // Filter by specific verification statuses
    dateRange?: {
      start: string;   // ISO date string
      end: string;     // ISO date string
    };
  };
}
```

#### Response Format
```typescript
interface EmailVerificationRecordsResponse {
  success: boolean;
  data: {
    records: SupabaseContact[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    metadata: {
      filteredCount: number;
      lastUpdated: string; // ISO date string
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface SupabaseContact {
  id: number;
  name: string;
  email: string;
  hs_object_id: string;
  email_verification_status: string;
  created_at: string;  // ISO date string
  updated_at: string;  // ISO date string
}
```

#### Error Codes
- `VALIDATION_ERROR`: Invalid request parameters
- `DATABASE_ERROR`: Supabase query failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `AUTHENTICATION_ERROR`: Invalid or missing authentication

---

### 2. HubSpot Contact Matching Endpoint

**Endpoint**: `POST /api/hubspot-contacts-matching`  
**Purpose**: Fetch HubSpot contact data matching provided hs_object_id values

#### Request Format
```typescript
interface HubSpotContactMatchingRequest {
  hsObjectIds: string[];  // Array of HubSpot object IDs
  properties?: string[];  // Specific properties to fetch (optional)
  includeDeleted?: boolean; // Include deleted contacts (default: false)
}
```

#### Response Format
```typescript
interface HubSpotContactMatchingResponse {
  success: boolean;
  data: {
    contacts: HubSpotContact[];
    matched: string[];    // Successfully matched hs_object_ids
    missing: string[];    // hs_object_ids not found in HubSpot
    metadata: {
      totalRequested: number;
      totalFound: number;
      lastUpdated: string; // ISO date string
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface HubSpotContact {
  id: string;  // HubSpot contact ID
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    [key: string]: any; // Additional HubSpot properties
  };
  createdAt: string;  // ISO date string
  updatedAt: string;  // ISO date string
  archived: boolean;
}
```

#### Error Codes
- `VALIDATION_ERROR`: Invalid hs_object_id format or empty array
- `HUBSPOT_API_ERROR`: HubSpot API request failed
- `RATE_LIMIT_EXCEEDED`: HubSpot API rate limit exceeded
- `AUTHENTICATION_ERROR`: Invalid HubSpot API credentials

---

### 3. Combined Sync Display Endpoint

**Endpoint**: `GET /api/email-verification-sync-display`  
**Purpose**: Single endpoint providing combined Supabase and HubSpot data for side-by-side display

#### Request Format
```typescript
interface EmailVerificationSyncDisplayRequest {
  pagination?: {
    page: number;      // Default: 1
    limit: number;     // Default: 50, Max: 100
  };
  filters?: {
    status?: string[]; // Filter by verification status
    hasHubSpotMatch?: boolean; // Only show records with HubSpot matches
  };
}
```

#### Response Format
```typescript
interface EmailVerificationSyncDisplayResponse {
  success: boolean;
  data: {
    supabaseRecords: SupabaseContact[];
    hubspotRecords: HubSpotContact[];
    matchedRecords: MatchedContactPair[];
    unmatchedRecords: {
      supabaseOnly: SupabaseContact[];
      hubspotOnly: HubSpotContact[];
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    metadata: {
      totalSupabaseRecords: number;
      totalHubSpotRecords: number;
      matchedCount: number;
      lastSync: string; // ISO date string
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface MatchedContactPair {
  supabaseContact: SupabaseContact;
  hubspotContact: HubSpotContact;
  matchConfidence: 'exact' | 'partial' | 'manual';
  lastMatched: string; // ISO date string
}
```

#### Error Codes
- `VALIDATION_ERROR`: Invalid request parameters
- `SUPABASE_ERROR`: Supabase data fetching failed
- `HUBSPOT_ERROR`: HubSpot data fetching failed
- `SYNC_ERROR`: Data synchronization failed
- `RATE_LIMIT_EXCEEDED`: Combined API rate limit exceeded

---

## 🔒 Authentication & Security

### Authentication Requirements
```typescript
interface AuthHeaders {
  'Authorization': `Bearer ${token}`;
  'X-API-Key': string;  // For server-to-server calls
  'Content-Type': 'application/json';
}
```

### Security Headers
```typescript
interface SecurityHeaders {
  'X-Content-Type-Options': 'nosniff';
  'X-Frame-Options': 'DENY';
  'X-XSS-Protection': '1; mode=block';
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains';
  'Content-Security-Policy': "default-src 'self'";
}
```

---

## 📊 Data Validation Rules

### Supabase Contact Validation
```typescript
const supabaseContactSchema = {
  id: 'required|integer|min:1',
  name: 'required|string|min:1|max:255',
  email: 'required|email|max:255',
  hs_object_id: 'required|string|min:1|max:100',
  email_verification_status: 'required|string|in:verified,pending,failed,unknown',
  created_at: 'required|date',
  updated_at: 'required|date'
};
```

### HubSpot Contact Validation
```typescript
const hubspotContactSchema = {
  id: 'required|string|min:1|max:100',
  properties: 'required|object',
  'properties.firstname': 'string|max:255',
  'properties.lastname': 'string|max:255',
  'properties.email': 'email|max:255',
  createdAt: 'required|date',
  updatedAt: 'required|date',
  archived: 'required|boolean'
};
```

---

## 🚀 Rate Limiting

### Endpoint Limits
```typescript
const rateLimits = {
  '/api/email-verification-records': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    message: 'Too many email verification record requests'
  },
  '/api/hubspot-contacts-matching': {
    windowMs: 15 * 60 * 1000,
    max: 50, // HubSpot API constraints
    message: 'Too many HubSpot contact matching requests'
  },
  '/api/email-verification-sync-display': {
    windowMs: 15 * 60 * 1000,
    max: 75,
    message: 'Too many sync display requests'
  }
};
```

---

## 📝 Error Response Format

### Standard Error Response
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;        // Machine-readable error code
    message: string;     // Human-readable error message
    details?: any;       // Additional error context
    timestamp: string;   // ISO date string
    requestId: string;   // Unique request identifier
  };
}
```

### Common Error Codes
```typescript
enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR'
}
```

---

## 🧪 Contract Tests

### Test Scenarios

#### Email Verification Records Tests
```typescript
describe('GET /api/email-verification-records', () => {
  test('should return only records with email_verification_status', async () => {
    // Test implementation
  });

  test('should handle pagination correctly', async () => {
    // Test implementation
  });

  test('should filter by verification status', async () => {
    // Test implementation
  });

  test('should handle database errors gracefully', async () => {
    // Test implementation
  });
});
```

#### HubSpot Contact Matching Tests
```typescript
describe('POST /api/hubspot-contacts-matching', () => {
  test('should match contacts by hs_object_id', async () => {
    // Test implementation
  });

  test('should handle missing contacts gracefully', async () => {
    // Test implementation
  });

  test('should respect HubSpot API rate limits', async () => {
    // Test implementation
  });
});
```

#### Combined Sync Display Tests
```typescript
describe('GET /api/email-verification-sync-display', () => {
  test('should return combined Supabase and HubSpot data', async () => {
    // Test implementation
  });

  test('should handle partial API failures', async () => {
    // Test implementation
  });

  test('should match records correctly', async () => {
    // Test implementation
  });
});
```

---

## 📈 Performance Requirements

### Response Time Targets
- **Email Verification Records**: < 500ms (cached), < 2s (uncached)
- **HubSpot Contact Matching**: < 1s (single), < 3s (batch of 50)
- **Combined Sync Display**: < 2s (with caching), < 5s (full refresh)

### Throughput Targets
- **Concurrent Requests**: Support 10 concurrent users
- **Data Volume**: Handle 10,000+ contact records efficiently
- **Memory Usage**: < 100MB per request
- **Database Queries**: Optimize to < 5 queries per request

---

## 🔄 Versioning & Compatibility

### API Versioning
```typescript
interface ApiVersion {
  version: 'v1';
  deprecated: false;
  sunsetDate?: string;
}
```

### Backward Compatibility
- Maintain API contracts for at least 6 months
- Provide migration guides for breaking changes
- Support version headers for gradual migration

---

## 📋 Implementation Checklist

### Contract Compliance
- [ ] All endpoints implement defined request/response formats
- [ ] Error handling follows standard format
- [ ] Authentication requirements implemented
- [ ] Rate limiting configured
- [ ] Data validation rules enforced
- [ ] Performance targets met

### Testing Compliance
- [ ] Contract tests implemented for all endpoints
- [ ] Error scenarios tested
- [ ] Edge cases covered
- [ ] Performance benchmarks met
- [ ] Security requirements validated

---

*This API contract specification ensures consistent, reliable, and secure communication between the frontend and backend systems for the email verification sync data display feature.*