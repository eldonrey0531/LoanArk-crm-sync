# Data Model: Email Verification Sync Data Display

**Feature**: `006-in-email-verification`
**Date**: September 17, 2025
**Status**: Data Model Complete

## 📋 Data Model Overview

This document defines the data structures, relationships, and validation rules for the email verification sync data display feature, ensuring consistent data handling across Supabase and HubSpot systems.

---

## 🗄️ Core Data Entities

### 1. Supabase Contact Entity

**Purpose**: Represents contact records stored in Supabase with email verification status

#### Entity Definition
```typescript
interface SupabaseContact {
  // Primary Identifiers
  id: number;                    // Auto-increment primary key
  hs_object_id: string;          // HubSpot contact ID (foreign key)

  // Contact Information
  name: string;                  // Full name (required)
  email: string;                 // Email address (required)

  // Email Verification Data
  email_verification_status: EmailVerificationStatus; // Core field for filtering

  // Metadata
  created_at: Date;              // Record creation timestamp
  updated_at: Date;              // Last update timestamp

  // Optional Extended Fields
  phone?: string;                // Phone number
  company?: string;              // Company name
  tags?: string[];               // Contact tags
}
```

#### Validation Rules
```typescript
const supabaseContactValidation = {
  id: { type: 'number', required: true, min: 1 },
  hs_object_id: { type: 'string', required: true, min: 1, max: 100 },
  name: { type: 'string', required: true, min: 1, max: 255 },
  email: {
    type: 'string',
    required: true,
    format: 'email',
    max: 255
  },
  email_verification_status: {
    type: 'enum',
    required: true,
    values: ['verified', 'pending', 'failed', 'unknown']
  },
  created_at: { type: 'date', required: true },
  updated_at: { type: 'date', required: true }
};
```

---

### 2. HubSpot Contact Entity

**Purpose**: Represents contact records retrieved from HubSpot CRM

#### Entity Definition
```typescript
interface HubSpotContact {
  // HubSpot Identifiers
  id: string;                    // HubSpot contact ID (primary key)

  // Contact Properties
  properties: HubSpotProperties; // HubSpot contact properties

  // Metadata
  createdAt: Date;               // HubSpot creation timestamp
  updatedAt: Date;               // HubSpot last update timestamp
  archived: boolean;             // Whether contact is archived

  // Associations (if needed)
  associations?: HubSpotAssociations;
}

interface HubSpotProperties {
  // Core Contact Information
  firstname?: string;            // First name
  lastname?: string;             // Last name
  email?: string;                // Email address

  // Additional Properties
  phone?: string;                // Phone number
  company?: string;              // Company name
  website?: string;              // Website URL
  lifecyclestage?: string;       // Lifecycle stage

  // Custom Properties (dynamic)
  [key: string]: any;            // Additional HubSpot properties
}
```

#### Validation Rules
```typescript
const hubspotContactValidation = {
  id: { type: 'string', required: true, min: 1, max: 100 },
  properties: { type: 'object', required: true },
  'properties.email': { type: 'string', format: 'email' },
  'properties.firstname': { type: 'string', max: 255 },
  'properties.lastname': { type: 'string', max: 255 },
  createdAt: { type: 'date', required: true },
  updatedAt: { type: 'date', required: true },
  archived: { type: 'boolean', required: true }
};
```

---

### 3. Email Verification Status Enumeration

**Purpose**: Defines the possible states for email verification

#### Status Definition
```typescript
enum EmailVerificationStatus {
  VERIFIED = 'verified',     // Email successfully verified
  PENDING = 'pending',       // Verification in progress
  FAILED = 'failed',         // Verification failed
  UNKNOWN = 'unknown'        // Verification status unknown
}

// Status metadata for UI display
interface StatusMetadata {
  status: EmailVerificationStatus;
  label: string;              // Display label
  color: string;              // UI color code
  icon: string;               // Icon identifier
  description: string;        // Status description
}

const statusMetadata: Record<EmailVerificationStatus, StatusMetadata> = {
  [EmailVerificationStatus.VERIFIED]: {
    status: EmailVerificationStatus.VERIFIED,
    label: 'Verified',
    color: '#10B981',         // Green
    icon: 'check-circle',
    description: 'Email address has been successfully verified'
  },
  [EmailVerificationStatus.PENDING]: {
    status: EmailVerificationStatus.PENDING,
    label: 'Pending',
    color: '#F59E0B',         // Yellow
    icon: 'clock',
    description: 'Email verification is in progress'
  },
  [EmailVerificationStatus.FAILED]: {
    status: EmailVerificationStatus.FAILED,
    label: 'Failed',
    color: '#EF4444',         // Red
    icon: 'x-circle',
    description: 'Email verification failed'
  },
  [EmailVerificationStatus.UNKNOWN]: {
    status: EmailVerificationStatus.UNKNOWN,
    label: 'Unknown',
    color: '#6B7280',         // Gray
    icon: 'question-mark-circle',
    description: 'Email verification status is unknown'
  }
};
```

