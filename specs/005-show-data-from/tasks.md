# Tasks: Email Verification Data Display

**Input**: Design documents from `/specs/005-show-data-from/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Extract: React 18 + TypeScript, Supabase + HubSpot APIs, web application structure
2. Load optional design documents:
   → data-model.md: Extract entities (SupabaseContact, HubSpotContact, ContactComparison)
   → contracts/: Extract API endpoints and component interfaces
   → research.md: Extract decisions (HubSpot API v3, CSS Grid layout)
3. Generate tasks by category:
   → Setup: Project structure, dependencies, linting
   → Tests: Contract tests, integration tests (TDD approach)
   → Core: Models, services, components, hooks
   → Integration: API connections, data flow
   → Polish: Performance, docs, accessibility
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Web application**: `src/` at repository root
- **Frontend**: `src/components/`, `src/hooks/`, `src/services/`
- **Backend**: `netlify/functions/`
- Paths shown below assume web application structure

## Phase 3.1: Setup

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize TypeScript project with React 18 dependencies
- [ ] T003 [P] Configure linting and formatting tools (ESLint + Prettier)
- [ ] T004 [P] Set up test environment (Vitest + React Testing Library)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests [P] - From contracts/api-contracts.ts

- [ ] T005 [P] Contract test Supabase API endpoints in src/__tests__/contracts/test-supabase-api.ts
- [ ] T006 [P] Contract test HubSpot API endpoints in src/__tests__/contracts/test-hubspot-api.ts
- [ ] T007 [P] Contract test Comparison API endpoints in src/__tests__/contracts/test-comparison-api.ts

### Component Contract Tests [P] - From contracts/component-contracts.ts

- [ ] T008 [P] Contract test EmailVerificationDataDisplay component in src/components/__tests__/contracts/test-email-verification-display.ts
- [ ] T009 [P] Contract test ComparisonTable component in src/components/__tests__/contracts/test-comparison-table.ts
- [ ] T010 [P] Contract test ComparisonRow component in src/components/__tests__/contracts/test-comparison-row.ts
- [ ] T011 [P] Contract test FilterControls component in src/components/__tests__/contracts/test-filter-controls.ts
- [ ] T012 [P] Contract test SummaryStats component in src/components/__tests__/contracts/test-summary-stats.ts

### Integration Tests [P] - From quickstart.md user stories

- [ ] T013 [P] Integration test side-by-side data display in src/__tests__/integration/test-side-by-side-display.spec.ts
- [ ] T014 [P] Integration test filtering and search functionality in src/__tests__/integration/test-filtering-search.spec.ts
- [ ] T015 [P] Integration test pagination controls in src/__tests__/integration/test-pagination.spec.ts
- [ ] T016 [P] Integration test responsive design in src/__tests__/integration/test-responsive-design.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Type Definitions [P] - From data-model.md entities

- [ ] T017 [P] SupabaseContact interface in src/types/supabase-contact.ts
- [ ] T018 [P] HubSpotContact interface in src/types/hubspot-contact.ts
- [ ] T019 [P] ContactComparison interface in src/types/contact-comparison.ts
- [ ] T020 [P] ContactDifference interface in src/types/contact-difference.ts
- [ ] T021 [P] ComparisonPageData interface in src/types/comparison-page-data.ts

### Service Layer - From research.md decisions

- [ ] T022 EmailVerificationDataService in src/services/emailVerificationDataService.ts
- [ ] T023 HubSpot API integration in src/services/hubspotService.ts
- [ ] T024 Supabase data fetching in src/services/supabaseService.ts
- [ ] T025 Data comparison logic in src/utils/dataComparison.ts

### Data Fetching Hook

- [ ] T026 useEmailVerificationData hook in src/hooks/useEmailVerificationData.ts
- [ ] T027 useContactComparison hook in src/hooks/useContactComparison.ts

### Core Components - From component contracts

- [ ] T028 EmailVerificationDataDisplay component in src/components/EmailVerificationDataDisplay.tsx
- [ ] T029 ComparisonTable component in src/components/ComparisonTable.tsx
- [ ] T030 ComparisonRow component in src/components/ComparisonRow.tsx
- [ ] T031 FilterControls component in src/components/FilterControls.tsx
- [ ] T032 SummaryStats component in src/components/SummaryStats.tsx
- [ ] T033 StatusIndicator component in src/components/StatusIndicator.tsx
- [ ] T034 DataCell component in src/components/DataCell.tsx
- [ ] T035 PaginationControls component in src/components/PaginationControls.tsx

### Page Integration

- [ ] T036 EmailVerificationDataPage in src/pages/EmailVerificationDataPage.tsx
- [ ] T037 Add route to App.tsx

## Phase 3.4: Integration

### Backend API - From API contracts

- [ ] T038 Email verification comparison endpoint in netlify/functions/email-verification-comparison.js
- [ ] T039 Supabase contacts endpoint in netlify/functions/supabase-contacts.js
- [ ] T040 HubSpot contacts endpoint in netlify/functions/hubspot-contacts.js

### Data Flow Integration

- [ ] T041 Connect services to API endpoints
- [ ] T042 Implement React Query caching strategy
- [ ] T043 Add error boundaries and error handling
- [ ] T044 Configure authentication middleware

## Phase 3.5: Polish

### Performance & Optimization

- [ ] T045 [P] Implement virtual scrolling for large datasets in src/components/ComparisonTable.tsx
- [ ] T046 [P] Add React.memo to comparison components
- [ ] T047 Performance tests (< 2s load time)
- [ ] T048 Bundle size optimization (< 500KB gzipped)

### Accessibility & UX

- [ ] T049 [P] WCAG 2.1 AA compliance audit
- [ ] T050 [P] Keyboard navigation support
- [ ] T051 [P] Screen reader compatibility
- [ ] T052 [P] Mobile responsive design validation

### Documentation & Quality

- [ ] T053 [P] Update README.md with new feature
- [ ] T054 [P] Add API documentation in docs/api.md
- [ ] T055 [P] Create user guide in docs/email-verification-display.md
- [ ] T056 [P] Add component documentation
- [ ] T057 Run manual testing checklist
- [ ] T058 Remove technical debt and code duplication

## Dependencies

### Test Dependencies (T005-T016) - MUST COMPLETE BEFORE implementation
- All contract tests (T005-T012) before any implementation
- Integration tests (T013-T016) before core components

### Implementation Dependencies
- Type definitions (T017-T021) before services (T022-T025)
- Services (T022-T025) before hooks (T026-T027)
- Hooks (T026-T027) before components (T028-T035)
- Components (T028-T035) before page integration (T036-T037)
- Page integration (T036-T037) before backend APIs (T038-T040)

### Integration Dependencies
- Backend APIs (T038-T040) before data flow integration (T041-T044)
- Data flow integration (T041-T044) before polish tasks (T045-T058)

## Parallel Execution Examples

```
# Launch contract tests together (different files, no dependencies):
Task: "Contract test Supabase API endpoints in src/__tests__/contracts/test-supabase-api.ts"
Task: "Contract test HubSpot API endpoints in src/__tests__/contracts/test-hubspot-api.ts"
Task: "Contract test Comparison API endpoints in src/__tests__/contracts/test-comparison-api.ts"

