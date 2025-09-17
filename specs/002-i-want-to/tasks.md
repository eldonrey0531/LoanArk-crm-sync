# Tasks: Add HubSpot Database and Contacts Pages

**Input**: Design documents from `/specs/002-i-want-to/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
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

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup

- [x] T001 Verify project structure matches web application plan (frontend + backend)
- [x] T002 Confirm TypeScript 5.x, React 18, and required dependencies are installed

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [x] T003 [P] Contract test GET /hubspot-contacts-sync in netlify/functions/__tests__/test_hubspot_contacts_sync.test.js
- [x] T004 [P] Contract test GET /hubspot-contacts-live in netlify/functions/__tests__/test_hubspot_contacts_live.test.js
- [x] T005 [P] Integration test Supabase database page data loading in e2e/supabase-database-page.spec.ts
- [x] T006 [P] Integration test HubSpot contacts page data loading in e2e/hubspot-contacts-page.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [x] T007 [P] HubSpotContact TypeScript interface in src/types/hubspot.ts
- [x] T008 Netlify function GET /hubspot-contacts-sync in netlify/functions/hubspot-contacts-sync.js
- [x] T009 Netlify function GET /hubspot-contacts-live in netlify/functions/hubspot-contacts-live.js
- [x] T010 [P] useHubSpotContacts hook for data fetching in src/hooks/useHubSpotContacts.ts
- [x] T011 [P] ContactsTable component in src/components/ContactsTable.tsx
- [x] T012 HubSpotDatabase page component in src/pages/HubSpotDatabase.tsx
- [x] T013 HubSpotContacts page component in src/pages/HubSpotContacts.tsx
- [x] T014 Add routes for new pages in src/App.tsx

## Phase 3.4: Integration

- [x] T015 Connect hubspot-contacts-sync to Supabase database
- [x] T016 Connect hubspot-contacts-live to HubSpot CRM API
- [x] T017 Error handling for API failures and authentication
- [x] T018 Loading states and user feedback in UI components

## Phase 3.5: Polish

- [x] T019 [P] Unit tests for ContactsTable component in src/components/__tests__/ContactsTable.test.tsx
- [x] T020 [P] Unit tests for useHubSpotContacts hook in src/hooks/__tests__/useHubSpotContacts.test.ts
- [x] T021 Performance optimization for table rendering with large datasets
- [x] T022 Accessibility compliance (WCAG 2.1 AA) for table and pages
- [x] T023 Update navigation menu to include new pages
- [x] T024 Run quickstart.md validation scenarios

## Dependencies

- Tests (T003-T006) before implementation (T007-T014)
- T007 blocks T010, T011
- T008 blocks T015
- T009 blocks T016
- T010 blocks T012, T013
- T011 blocks T012, T013
- Implementation before polish (T019-T024)

## Parallel Example

```
# Launch T004-T007 together:
Task: "Contract test POST /api/users in tests/contract/test_users_post.py"
Task: "Contract test GET /api/users/{id} in tests/contract/test_users_get.py"
Task: "Integration test registration in tests/integration/test_registration.py"
Task: "Integration test auth in tests/integration/test_auth.py"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
