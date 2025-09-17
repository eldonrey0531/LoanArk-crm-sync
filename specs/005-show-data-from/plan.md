# Implementation Plan: Email Verification Data Display

**Branch**: `005-show-data-from` | **Date**: September 17, 2025 | **Spec**: specs/005-show-data-from/spec.md
**Input**: Feature specification from `/specs/005-show-data-from/spec.md`

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

Display email verification data from Supabase and HubSpot in a side-by-side comparison view, showing only records with email_verification_status values and limited to three columns: name, hs_object_id, and email_verification_status.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18
**Primary Dependencies**: React, Supabase Client, HubSpot API Client
**Storage**: Supabase (PostgreSQL), HubSpot CRM
**Testing**: Vitest, React Testing Library, Playwright
**Target Platform**: Web browser
**Project Type**: Web application (frontend + backend detected)
**Performance Goals**: UI response time < 2 seconds, API calls optimized with caching
**Constraints**: HTTPS only, secure token storage, input validation
**Scale/Scope**: Support 50+ concurrent users, handle 1000+ records

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Based on the project's constitution and existing patterns:
- [x] Follows existing React/TypeScript patterns
- [x] Uses established Supabase and HubSpot integrations
- [x] Maintains security requirements (OAuth, input validation)
- [x] Follows component and service organization patterns
- [x] No new complex dependencies introduced

## Project Structure

### Documentation (this feature)

```
specs/005-show-data-from/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Web application (frontend + backend detected)
src/
├── components/
│   ├── DataComparisonTable.tsx    # New component for side-by-side display
│   └── ui/                          # Existing UI components
├── pages/
│   ├── DataDisplayPage.tsx         # New page component
│   └── ...                          # Existing pages
├── services/
│   ├── supabaseService.ts           # Existing service
│   ├── hubspotService.ts            # Existing service
│   └── dataComparisonService.ts     # New service for data comparison logic
├── types/
│   ├── dataComparison.ts            # New types for data display
│   └── ...                          # Existing types
└── utils/
    └── ...                          # Existing utilities

netlify/functions/
└── data-comparison.js              # New serverless function for data fetching
```

**Structure Decision**: Web application structure (frontend + backend) since this involves both client-side UI and server-side API integration

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context**:
   - HubSpot contact data structure and API response format
   - Supabase query optimization for filtering non-null email_verification_status
   - UI patterns for side-by-side data comparison
   - Error handling for mismatched records between systems

2. **Generate and dispatch research agents**:

   ```
   Task: "Research HubSpot CRM API contact properties and data structure"
   Task: "Research Supabase query patterns for filtering non-null values"
   Task: "Find best practices for side-by-side data comparison UI in React"
   Task: "Research error handling patterns for data synchronization mismatches"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all technical unknowns resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:
   - SupabaseContact: name, hs_object_id, email_verification_status
   - HubSpotContact: name, hs_object_id, email_verification_status
   - DataComparisonResult: matched records, unmatched records, discrepancies

2. **Generate API contracts** from functional requirements:
   - GET /api/data-comparison - fetch filtered data from both systems
   - POST /api/data-comparison/sync - sync mismatched records (future enhancement)

3. **Generate contract tests** from contracts:
   - Test API response schemas for data comparison endpoint
   - Test filtering logic for non-null email_verification_status
   - Test data matching by hs_object_id

4. **Extract test scenarios** from user stories:
   - Display side-by-side data comparison
   - Filter records with email_verification_status values
   - Handle unmatched records gracefully

5. **Update agent file incrementally**:
   - Update .github/copilot-instructions.md with new data comparison feature context
   - Add data comparison patterns and requirements

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, updated copilot-instructions.md

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Services before components before pages
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

**COMPLETED**: Tasks have been generated and are available in tasks.md

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md) - **COMPLETED**
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [No violations detected]   | [N/A]              | [N/A]                                |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_