# Tasks: Fix Contact Table Pagination and Loading

**Input**: Design documents from `/specs/003-description-the-next/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: React/TypeScript web app, server-side pagination, TanStack Table
2. Load optional design documents:
   → data-model.md: Extract entities → pagination state, contact records
   → contracts/: 2 API contracts → contract test tasks
   → research.md: Extract decisions → server-side pagination approach
   → quickstart.md: 5 test scenarios → integration tests
3. Generate tasks by category:
   → Setup: project structure validation, dependencies
   → Tests: contract tests, integration tests (TDD first)
   → Core: hook updates, component modifications
   → Integration: pagination state management
   → Polish: performance, accessibility, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests? Yes (2 contracts)
   → All entities have models? N/A (existing entities)
   → All endpoints implemented? Existing APIs
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/` for React components, `netlify/functions/` for APIs
- **Tests**: `src/components/__tests__/`, `netlify/functions/__tests__/`
- **Types**: `src/types/`

## Phase 3.1: Setup

- [x] T001 Validate project structure matches implementation plan
- [x] T002 [P] Verify TanStack Table and React Query dependencies installed
- [x] T003 [P] Confirm TypeScript interfaces for pagination state exist

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T004 [P] Contract test Supabase contacts API pagination in netlify/functions/__tests__/test_hubspot_contacts_sync_pagination.js
- [ ] T005 [P] Contract test HubSpot contacts API pagination in netlify/functions/__tests__/test_hubspot_contacts_live_pagination.js
- [ ] T006 [P] Integration test Supabase Database page pagination in e2e/supabase-database-pagination.spec.ts
- [ ] T007 [P] Integration test HubSpot Contacts page pagination in e2e/hubspot-contacts-pagination.spec.ts
- [ ] T008 [P] Unit test useHubSpotContacts hook pagination parameters in src/hooks/__tests__/useHubSpotContacts-pagination.test.ts
- [ ] T009 [P] Unit test ContactsTable manual pagination props in src/components/__tests__/ContactsTable-pagination.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T010 Update useHubSpotContacts hook for server-side pagination in src/hooks/useHubSpotContacts.ts
- [ ] T011 Modify ContactsTable component for manual pagination control in src/components/ContactsTable.tsx
- [ ] T012 Add pagination state management to SupabaseDatabase page in src/pages/SupabaseDatabase.tsx
- [ ] T013 Add pagination state management to HubSpotContacts page in src/pages/HubSpotContacts.tsx
- [ ] T014 Update ContactListResponse type with pagination metadata in src/types/hubspot.ts

## Phase 3.4: Integration

- [ ] T015 Connect pagination state between page components and ContactsTable
- [ ] T016 Implement loading states for pagination transitions
- [ ] T017 Add error handling for pagination failures
- [ ] T018 Optimize React Query caching for pagination

## Phase 3.5: Polish

- [ ] T019 [P] Add accessibility attributes for pagination controls
- [ ] T020 Performance test pagination loading times (< 2 seconds)
- [ ] T021 [P] Update component documentation with pagination features
- [ ] T022 Add pagination analytics and error tracking
- [ ] T023 Execute quickstart validation scenarios

## Dependencies

- Tests (T004-T009) before implementation (T010-T018)
- T010 blocks T012, T013 (hook update needed first)
- T011 blocks T012, T013 (component update needed first)
- T014 blocks T010, T011 (type updates needed first)
- Implementation (T010-T018) before polish (T019-T023)

## Parallel Example

```
# Launch T004-T005 together (API contract tests):
Task: "Contract test Supabase contacts API pagination in netlify/functions/__tests__/test_hubspot_contacts_sync_pagination.js"
Task: "Contract test HubSpot contacts API pagination in netlify/functions/__tests__/test_hubspot_contacts_live_pagination.js"

# Launch T006-T009 together (UI integration tests):
Task: "Integration test Supabase Database page pagination in e2e/supabase-database-pagination.spec.ts"
Task: "Integration test HubSpot Contacts page pagination in e2e/hubspot-contacts-pagination.spec.ts"
Task: "Unit test useHubSpotContacts hook pagination parameters in src/hooks/__tests__/useHubSpotContacts-pagination.test.ts"
Task: "Unit test ContactsTable manual pagination props in src/components/__tests__/ContactsTable-pagination.test.tsx"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing core features
- Commit after each task completion
- Follow TDD: Red → Green → Refactor cycle
- Test pagination with both small and large datasets

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts** (2 files):
   - supabase-contacts-api.yaml → T004 contract test [P]
   - hubspot-contacts-api.yaml → T005 contract test [P]

2. **From Data Model**:
   - Pagination State entity → T010, T014 implementation tasks
   - Contact Record entity → existing, no new tasks needed

3. **From User Stories** (5 scenarios in quickstart):
   - Supabase navigation → T006 integration test [P]
   - HubSpot navigation → T007 integration test [P]
   - Data completeness → T008 unit test [P]
   - Performance → T009 unit test [P]

4. **From Research**:
   - Server-side pagination decision → T010-T013 implementation tasks
   - Manual TanStack control → T011 component task

5. **Ordering**:
   - Setup → Tests → Core Implementation → Integration → Polish
   - Dependencies prevent parallel execution where files overlap

## Validation Checklist

_GATE: Checked by main() before returning_

- [x] All contracts have corresponding tests (2/2)
- [x] All entities have implementation tasks (pagination state covered)
- [x] All tests come before implementation (TDD order maintained)
- [x] Parallel tasks are independent (different file paths)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Total tasks: 23 (appropriate for feature complexity)
- [x] Dependencies clearly documented