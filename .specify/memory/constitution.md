# LoanArk CRM Sync Constitution

## Core Principles

### I. Security-First Architecture

Every component must prioritize security; API keys and sensitive data must be encrypted; Authentication and authorization required for all data access; Regular security audits mandatory

### II. Type-Safe Development

TypeScript mandatory for all code; Strict type checking enabled; No `any` types allowed; Comprehensive interface definitions required

### III. Test-Driven Development (NON-NEGOTIABLE)

All features must have tests written before implementation; Unit test coverage > 80%; Integration tests for API interactions; E2E tests for critical user flows

### IV. Real-Time Data Integrity

Sync operations must maintain data consistency; Transactional updates required; Conflict resolution strategies implemented; Audit logging for all data changes

### V. Performance Optimization

UI response time < 2 seconds; API calls optimized with caching; Database queries indexed; Bundle size monitored and optimized

### VI. User-Centric Design

Mobile-first responsive design; Accessibility standards (WCAG 2.1 AA) compliance; Intuitive user experience; Clear error messaging

### VII. Scalability & Reliability

Horizontal scaling support; 99.9% uptime target; Graceful error handling; Comprehensive monitoring and alerting

## Technical Standards

### Technology Stack Requirements

- Frontend: React 18 + TypeScript + Vite
- Backend: Netlify Functions (Node.js runtime) + Express server (development)
- Database: Supabase (PostgreSQL)
- External APIs: HubSpot CRM API v3+
- UI Framework: Radix UI + Tailwind CSS
- State Management: React Query + Context API
- Build Tool: Vite with SWC
- Package Manager: npm (with lockfile)
- Testing: Vitest + React Testing Library + Playwright + MSW

### Code Quality Standards

- ESLint configuration with strict rules
- Prettier for consistent formatting
- Husky for git hooks (pre-commit, pre-push)
- Commit message conventions (Conventional Commits)
- Code review required for all changes
- Documentation required for public APIs

### Security Requirements

- HTTPS-only communication
- API keys stored in environment variables
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Regular dependency updates
- Security headers implementation

### Performance Standards

- Lighthouse scores: Performance > 90, Accessibility > 95, SEO > 90
- Core Web Vitals compliance
- Bundle size < 500KB (gzipped)
- First Contentful Paint < 1.5s
- Time to Interactive < 3s

## Development Workflow

### Branching Strategy

- Main branch: production-ready code
- Feature branches: feature/[number]-[description]
- Bugfix branches: bugfix/[number]-[description]
- Release branches: release/v[major].[minor]
- Hotfix branches: hotfix/[number]-[description]

### Code Review Process

- All PRs require at least 2 approvals
- Automated tests must pass
- Code coverage requirements met
- Security scan clean
- Performance benchmarks maintained
- Documentation updated

### Quality Gates

- Unit tests: > 80% coverage
- Integration tests: All critical paths covered
- E2E tests: Happy path and error scenarios
- Performance tests: Benchmarks met
- Security tests: No high/critical vulnerabilities
- Accessibility tests: WCAG 2.1 AA compliance

### Deployment Process

- Automated CI/CD pipeline
- Staging environment for testing
- Production deployment requires approval
- Rollback plan documented
- Monitoring alerts configured
- Post-deployment verification

## Governance

### Constitution Authority

This constitution supersedes all other practices and guidelines; All team members must comply with these principles; Constitution changes require team consensus and documentation

### Amendment Process

- Proposed changes documented in PR
- Team review and discussion
- Consensus required for approval
- Implementation plan documented
- Migration strategy defined
- Rollback plan prepared

### Compliance Verification

- Regular constitution reviews (quarterly)
- Automated compliance checks in CI/CD
- Code review checklist includes constitution verification
- Non-compliance issues escalated immediately
- Training provided for new team members

### Runtime Guidance

Use this constitution as the foundation for all decisions; When in doubt, refer to these principles; Complexity must be justified against these standards; Simplicity and maintainability prioritized

**Version**: 1.0.0 | **Ratified**: 2025-09-17 | **Last Amended**: 2025-09-17
