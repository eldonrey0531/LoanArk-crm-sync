-- CRM Sync Database Schema Migration
-- Migration: 001_initial_schema
-- Date: 2025-09-17
-- Description: Initial database schema for LoanArk CRM Sync system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- HUBSPOT CONNECTIONS TABLE
-- ===========================================
CREATE TABLE hubspot_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint for single connection
ALTER TABLE hubspot_connections ADD CONSTRAINT unique_hubspot_connection UNIQUE (id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hubspot_connections_updated_at
    BEFORE UPDATE ON hubspot_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- SYNC SESSIONS TABLE
-- ===========================================
CREATE TABLE sync_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT UNIQUE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    records_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- CONTACTS TABLE
-- ===========================================
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hubspot_id TEXT UNIQUE NOT NULL,
    supabase_id UUID,
    data JSONB NOT NULL,
    last_sync TIMESTAMPTZ NOT NULL,
    sync_status TEXT CHECK (sync_status IN ('synced', 'pending', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- SYNC LOGS TABLE
-- ===========================================
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sync_sessions(id) ON DELETE CASCADE,
    operation TEXT CHECK (operation IN ('create', 'update', 'delete', 'sync')),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT CHECK (status IN ('success', 'error', 'warning')),
    details JSONB
);

-- ===========================================
-- AUDIT LOGS TABLE
-- ===========================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ===========================================
-- ERROR LOGS TABLE
-- ===========================================
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sync_sessions(id) ON DELETE SET NULL,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    context JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Contacts table indexes
CREATE INDEX idx_contacts_hubspot_id ON contacts(hubspot_id);
CREATE INDEX idx_contacts_sync_status ON contacts(sync_status);
CREATE INDEX idx_contacts_last_sync ON contacts(last_sync);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);

-- Sync logs indexes
CREATE INDEX idx_sync_logs_session_id ON sync_logs(session_id);
CREATE INDEX idx_sync_logs_timestamp ON sync_logs(timestamp);
CREATE INDEX idx_sync_logs_entity ON sync_logs(entity_type, entity_id);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_operation ON audit_logs(operation);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- Error logs indexes
CREATE INDEX idx_error_logs_session_id ON error_logs(session_id);
CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX idx_error_logs_type ON error_logs(error_type);

-- Sync sessions indexes
CREATE INDEX idx_sync_sessions_status ON sync_sessions(status);
CREATE INDEX idx_sync_sessions_start_time ON sync_sessions(start_time);
CREATE INDEX idx_sync_sessions_session_id ON sync_sessions(session_id);

-- ===========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE hubspot_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_sessions ENABLE ROW LEVEL SECURITY;

-- HubSpot Connections: Only authenticated users can access
CREATE POLICY "Users can view hubspot connections" ON hubspot_connections
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage hubspot connections" ON hubspot_connections
    FOR ALL USING (auth.role() = 'authenticated');

-- Contacts: Users can read all contacts, but write operations are restricted
CREATE POLICY "Users can view all contacts" ON contacts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage contacts" ON contacts
    FOR ALL USING (auth.role() = 'authenticated');

-- Sync Sessions: Users can view and manage their sync sessions
CREATE POLICY "Users can view sync sessions" ON sync_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage sync sessions" ON sync_sessions
    FOR ALL USING (auth.role() = 'authenticated');

-- Sync Logs: Users can view sync logs
CREATE POLICY "Users can view sync logs" ON sync_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Audit Logs: Users can view audit logs
CREATE POLICY "Users can view audit logs" ON audit_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Error Logs: Users can view error logs
CREATE POLICY "Users can view error logs" ON error_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- ===========================================
-- FUNCTIONS AND TRIGGERS
-- ===========================================

-- Function to automatically create audit log entries
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_row JSONB;
    new_row JSONB;
    operation_type TEXT;
BEGIN
    -- Determine operation type
    IF TG_OP = 'INSERT' THEN
        operation_type := 'create';
        old_row := NULL;
        new_row := row_to_json(NEW)::JSONB;
    ELSIF TG_OP = 'UPDATE' THEN
        operation_type := 'update';
        old_row := row_to_json(OLD)::JSONB;
        new_row := row_to_json(NEW)::JSONB;
    ELSIF TG_OP = 'DELETE' THEN
        operation_type := 'delete';
        old_row := row_to_json(OLD)::JSONB;
        new_row := NULL;
    END IF;

    -- Insert audit log entry
    INSERT INTO audit_logs (
        entity_type,
        entity_id,
        operation,
        old_data,
        new_data,
        user_id,
        ip_address,
        user_agent
    ) VALUES (
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN (old_row->>'id')
            ELSE (new_row->>'id')
        END,
        operation_type,
        old_row,
        new_row,
        auth.uid()::TEXT,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );

    RETURN CASE
        WHEN TG_OP = 'DELETE' THEN OLD
        ELSE NEW
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for key tables
CREATE TRIGGER audit_contacts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON contacts
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_sync_sessions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON sync_sessions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ===========================================
-- VIEWS FOR COMMON QUERIES
-- ===========================================

-- View for sync statistics
CREATE VIEW sync_statistics AS
SELECT
    COUNT(*) as total_contacts,
    COUNT(CASE WHEN sync_status = 'synced' THEN 1 END) as synced_contacts,
    COUNT(CASE WHEN sync_status = 'pending' THEN 1 END) as pending_contacts,
    COUNT(CASE WHEN sync_status = 'error' THEN 1 END) as error_contacts,
    MAX(last_sync) as last_sync_time,
    AVG(EXTRACT(EPOCH FROM (NOW() - last_sync))) as avg_sync_age_seconds
FROM contacts;

-- View for recent sync activity
CREATE VIEW recent_sync_activity AS
SELECT
    ss.id,
    ss.session_id,
    ss.start_time,
    ss.end_time,
    ss.status,
    ss.records_count,
    ss.error_count,
    EXTRACT(EPOCH FROM (ss.end_time - ss.start_time)) as duration_seconds,
    COUNT(sl.id) as log_entries
FROM sync_sessions ss
LEFT JOIN sync_logs sl ON ss.id = sl.session_id
WHERE ss.start_time >= NOW() - INTERVAL '7 days'
GROUP BY ss.id, ss.session_id, ss.start_time, ss.end_time, ss.status, ss.records_count, ss.error_count
ORDER BY ss.start_time DESC;

-- ===========================================
-- INITIAL DATA SEEDING
-- ===========================================

-- Insert default sync session for initialization
INSERT INTO sync_sessions (session_id, start_time, status)
VALUES ('initial_setup', NOW(), 'completed')
ON CONFLICT (session_id) DO NOTHING;

-- ===========================================
-- GRANTS AND PERMISSIONS
-- ===========================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions for views
GRANT SELECT ON sync_statistics TO authenticated;
GRANT SELECT ON recent_sync_activity TO authenticated;

-- ===========================================
-- COMMENTS FOR DOCUMENTATION
-- ===========================================

COMMENT ON TABLE hubspot_connections IS 'Stores HubSpot OAuth connection details and tokens';
COMMENT ON TABLE sync_sessions IS 'Tracks individual synchronization operations and their status';
COMMENT ON TABLE contacts IS 'Stores synchronized contact data from HubSpot';
COMMENT ON TABLE sync_logs IS 'Detailed logging of sync operations for debugging and monitoring';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for compliance and security';
COMMENT ON TABLE error_logs IS 'Tracks errors and exceptions for debugging and analysis';

COMMENT ON VIEW sync_statistics IS 'Aggregated statistics about contact synchronization status';
COMMENT ON VIEW recent_sync_activity IS 'Recent sync sessions with performance metrics';

-- Migration completed successfully
-- Version: 1.0.0
-- Applied: 2025-09-17