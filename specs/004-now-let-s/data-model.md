# Data Model: Email Verification Status Sync

**Date**: September 17, 2025
**Feature**: Email Verification Status Sync
**Branch**: 004-now-let-s

## Overview

This document defines the data entities, relationships, and validation rules for the email verification status sync feature. The design leverages the existing Supabase contacts table and extends HubSpot contact properties.

## Core Entities

### 1. SupabaseContact (Source Entity)

**Purpose**: Represents a contact record in the internal Supabase database that contains email verification status information.

**Source**: `contacts` table in Supabase
**Primary Key**: `id` (auto-incrementing integer)

**Fields**:
```typescript
interface SupabaseContact {
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
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  mobilephone: string | null;
  client_type_prospects: string | null;
  client_type_vip_status: string | null;
  sync_source: string | null;
}
```

**Validation Rules**:
- `hs_object_id`: Required, non-empty string, must be valid HubSpot contact ID format
- `email_verification_status`: Optional, but must be non-null for sync eligibility
- `email`: Optional, but recommended for contact identification

**Query Patterns**:
```sql
-- Get all contacts eligible for email verification sync
SELECT id, hs_object_id, email_verification_status, firstname, lastname, email
FROM contacts
WHERE email_verification_status IS NOT NULL
ORDER BY created_at DESC;
```

### 2. HubSpotContact (Target Entity)

**Purpose**: Represents the corresponding contact in HubSpot CRM that will receive the email verification status update.

**Source**: HubSpot CRM API
**Primary Key**: `id` (HubSpot contact ID, matches `hs_object_id`)

**Fields**:
```typescript
interface HubSpotContact {
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
```

**Validation Rules**:
- `id`: Required, must match a valid HubSpot contact
- `email_verification_status`: Must be a valid option from HubSpot dropdown
- Contact must exist in HubSpot before sync attempt

### 3. SyncOperation (Process Entity)

**Purpose**: Tracks the status and results of individual sync operations between Supabase and HubSpot.

**Storage**: In-memory during operation, persisted to logs/database for audit trail

**Fields**:
```typescript
interface SyncOperation {
  // Operation identifiers
  id: string;  // Unique operation ID
  supabaseContactId: number;
  hubspotContactId: string;

  // Operation status
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;

  // Operation data
  sourceValue: string;  // email_verification_status from Supabase
  targetValue?: string; // email_verification_status sent to HubSpot

  // Error handling
  error?: {
    code: string;
    message: string;
    details?: any;
  };

  // Metadata
  initiatedBy: string;  // User or system identifier
  retryCount: number;
}
```

**State Transitions**:
- `pending` → `in_progress` (when operation starts)
- `in_progress` → `completed` (when HubSpot update succeeds)
- `in_progress` → `failed` (when operation encounters error)
- `failed` → `pending` (when retry is initiated)

## Entity Relationships

### SupabaseContact → HubSpotContact (1:1 Match)

**Relationship Type**: One-to-One
**Matching Criteria**: `supabase_contacts.hs_object_id = hubspot_contacts.id`
**Cardinality**: One Supabase contact matches exactly one HubSpot contact
**Requirements**:
- `hs_object_id` must be present and valid in Supabase
- Corresponding HubSpot contact must exist
- Relationship is mandatory for sync operations

### SupabaseContact → SyncOperation (1:Many)

**Relationship Type**: One-to-Many
**Purpose**: Track all sync attempts for a contact
**Use Cases**:
- Audit trail of sync history
- Retry failed operations
- Performance monitoring

## Data Flow Architecture

### Sync Process Flow

```
1. Query Supabase
   ↓
2. Filter by email_verification_status IS NOT NULL
   ↓
3. Match with HubSpot using hs_object_id
   ↓
4. Validate HubSpot contact exists
   ↓
5. Update HubSpot email_verification_status
   ↓
6. Record sync operation result
```

### Data Transformation Rules

**Source → Target Mapping**:
```typescript
// Supabase → HubSpot transformation
const hubspotUpdate = {
  properties: {
    email_verification_status: supabaseContact.email_verification_status
  }
};
```

**Validation Rules**:
- Source value must be non-null and non-empty
- Target value must match HubSpot dropdown options
- No data transformation needed (direct mapping)

## Data Integrity Constraints

### Uniqueness Constraints
- `supabase_contacts.hs_object_id`: Must be unique across all records
- `hubspot_contacts.id`: Must be unique in HubSpot
- `sync_operations.id`: Must be unique for each operation

### Referential Integrity
- All `hs_object_id` values must correspond to existing HubSpot contacts
- Sync operations must reference valid Supabase contact IDs
- Failed operations should not prevent future sync attempts

### Business Rules
- Only records with non-null `email_verification_status` are eligible for sync
- Sync operations should be idempotent (safe to retry)
- Failed operations should be logged but not block other operations

## Performance Considerations

### Query Optimization
- Use indexed columns for filtering (`email_verification_status`, `hs_object_id`)
- Implement pagination for large result sets
- Cache frequently accessed HubSpot contact data

### Batch Processing
- Process sync operations in reasonable batch sizes
- Implement rate limiting to respect HubSpot API limits
- Use async processing to avoid blocking UI

### Monitoring
- Track sync operation success/failure rates
- Monitor API response times
- Log detailed error information for debugging

## Security Considerations

### Data Protection
- No sensitive data is transferred during sync
- Use HTTPS for all API communications
- Validate input data to prevent injection attacks

### Access Control
- Sync operations require proper authentication
- Audit trail maintains accountability
- Rate limiting prevents abuse

## Testing Data Model

### Test Scenarios
1. **Valid Sync**: Supabase record with valid `hs_object_id` and `email_verification_status`
2. **Invalid HubSpot ID**: Supabase record with non-existent `hs_object_id`
3. **Missing Email Status**: Supabase record with null `email_verification_status`
4. **Invalid Status Value**: Supabase record with status not in HubSpot dropdown
5. **Network Failure**: API call fails during sync operation

### Mock Data Examples
```typescript
// Valid Supabase contact
const validContact = {
  id: 123,
  hs_object_id: "12345",
  email_verification_status: "verified",
  firstname: "John",
  lastname: "Doe",
  email: "john.doe@example.com"
};

// Corresponding HubSpot contact
const hubspotContact = {
  id: "12345",
  properties: {
    firstname: "John",
    lastname: "Doe",
    email: "john.doe@example.com",
    email_verification_status: "unverified"  // Will be updated to "verified"
  }
};
```

This data model provides a solid foundation for implementing the email verification status sync feature while maintaining data integrity and supporting comprehensive testing scenarios.