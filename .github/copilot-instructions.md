# GitHub Copilot Instructions for LoanArk CRM Sync

## Project Overview
LoanArk CRM Sync is a comprehensive CRM synchronization system that integrates HubSpot with internal systems, providing real-time data sync, OAuth authentication, connection monitoring, and user-friendly dashboards. The application follows strict constitutional principles for security-first architecture, type-safe development, and real-time data integrity.

## Constitutional Requirements (CRITICAL)

All development must comply with these non-negotiable principles:

### 1. Security-First Architecture
- All API interactions MUST route through Netlify Functions or Express server
- No API keys or sensitive operations in client-side code
- Frontend communicates only with backend endpoints, never directly with external APIs
- HTTPS-only communication with encrypted data transmission

### 2. Type-Safe Development
- Strict TypeScript throughout entire codebase
- All API responses have defined interfaces with comprehensive type checking
- No `any` types allowed except documented exceptions
- Generic types for reusable components

### 3. Test-Driven Development (NON-NEGOTIABLE)
- All features must have tests written before implementation
- Unit test coverage > 80%; Integration tests for API interactions
- E2E tests for critical user flows using Vitest, React Testing Library, Playwright, MSW

### 4. Real-Time Data Integrity
- Sync operations must maintain data consistency across Supabase and HubSpot
- Transactional updates required with conflict resolution strategies
- Audit logging for all data changes and sync operations

### 5. Performance Optimization
- UI response time < 2 seconds; API calls optimized with caching
- Bundle size < 500KB (gzipped); Database queries indexed
- Support 50+ concurrent users with efficient resource usage

### 6. User-Centric Design
- Mobile-first responsive design with WCAG 2.1 AA compliance
- Intuitive user experience with clear error messaging
- Keyboard navigation support and screen reader compatibility

### 7. Scalability & Reliability
- Horizontal scaling support with 99.9% uptime target
- Graceful error handling and comprehensive monitoring
- Bidirectional sync capabilities with real-time status monitoring

## Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Vercel Serverless Functions (Node.js) + Express server
- **Database**: Supabase (PostgreSQL)
- **External API**: HubSpot CRM API v3+
- **UI Framework**: Radix UI + Tailwind CSS
- **State Management**: React Query + Context API
- **Testing**: Vitest + React Testing Library + Playwright + MSW
- **Build Tools**: Vite + SWC + TypeScript
- **Package Manager**: npm (with Bun support)
- **Code Quality**: ESLint + Prettier + Husky + lint-staged
- **Deployment**: Vercel (frontend) + Vercel Serverless Functions (backend)

## Code Style & Conventions

### TypeScript Standards
- Strict type checking enabled (`"strict": true`)
- No `any` types allowed
- Comprehensive interface definitions required
- Generic types for reusable components

### React Patterns
- Functional components with hooks
- Custom hooks for shared logic
- Context API for global state
- React Query for server state management

### File Organization
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Radix UI + Tailwind)
│   ├── BulkSyncDialog.tsx
│   ├── ContactsTable.tsx
│   ├── ErrorBoundary.tsx
│   ├── HubSpotAuth.tsx
│   ├── HubSpotErrorBoundary.tsx
│   ├── LatestCreatedPage.tsx
│   ├── Layout.tsx
│   ├── SyncControls.tsx
│   ├── SyncErrorDisplay.tsx
│   ├── SyncFilters.tsx
│   ├── SyncOperationTable.tsx
│   ├── SyncProgressBar.tsx
│   ├── SyncStatusIndicator.tsx
│   └── __tests__/
├── pages/              # Route components
│   ├── Contacts.tsx
│   ├── ContactsViewer.tsx
│   ├── Dashboard.tsx
│   ├── EmailVerificationSyncPage.tsx
│   ├── HubSpotCallback.tsx
│   └── HubSpotContacts.tsx
├── contexts/           # React context providers
│   └── HubSpotContext.tsx
├── hooks/              # Custom React hooks
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   ├── useContacts.ts
│   ├── useDashboardData.ts
│   ├── useEmailVerificationRecords.ts
│   ├── useHubSpotConnection.ts
│   ├── useHubSpotContacts.ts
│   ├── useHubSpotSync.ts
│   ├── useSyncOperations.ts
│   ├── useSyncStatistics.ts
│   └── __tests__/
├── services/           # API integration services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── lib/               # Third-party library configurations
├── integrations/      # External service integrations
│   └── supabase/
├── __tests__/         # Test utilities and mocks
└── test/              # Additional test files

netlify/
└── functions/         # Serverless backend functions
    ├── email-verification-records.js
    ├── hubspot-contacts-all.js
    ├── hubspot-contacts-live.js
    ├── hubspot-contacts-sync.js
    ├── hubspot-contacts.js
    ├── hubspot-test.js
    ├── sync-email-verification.js
    ├── sync-status.js
    └── __tests__/

