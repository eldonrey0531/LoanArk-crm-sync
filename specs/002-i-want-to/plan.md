# Implementation Plan: Add HubSpot Database and Contacts Pages

**Branch**: `002-i-want-to` | **Date**: September 17, 2025 | **Spec**: C:\Users\raze0\Documents\trial\LoanArk-crm-sync-main\specs\002-i-want-to\spec.md
***Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [x] Phase 4: Implementation complete
- [x] Phase 5: Validation passed: Feature specification from `/specs/002-i-want-to/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Add two new pages to the CRM sync application: a HubSpot Database page displaying synced contact records and a HubSpot Contacts page displaying live contact data from HubSpot API, both showing contact information in table format with specific required properties.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: React 18, HubSpot CRM API v3+, Supabase, Radix UI, Tailwind CSS  
**Storage**: Supabase (PostgreSQL) for synced data, HubSpot API for live data  
**Testing**: Vitest + React Testing Library for unit tests, Playwright for E2E tests  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: web application (frontend + backend)  
**Performance Goals**: UI response time < 2 seconds, API calls optimized with caching  
**Constraints**: Type-safe development, security-first (OAuth, HTTPS), accessibility (WCAG 2.1 AA), mobile-responsive  
**Scale/Scope**: Support 50+ concurrent users, display contact data with 13 properties

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- ✅ Security-First Architecture: Uses OAuth for HubSpot authentication, HTTPS-only, secure token storage
- ✅ Type-Safe Development: TypeScript with strict checking, comprehensive interfaces
- ✅ Test-Driven Development: Unit tests (>80% coverage), integration tests for API, E2E tests for user flows
- ✅ Real-Time Data Integrity: Sync operations maintain consistency, audit logging
- ✅ Performance Optimization: UI <2s, API caching, bundle <500KB
- ✅ User-Centric Design: Mobile-responsive, WCAG 2.1 AA, intuitive UX
- ✅ Scalability & Reliability: Horizontal scaling support, graceful error handling
- ✅ Technology Stack: React 18 + TypeScript + Vite, Netlify Functions, Supabase, HubSpot API v3+, Radix UI + Tailwind, React Query + Context
- ✅ Code Quality: ESLint, Prettier, Husky, Conventional Commits
- ✅ Security Requirements: HTTPS, env vars for keys, input validation, XSS/CSRF protection
- ✅ Performance Standards: Lighthouse >90 performance, Core Web Vitals
- ✅ Development Workflow: Feature branches, code review, quality gates
- ✅ Deployment: Automated CI/CD with Netlify

**Status**: PASS - No violations detected

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2: Web application (frontend + backend detected)

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context**:
   - HubSpot contact properties mapping and API endpoints
   - Table component best practices for large datasets
   - Data fetching strategies for synced vs live data

2. **Generate and dispatch research agents**:

   ```
   Task: "Research HubSpot CRM API v3 contact properties and endpoints"
   Task: "Find best practices for displaying tabular data in React with Radix UI"
   Task: "Research data synchronization patterns for local vs remote data sources"
   ```

3. **Consolidate findings** in `research.md`

**Output**: research.md with decisions documented

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load tasks-template.md as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each API endpoint → contract test task [P]
- Each page component → implementation task
- Data fetching hooks → service layer tasks
- UI components for tables → component tasks

**Ordering Strategy**:

- TDD order: API contract tests first
- Dependency order: Services before components before pages
- Parallel execution for independent components [P]
- Sequential for dependent features

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/tasks command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
