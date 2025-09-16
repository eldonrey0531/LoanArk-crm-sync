# Phase 1: Data Model & Architecture

## Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   HubSpot       │     │   Sync          │     │   Contact       │
│   Connection    │◄────┤   Session       │◄────┤   Record        │
│                 │     │                 │     │                 │
│ - id            │     │ - id            │     │ - id            │
│ - access_token  │     │ - session_id    │     │ - hubspot_id    │
│ - refresh_token │     │ - start_time    │     │ - supabase_id   │
│ - expires_at    │     │ - end_time      │     │ - data          │
│ - created_at    │     │ - status        │     │ - last_sync     │
│ - updated_at    │     │ - records_count │     │ - sync_status   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Sync          │     │   Audit         │     │   Error         │
│   Log           │     │   Log           │     │   Log           │
│                 │     │                 │     │                 │
│ - id            │     │ - id            │     │ - id            │
│ - session_id    │     │ - entity_type   │     │ - session_id    │
│ - operation     │     │ - entity_id     │     │ - error_type    │
│ - entity_type   │     │ - operation     │     │ - error_message │
│ - entity_id     │     │ - old_data      │     │ - stack_trace   │
│ - timestamp     │     │ - new_data      │     │ - timestamp     │
│ - status        │     │ - user_id       │     │ - resolved      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Core Entities

### HubSpot Connection

**Purpose**: Manages OAuth authentication and connection state
**Fields**:

- `id`: UUID, Primary Key
- `access_token`: Encrypted text, HubSpot access token
- `refresh_token`: Encrypted text, HubSpot refresh token
- `expires_at`: Timestamp, Token expiration time
- `created_at`: Timestamp, Record creation time
- `updated_at`: Timestamp, Last update time

**Validation Rules**:

- Tokens must be encrypted at rest
- Expiration time must be validated before API calls
- Refresh token must be used to obtain new access tokens

### Sync Session

**Purpose**: Tracks individual synchronization operations
**Fields**:

- `id`: UUID, Primary Key
- `session_id`: String, Unique session identifier
- `start_time`: Timestamp, Sync start time
- `end_time`: Timestamp, Sync end time (nullable)
- `status`: Enum (pending, running, completed, failed), Current status
- `records_count`: Integer, Number of records processed
- `error_count`: Integer, Number of errors encountered

**Validation Rules**:

- Status must transition logically (pending → running → completed/failed)
- End time must be after start time
- Records count must be non-negative

### Contact Record

**Purpose**: Stores synchronized contact data
**Fields**:

- `id`: UUID, Primary Key
- `hubspot_id`: String, HubSpot contact ID
- `supabase_id`: UUID, Internal database ID
- `data`: JSONB, Complete contact data
- `last_sync`: Timestamp, Last synchronization time
- `sync_status`: Enum (synced, pending, error), Sync status
- `created_at`: Timestamp, Record creation time
- `updated_at`: Timestamp, Last update time

**Validation Rules**:

- HubSpot ID must be unique
- Data must be valid JSON
- Sync status must reflect actual state

### Sync Log

**Purpose**: Detailed logging of sync operations
**Fields**:

- `id`: UUID, Primary Key
- `session_id`: UUID, Foreign Key to Sync Session
- `operation`: Enum (create, update, delete, sync), Operation type
- `entity_type`: String, Type of entity (contact, company, deal)
- `entity_id`: String, ID of the affected entity
- `timestamp`: Timestamp, Operation timestamp
- `status`: Enum (success, error, warning), Operation status
- `details`: JSONB, Additional operation details

**Validation Rules**:

- Session ID must reference existing sync session
- Entity type must be valid
- Timestamp must be within session time range

### Audit Log

**Purpose**: Comprehensive audit trail for compliance
**Fields**:

- `id`: UUID, Primary Key
- `entity_type`: String, Type of audited entity
- `entity_id`: String, ID of audited entity
- `operation`: Enum (create, update, delete), Operation performed
- `old_data`: JSONB, Previous state (nullable)
- `new_data`: JSONB, New state (nullable)
- `user_id`: String, User who performed operation
- `timestamp`: Timestamp, Audit timestamp
- `ip_address`: String, Client IP address
- `user_agent`: String, Client user agent

**Validation Rules**:

- Entity type and ID must be valid
- Old/new data must be consistent with operation type
- User ID must be authenticated

### Error Log

**Purpose**: Tracks errors and exceptions for debugging
**Fields**:

- `id`: UUID, Primary Key
- `session_id`: UUID, Foreign Key to Sync Session (nullable)
- `error_type`: String, Type of error
- `error_message`: String, Error description
- `stack_trace`: Text, Full stack trace
- `context`: JSONB, Additional error context
- `timestamp`: Timestamp, Error occurrence time
- `resolved`: Boolean, Whether error has been resolved