# Launch component contract tests together:
Task: "Contract test EmailVerificationDataDisplay component in src/components/__tests__/contracts/test-email-verification-display.ts"
Task: "Contract test ComparisonTable component in src/components/__tests__/contracts/test-comparison-table.ts"
Task: "Contract test ComparisonRow component in src/components/__tests__/contracts/test-comparison-row.ts"

# Launch type definition tasks together:
Task: "SupabaseContact interface in src/types/supabase-contact.ts"
Task: "HubSpotContact interface in src/types/hubspot-contact.ts"
Task: "ContactComparison interface in src/types/contact-comparison.ts"
```

## Notes

- [P] tasks = different files, no dependencies (can run in parallel)
- Verify tests fail before implementing (TDD principle)
- Commit after each task completion
- Use React Query for data fetching (from research.md)
- Follow CSS Grid layout for side-by-side display (from research.md)
- Implement HubSpot API v3 integration (from research.md)

## Task Generation Rules Applied

_Applied during main() execution_

1. **From Contracts**:
   - api-contracts.ts → 3 contract test tasks [P] (T005-T007)
   - component-contracts.ts → 5 contract test tasks [P] (T008-T012)

2. **From Data Model**:
   - 5 entities → 5 model creation tasks [P] (T017-T021)

3. **From User Stories** (quickstart.md):
   - 4 user stories → 4 integration test tasks [P] (T013-T016)

4. **Ordering**:
   - Setup (T001-T004) → Tests (T005-T016) → Types (T017-T021) → Services (T022-T025) → Hooks (T026-T027) → Components (T028-T035) → Pages (T036-T037) → Backend (T038-T040) → Integration (T041-T044) → Polish (T045-T058)

## Validation Checklist

_GATE: Checked by main() before returning_

- [x] All contracts have corresponding tests (api-contracts.ts, component-contracts.ts)
- [x] All entities have model tasks (SupabaseContact, HubSpotContact, ContactComparison, ContactDifference, ComparisonPageData)
- [x] All tests come before implementation (TDD: tests T005-T016 before implementation T017-T044)
- [x] Parallel tasks truly independent (different files marked [P])
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Dependencies properly ordered (tests → types → services → components → integration → polish)

---

**Total Tasks**: 58 | **Parallel Tasks**: 22 | **Sequential Tasks**: 36
**Test Tasks**: 12 | **Implementation Tasks**: 34 | **Polish Tasks**: 12