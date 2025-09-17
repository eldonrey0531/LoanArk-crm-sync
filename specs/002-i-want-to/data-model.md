# Data Model: Add HubSpot Database and Contacts Pages

## Entities

### HubSpot Contact

**Purpose**: Represents a contact record from HubSpot CRM with standardized properties for display in both database and live views.

**Fields**:

| Property | Type | Required | Description | Validation |
|----------|------|----------|-------------|------------|
| hs_object_id | string | Yes | Unique HubSpot object identifier | Non-empty, unique |
| email | string | Yes | Primary email address | Valid email format |
| email_verification_status | string | No | Email verification status | Enum: verified, unverified, unknown |
| firstname | string | No | Contact's first name | Max 100 chars |
| lastname | string | No | Contact's last name | Max 100 chars |
| phone | string | No | Primary phone number | Valid phone format |
| mobilephone | string | No | Mobile phone number | Valid phone format |
| client_type_vip_status | string | No | VIP client classification | Enum values |
| client_type_prospects | string | No | Prospect classification | Enum values |
| address | string | No | Street address | Max 255 chars |
| city | string | No | City | Max 100 chars |
| zip | string | No | Postal/ZIP code | Valid postal format |
| createdate | string | Yes | Creation timestamp | ISO 8601 date format |
| lastmodifieddate | string | Yes | Last modification timestamp | ISO 8601 date format |

**Relationships**:
- None (standalone entity for display)

**Validation Rules**:
- `hs_object_id` must be unique across all contacts
- `email` must be valid email format when present
- `createdate` and `lastmodifieddate` must be valid ISO 8601 timestamps
- Phone fields should be E.164 format when present
- String fields have maximum lengths to prevent data issues

**State Transitions**:
- N/A (static display entity)

## Data Sources

### Synced Database Contacts
- Stored in Supabase PostgreSQL
- Updated via sync processes
- Fast local access
- May be slightly stale

### Live HubSpot Contacts
- Fetched real-time from HubSpot API
- Always current
- Subject to API rate limits
- Requires authentication

## TypeScript Interfaces

```typescript
interface HubSpotContact {
  hs_object_id: string;
  email: string;
  email_verification_status?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  mobilephone?: string;
  client_type_vip_status?: string;
  client_type_prospects?: string;
  address?: string;
  city?: string;
  zip?: string;
  createdate: string;
  lastmodifieddate: string;
}

interface ContactListResponse {
  contacts: HubSpotContact[];
  total: number;
  hasMore: boolean;
}
```