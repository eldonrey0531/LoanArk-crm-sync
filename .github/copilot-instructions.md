# GitHub Copilot Instructions for LoanArk CRM Sync

## Project Overview
LoanArk CRM Sync is a comprehensive CRM synchronization system that integrates HubSpot with internal systems, providing real-time data sync, OAuth authentication, connection monitoring, and user-friendly dashboards.

## Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Netlify Functions (Node.js)
- **Database**: Supabase (PostgreSQL)
- **External API**: HubSpot CRM API v3+
- **UI Framework**: Radix UI + Tailwind CSS
- **State Management**: React Query + Context API
- **Testing**: Vitest + React Testing Library + Playwright

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
â”œâ”€â”€ components/     # Reusable UI components
â”œâ”€â”€ pages/         # Route components
â”œâ”€â”€ services/      # API integration services
â”œâ”€â”€ contexts/      # React context providers
â”œâ”€â”€ hooks/         # Custom React hooks
â”œâ”€â”€ utils/         # Utility functions
â”œâ”€â”€ lib/          # Third-party library configurations
â””â”€â”€ types/        # TypeScript type definitions
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
1. **OAuth Authentication System**: Complete implementation with HubSpot OAuth 2.0
2. **Netlify Deployment**: Automated CI/CD pipeline configured
3. **Testing Infrastructure**: Comprehensive test suite with 15 OAuth tests
4. **Documentation**: Complete setup and deployment guides

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

### Component Structure
```typescript
interface ComponentProps {
  data: DataType;
  onAction: (action: ActionType) => void;
}

export const ComponentName: React.FC<ComponentProps> = ({ data, onAction }) => {
  return (
    <div>
      {/* Component implementation */}
    </div>
  );
};
```

## Quality Gates
- âœ… TypeScript compilation passes
- âœ… ESLint rules pass
- âœ… Unit tests pass (>80% coverage)
- âœ… Security audit passes
- âœ… Performance benchmarks met

## Deployment
- **Development**: `npm run dev`
- **Production**: Automated Netlify deployment
- **Environment**: Separate configs for dev/staging/prod

---
*This file is automatically maintained by the implementation planning system.*