**Validation Rules**:

- Error type must be categorized
- Stack trace must be sanitized for security
- Context must be valid JSON

## Data Flow Architecture

### Synchronization Flow

1. **Trigger**: Scheduled or manual sync initiation
2. **Authentication**: Validate HubSpot connection and refresh tokens
3. **Data Retrieval**: Fetch contacts from HubSpot API with pagination
4. **Transformation**: Map HubSpot data to internal schema
5. **Validation**: Check data integrity and business rules
6. **Storage**: Update Supabase with new/changed data
7. **Audit**: Log all operations for compliance
8. **Notification**: Update UI with sync status

### Error Handling Flow

1. **Detection**: Catch exceptions and API errors
2. **Classification**: Categorize error type and severity
3. **Logging**: Record error details in error log
4. **Recovery**: Attempt automatic recovery if possible
5. **Notification**: Alert user of issues
6. **Escalation**: Escalate critical errors to administrators

### State Management Flow

1. **Connection State**: Track HubSpot authentication status
2. **Sync State**: Monitor active synchronization operations
3. **Data State**: Maintain cache of contact data
4. **UI State**: Reflect current application state to user

## Database Schema

### Tables

```sql
-- HubSpot connection management
CREATE TABLE hubspot_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    access_token TEXT NOT NULL, -- Encrypted
    refresh_token TEXT NOT NULL, -- Encrypted
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync session tracking
CREATE TABLE sync_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    records_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact data storage
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hubspot_id TEXT UNIQUE NOT NULL,
    supabase_id UUID,
    data JSONB NOT NULL,
    last_sync TIMESTAMPTZ NOT NULL,
    sync_status TEXT CHECK (sync_status IN ('synced', 'pending', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Detailed sync logging
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sync_sessions(id),
    operation TEXT CHECK (operation IN ('create', 'update', 'delete', 'sync')),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT CHECK (status IN ('success', 'error', 'warning')),
    details JSONB
);

-- Audit trail
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    operation TEXT CHECK (operation IN ('create', 'update', 'delete')),
    old_data JSONB,
    new_data JSONB,
    user_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Error tracking
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sync_sessions(id),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    context JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE
);
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_contacts_hubspot_id ON contacts(hubspot_id);
CREATE INDEX idx_contacts_sync_status ON contacts(sync_status);
CREATE INDEX idx_contacts_last_sync ON contacts(last_sync);
CREATE INDEX idx_sync_logs_session_id ON sync_logs(session_id);
CREATE INDEX idx_sync_logs_timestamp ON sync_logs(timestamp);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_error_logs_session_id ON error_logs(session_id);
CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp);

-- Unique constraints
ALTER TABLE hubspot_connections ADD CONSTRAINT unique_hubspot_connection UNIQUE (id);
ALTER TABLE contacts ADD CONSTRAINT unique_hubspot_contact UNIQUE (hubspot_id);
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE hubspot_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (example - customize based on auth requirements)
CREATE POLICY "Users can view their own data" ON contacts
    FOR SELECT USING (auth.uid() = supabase_id);
```

## API Design

### REST Endpoints

- `GET /api/contacts` - List contacts with filtering
- `POST /api/contacts/sync` - Trigger manual sync
- `GET /api/sync/status` - Get current sync status
- `GET /api/connections/hubspot` - Check HubSpot connection
- `POST /api/connections/hubspot` - Establish HubSpot connection

### WebSocket Events

- `sync:start` - Sync operation started
- `sync:progress` - Sync progress update
- `sync:complete` - Sync operation completed
- `sync:error` - Sync error occurred
- `connection:status` - Connection status changed

## State Transitions

### Sync Status Flow

```
pending → running → completed
    ↓        ↓        ↓
  error    error    error (partial failure)
```

### Connection Status Flow

```
disconnected → connecting → connected
               ↓            ↓
             error        error (token expired)
```

### Contact Sync Status Flow

```
pending → syncing → synced
   ↓        ↓        ↓
 error    error    pending (resync needed)
```

## Performance Considerations

### Query Optimization

- Use appropriate indexes for common query patterns
- Implement pagination for large result sets
- Cache frequently accessed data
- Use database connection pooling

### Data Volume Handling

- Implement data partitioning for large datasets
- Use batch operations for bulk updates
- Archive old audit logs periodically
- Compress large JSONB fields

### Monitoring

- Track query performance metrics
- Monitor database connection usage
- Set up alerts for slow queries
- Log performance anomalies