---

## 🔗 Data Relationships

### Entity Relationships

```
Supabase Contact (1) ──── (1) HubSpot Contact
       │                           │
       │ hs_object_id              │ id
       │                           │
       └───────────────────────────┼── Match by hs_object_id
                                   │
                    Matched Contact Pair
```

#### Matched Contact Pair Entity
```typescript
interface MatchedContactPair {
  // Relationship Identifiers
  supabaseId: number;           // Supabase contact ID
  hubspotId: string;            // HubSpot contact ID
  matchKey: string;             // hs_object_id used for matching

  // Contact Data
  supabaseContact: SupabaseContact;
  hubspotContact: HubSpotContact;

  // Match Metadata
  matchConfidence: MatchConfidence;
  matchedAt: Date;              // When match was established
  lastVerified: Date;           // When match was last verified

  // Status Information
  syncStatus: SyncStatus;       // Current synchronization status
  discrepancies: DataDiscrepancy[]; // Any data differences found
}

enum MatchConfidence {
  EXACT = 'exact',              // Perfect match by hs_object_id
  PARTIAL = 'partial',          // Match with some data differences
  MANUAL = 'manual'             // Manually verified match
}

enum SyncStatus {
  SYNCED = 'synced',            // Data is synchronized
  PENDING = 'pending',          // Sync in progress
  CONFLICT = 'conflict',        // Data conflicts detected
  ERROR = 'error'               // Sync error occurred
}
```

---

## 📊 Data Transformation Rules

### Supabase to Display Format
```typescript
interface SupabaseDisplayData {
  id: string;                    // Converted to string for consistency
  name: string;                  // Direct mapping
  hs_object_id: string;          // Direct mapping
  email_verification_status: string; // Enum value as string
  source: 'supabase';            // Data source identifier
  displayName: string;           // Formatted name for display
  statusMetadata: StatusMetadata; // UI metadata for status
}
```

### HubSpot to Display Format
```typescript
interface HubSpotDisplayData {
  id: string;                    // HubSpot contact ID
  name: string;                  // Constructed from firstname + lastname
  hs_object_id: string;          // Same as id for consistency
  email_verification_status: string; // From HubSpot properties (if available)
  source: 'hubspot';             // Data source identifier
  displayName: string;           // Formatted name for display
  statusMetadata: StatusMetadata; // UI metadata for status
}
```

### Data Transformation Functions
```typescript
// Transform Supabase contact to display format
function transformSupabaseContact(contact: SupabaseContact): SupabaseDisplayData {
  return {
    id: contact.id.toString(),
    name: contact.name,
    hs_object_id: contact.hs_object_id,
    email_verification_status: contact.email_verification_status,
    source: 'supabase',
    displayName: contact.name,
    statusMetadata: statusMetadata[contact.email_verification_status]
  };
}

// Transform HubSpot contact to display format
function transformHubSpotContact(contact: HubSpotContact): HubSpotDisplayData {
  const fullName = [
    contact.properties.firstname,
    contact.properties.lastname
  ].filter(Boolean).join(' ') || 'Unknown Contact';

  return {
    id: contact.id,
    name: fullName,
    hs_object_id: contact.id,
    email_verification_status: contact.properties.email_verification_status || 'unknown',
    source: 'hubspot',
    displayName: fullName,
    statusMetadata: statusMetadata[contact.properties.email_verification_status || 'unknown']
  };
}
```

---

## 🗃️ Database Schema

### Supabase Table Schema
```sql
-- Email verification contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  hs_object_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  email_verification_status VARCHAR(50) NOT NULL
    CHECK (email_verification_status IN ('verified', 'pending', 'failed', 'unknown')),
  phone VARCHAR(50),
  company VARCHAR(255),
  tags TEXT[], -- Array of tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_hs_object_id ON contacts(hs_object_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email_verification_status ON contacts(email_verification_status);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔄 Data Synchronization Rules

### Synchronization Strategy
```typescript
interface SyncRules {
  // Matching Rules
  matchBy: 'hs_object_id';       // Primary matching field
  fallbackMatchBy: ['email'];    // Fallback matching fields

  // Conflict Resolution
  masterSource: 'supabase';      // Authoritative data source
  conflictStrategy: 'manual';    // How to handle conflicts

  // Update Rules
  updateOnMatch: true;           // Update existing matches
  createOnNoMatch: false;        // Don't create new records
  deleteOnNoMatch: false;        // Don't delete unmatched records

  // Validation Rules
  requireEmailVerification: true; // Only sync verified emails
  validateDataIntegrity: true;   // Check data consistency
}
```

### Synchronization Process
```typescript
interface SyncProcess {
  // Phase 1: Data Extraction
  extractSupabaseData(): Promise<SupabaseContact[]>;
  extractHubSpotData(hsObjectIds: string[]): Promise<HubSpotContact[]>;

