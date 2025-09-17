# Research Findings: Add HubSpot Database and Contacts Pages

## HubSpot CRM API v3 Contact Properties

**Decision**: Use HubSpot Contacts API endpoints `/crm/v3/objects/contacts` for live data and existing Supabase tables for synced data

**Rationale**: 
- HubSpot API v3 provides comprehensive contact data with all required properties
- Properties are accessed by internal names (case-sensitive)
- Synced data in Supabase maintains data integrity for offline/local operations
- API supports pagination, filtering, and property selection

**Alternatives considered**:
- HubSpot v1 API (deprecated, limited properties)
- Custom webhooks (complex setup, real-time only)

**Key Findings**:
- All required properties exist in HubSpot contacts
- `hs_object_id` is the unique identifier
- Properties like `email_verification_status` require specific scopes
- API rate limits: 100 requests/10 seconds for OAuth apps

## Table Display Best Practices in React

**Decision**: Use Radix UI Table components with TanStack Table for advanced features

**Rationale**:
- Radix UI provides accessible, unstyled table primitives
- TanStack Table offers sorting, filtering, pagination out-of-the-box
- Integrates well with Tailwind CSS for styling
- Supports large datasets with virtualization if needed
- TypeScript-friendly with full type safety

**Alternatives considered**:
- Material-UI DataGrid (heavier bundle, less customizable)
- React Table v7 (deprecated, TanStack Table is successor)
- Custom table implementation (time-consuming, accessibility issues)

**Key Findings**:
- Implement virtual scrolling for >1000 rows
- Add loading states and error boundaries
- Support column sorting and filtering
- Mobile-responsive design with horizontal scroll
- Export functionality for data analysis

## Data Synchronization Patterns

**Decision**: Implement dual data sources with clear separation between synced (Supabase) and live (HubSpot API) data

**Rationale**:
- Synced data provides fast local access and offline capability
- Live data ensures real-time accuracy
- Clear user indication of data source
- Separate error handling for each source
- Consistent data structure mapping

**Alternatives considered**:
- Always fetch from HubSpot (slow, rate limited)
- Cache HubSpot data locally (complex invalidation)
- Single source of truth (doesn't meet both requirements)

**Key Findings**:
- Use React Query for caching and synchronization
- Implement optimistic updates for better UX
- Handle API errors gracefully with fallbacks
- Provide manual refresh options
- Audit logging for data access patterns