# Tasks: Email Verification Status Sync

**Input**: Design documents from `/specs/004-now-let-s/`
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

- **Web app**: `src/` for frontend, `netlify/functions/` for backend
- **Frontend**: React components in `src/components/`, pages in `src/pages/`
- **Backend**: Netlify functions in `netlify/functions/`
- **Tests**: Component tests in `src/components/__tests__/`, E2E in `e2e/`

## Phase 3.1: Setup

- [ ] T001 Create feature branch directory structure per implementation plan
- [ ] T002 [P] Configure TypeScript interfaces for email verification sync in src/types/emailVerification.ts
- [ ] T003 [P] Set up environment variables for HubSpot API integration
- [ ] T004 [P] Configure ESLint rules for new feature files

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T005 [P] Contract test GET /api/email-verification-records in src/__tests__/contracts/test-get-email-verification-records.test.ts
- [ ] T006 [P] Contract test POST /api/sync-email-verification in src/__tests__/contracts/test-sync-email-verification.test.ts
- [ ] T007 [P] Contract test GET /api/sync-status/{operationId} in src/__tests__/contracts/test-get-sync-status.test.ts
- [ ] T008 [P] Integration test email verification sync workflow in e2e/email-verification-sync.spec.ts
- [ ] T009 [P] Component test EmailVerificationSync page in src/pages/__tests__/EmailVerificationSyncPage.test.tsx
- [ ] T010 [P] Component test SyncStatus indicator in src/components/__tests__/SyncStatus.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T011 [P] SupabaseContact entity interface in src/types/emailVerification.ts
- [ ] T012 [P] HubSpotContact entity interface in src/types/emailVerification.ts
- [ ] T013 [P] SyncOperation entity interface in src/types/emailVerification.ts
- [ ] T014 [P] EmailVerificationSyncService in src/services/emailVerificationSyncService.ts
- [ ] T015 [P] Supabase query service for email verification records in src/services/supabaseEmailVerificationService.ts
- [ ] T016 [P] HubSpot contact update service in src/services/hubspotEmailVerificationService.ts
- [ ] T017 [P] EmailVerificationSync page component in src/pages/EmailVerificationSync.tsx
- [ ] T018 [P] SyncStatus display component in src/components/SyncStatus.tsx
- [ ] T019 [P] EmailVerificationTable component in src/components/EmailVerificationTable.tsx
- [ ] T020 Netlify function for GET /api/email-verification-records in netlify/functions/email-verification-records.js
- [ ] T021 Netlify function for POST /api/sync-email-verification in netlify/functions/sync-email-verification.js
- [ ] T022 Netlify function for GET /api/sync-status in netlify/functions/sync-status.js
- [ ] T023 [P] Custom hook for email verification sync in src/hooks/useEmailVerificationSync.ts
- [ ] T024 Input validation for email verification status values
- [ ] T025 Error handling and user feedback for sync failures

## Phase 3.4: Integration

- [ ] T026 Connect EmailVerificationSyncService to Supabase client
- [ ] T027 Connect HubSpot service to existing HubSpot API integration
- [ ] T028 Implement operation tracking and status persistence
- [ ] T029 Add request/response logging for sync operations
- [ ] T030 Configure CORS headers for new API endpoints
- [ ] T031 Implement rate limiting for HubSpot API calls

## Phase 3.5: Polish

- [ ] T032 [P] Unit tests for EmailVerificationSyncService in src/services/__tests__/emailVerificationSyncService.test.ts
- [ ] T033 [P] Unit tests for validation utilities in src/utils/__tests__/emailVerificationValidation.test.ts
- [ ] T034 [P] Unit tests for custom hooks in src/hooks/__tests__/useEmailVerificationSync.test.ts
- [ ] T035 Performance optimization for large record sets
- [ ] T036 [P] Update README.md with email verification sync documentation
- [ ] T037 [P] Add email verification sync to main navigation
- [ ] T038 Accessibility improvements for sync status indicators
- [ ] T039 Remove code duplication and refactor common patterns
- [ ] T040 Execute quickstart.md validation scenarios

## Dependencies

- Tests (T005-T010) before implementation (T011-T025)
- T011-T013 blocks T014-T016 (entity interfaces needed for services)
- T014 blocks T017-T019, T023 (service needed for components)
- T017-T019 blocks T040 (components needed for validation)
- T020-T022 blocks T026-T031 (API endpoints needed for integration)
- Implementation (T011-T031) before polish (T032-T040)

## Parallel Example

```
# Launch T005-T010 together (all test files are independent):
Task: "Contract test GET /api/email-verification-records in src/__tests__/contracts/test-get-email-verification-records.test.ts"
Task: "Contract test POST /api/sync-email-verification in src/__tests__/contracts/test-sync-email-verification.test.ts"
Task: "Contract test GET /api/sync-status/{operationId} in src/__tests__/contracts/test-get-sync-status.test.ts"
Task: "Integration test email verification sync workflow in e2e/email-verification-sync.spec.ts"
Task: "Component test EmailVerificationSync page in src/pages/__tests__/EmailVerificationSyncPage.test.tsx"
Task: "Component test SyncStatus indicator in src/components/__tests__/SyncStatus.test.tsx"
```

```
# Launch T011-T013 together (entity interfaces are independent):
Task: "SupabaseContact entity interface in src/types/emailVerification.ts"
Task: "HubSpotContact entity interface in src/types/emailVerification.ts"
Task: "SyncOperation entity interface in src/types/emailVerification.ts"
```

```
# Launch T014-T016 together (services work with different APIs):
Task: "EmailVerificationSyncService in src/services/emailVerificationSyncService.ts"
Task: "Supabase query service for email verification records in src/services/supabaseEmailVerificationService.ts"
Task: "HubSpot contact update service in src/services/hubspotEmailVerificationService.ts"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts
- Follow TDD: Red → Green → Refactor cycle
- Use existing patterns from codebase for consistency

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

- [ ] All contracts have corresponding tests (T005-T007)
- [ ] All entities have model tasks (T011-T013)
- [ ] All tests come before implementation (T005-T010 before T011-T025)
- [ ] Parallel tasks truly independent (different file paths)
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task</content>
<parameter name="filePath">c:\Users\raze0\Documents\trial\LoanArk-crm-sync-main\specs\004-now-let-s\tasks.md