  // Phase 2: Data Matching
  matchContacts(supabase: SupabaseContact[], hubspot: HubSpotContact[]): MatchedContactPair[];

  // Phase 3: Conflict Resolution
  resolveConflicts(pairs: MatchedContactPair[]): ResolvedContactPair[];

  // Phase 4: Data Validation
  validateSyncResults(results: ResolvedContactPair[]): ValidationResult[];

  // Phase 5: Status Update
  updateSyncStatus(results: ValidationResult[]): SyncStatus;
}
```

---

## 📋 Data Quality Rules

### Data Validation Rules
```typescript
interface DataQualityRules {
  // Required Fields
  requiredFields: {
    supabase: ['id', 'name', 'email', 'hs_object_id', 'email_verification_status'];
    hubspot: ['id', 'properties'];
  };

  // Field Format Validation
  fieldFormats: {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    phone: /^\+?[\d\s\-\(\)]+$/;
    hs_object_id: /^[a-zA-Z0-9]+$/;
  };

  // Data Consistency Checks
  consistencyChecks: {
    emailFormat: true;
    nameNotEmpty: true;
    hsObjectIdValid: true;
    statusValid: true;
  };

  // Duplicate Detection
  duplicateDetection: {
    checkEmailDuplicates: true;
    checkHsObjectIdDuplicates: true;
    reportDuplicates: true;
  };
}
```

### Data Cleaning Rules
```typescript
interface DataCleaningRules {
  // Text Normalization
  normalizeText: {
    trimWhitespace: true;
    normalizeCase: 'title', // 'upper', 'lower', 'title', 'none'
    removeSpecialChars: false;
  };

  // Email Normalization
  normalizeEmail: {
    lowercase: true;
    trim: true;
    validateFormat: true;
  };

  // Name Normalization
  normalizeName: {
    trim: true;
    titleCase: true;
    removeExtraSpaces: true;
  };
}
```

---

## 📊 Data Analytics & Reporting

### Sync Metrics
```typescript
interface SyncMetrics {
  // Volume Metrics
  totalSupabaseRecords: number;
  totalHubSpotRecords: number;
  matchedRecords: number;
  unmatchedSupabaseRecords: number;
  unmatchedHubSpotRecords: number;

  // Quality Metrics
  dataCompleteness: number;      // Percentage of complete records
  dataAccuracy: number;          // Percentage of accurate data
  matchConfidence: number;       // Average match confidence score

  // Performance Metrics
  syncDuration: number;          // Total sync time in milliseconds
  recordsPerSecond: number;      // Processing speed
  errorRate: number;             // Percentage of failed operations

  // Status Metrics
  verificationStatusBreakdown: Record<EmailVerificationStatus, number>;
  syncStatusBreakdown: Record<SyncStatus, number>;
}
```

### Reporting Data Structure
```typescript
interface SyncReport {
  // Report Metadata
  reportId: string;
  generatedAt: Date;
  syncPeriod: {
    start: Date;
    end: Date;
  };

  // Summary Data
  summary: SyncMetrics;

  // Detailed Data
  matchedPairs: MatchedContactPair[];
  unmatchedRecords: {
    supabase: SupabaseContact[];
    hubspot: HubSpotContact[];
  };
  conflicts: DataConflict[];
  errors: SyncError[];

  // Recommendations
  recommendations: string[];
}
```

---

## 🔒 Data Security & Privacy

### Data Handling Rules
```typescript
interface DataSecurityRules {
  // Access Control
  accessControl: {
    requireAuthentication: true;
    roleBasedAccess: true;
    dataLevelSecurity: true;
  };

  // Data Encryption
  encryption: {
    inTransit: true;             // HTTPS required
    atRest: true;               // Database encryption
    fieldLevelEncryption: false; // Not required for this feature
  };

  // Data Retention
  retention: {
    syncLogs: 90;               // Days to keep sync logs
    errorLogs: 180;             // Days to keep error logs
    auditLogs: 365;             // Days to keep audit logs
  };

  // Privacy Compliance
  privacy: {
    gdprCompliant: true;
    dataMinimization: true;
    consentRequired: false;     // Not applicable for internal data
  };
}
```

---

## 📋 Implementation Checklist

### Data Model Compliance
- [ ] All entities properly defined with TypeScript interfaces
- [ ] Validation rules implemented for all data types
- [ ] Database schema matches entity definitions
- [ ] Data transformation functions working correctly
- [ ] Synchronization rules properly implemented

### Data Quality Assurance
- [ ] Data validation rules enforced
- [ ] Data cleaning functions implemented
- [ ] Duplicate detection working
- [ ] Data consistency checks in place
- [ ] Error handling for invalid data

### Security & Performance
- [ ] Security rules implemented
- [ ] Performance optimized for large datasets
- [ ] Monitoring and logging in place
- [ ] Backup and recovery procedures defined

---

*This data model specification ensures consistent, secure, and efficient data handling across the email verification sync data display feature.*