server/
└── api.js            # Express server for local development

specs/                 # Feature specifications and planning
├── 004-now-let-s/    # Current feature branch
└── ...

.github/               # GitHub configuration
├── prompts/          # AI assistant prompts
├── workflows/        # GitHub Actions
└── copilot-instructions.md

.specify/             # Implementation planning system
├── memory/          # Constitutional knowledge
├── scripts/         # Automation scripts
└── templates/       # Planning templates

scripts/              # Build and utility scripts
docs/                 # Documentation
e2e/                  # End-to-end tests
public/               # Static assets
```

## Security Requirements
- **API Keys**: Never commit to repository
- **Environment Variables**: Use `.env` files (not committed)
- **OAuth Tokens**: Secure storage with automatic refresh
- **Input Validation**: Sanitize all user inputs
- **HTTPS Only**: All communications must be encrypted

## Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint and service testing
- **E2E Tests**: Critical user flow validation
- **Test Coverage**: Minimum 80% coverage required

## Development Workflow

### Git Branching
- `main`: Production-ready code
- `001-crm-sync`: Current feature branch
- Feature branches: `feature/feature-name`

### Commit Messages
- Use conventional commits format
- Include ticket/issue references
- Be descriptive but concise

### Code Review
- All changes require review
- Focus on security, performance, and maintainability
- Ensure tests pass before merge

## Key Implementation Details

### OAuth Authentication
- HubSpot OAuth 2.0 flow with PKCE
- Automatic token refresh
- Secure token storage
- CSRF protection

### API Integration
- RESTful API design
- Error handling with retry logic
- Rate limiting compliance
- Request/response logging

### Data Synchronization
- Bidirectional sync capabilities
- Conflict resolution strategies
- Audit logging for all changes
- Real-time status monitoring
- **Email Verification Sync**: Sync email verification status from Supabase contacts to HubSpot using hs_object_id matching

## Performance Goals
- UI response time < 2 seconds
- API calls optimized with caching
- Bundle size < 500KB
- Support 50+ concurrent users

## Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Mobile-responsive design

## Recent Changes
1. **Email Verification Status Sync**: Complete implementation planning with research, design, and task breakdown
2. **Express Server Integration**: Added local development server (server/api.js) alongside Netlify Functions
3. **Enhanced Testing Infrastructure**: Comprehensive test suite with Vitest, Playwright, and MSW
4. **Build Tools Enhancement**: Added SWC, bundle analyzer, and development optimizations
5. **Code Quality Tools**: Implemented Husky, lint-staged, and enhanced ESLint/Prettier setup
6. **Project Structure Refinement**: Organized components, hooks, and services with proper testing
7. **OAuth Authentication System**: Complete implementation with HubSpot OAuth 2.0
8. **Netlify Deployment**: Automated CI/CD pipeline configured
9. **Documentation**: Complete setup and deployment guides

## Common Patterns

### Error Handling
```typescript
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('API Error:', error);
  throw new Error('Operation failed');
}
```

### API Service Pattern
```typescript
class ApiService {
  private async makeRequest(endpoint: string, options: RequestInit) {
    const response = await fetch(endpoint, options);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  }
}
```

### Email Verification Sync Pattern
```typescript
// Service for syncing email verification status
class EmailVerificationSyncService {
  async syncToHubSpot(supabaseContactId: number, hubspotContactId: string, status: string) {
    try {
      // Validate contact exists in Supabase
      const contact = await this.getSupabaseContact(supabaseContactId);
      
      // Update HubSpot contact
      const result = await this.updateHubSpotContact(hubspotContactId, {
        email_verification_status: status
      });
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Sync failed:', error);
      return { success: false, error: error.message };
    }
  }
}
```

### Sync Status UI Pattern
```typescript
// Component for displaying sync operation status
interface SyncStatusProps {
  status: 'idle' | 'pending' | 'success' | 'error';
  onRetry?: () => void;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ status, onRetry }) => {
  if (status === 'pending') return <Loader2 className="animate-spin" />;
  if (status === 'success') return <CheckCircle className="text-green-500" />;
  if (status === 'error') return (
    <div className="flex items-center gap-2">
      <XCircle className="text-red-500" />
      {onRetry && <Button onClick={onRetry} size="sm">Retry</Button>}
    </div>
  );
  return null;
};
```

## Quality Gates
- ✅ TypeScript compilation passes
- ✅ ESLint rules pass
- ✅ Unit tests pass (>80% coverage)
- ✅ Security audit passes
- ✅ Performance benchmarks met

## Deployment
- **Development**: `npm run dev`
- **Production**: Automated Netlify deployment
- **Environment**: Separate configs for dev/staging/prod

---
*This file is automatically maintained by the implementation planning system.*




