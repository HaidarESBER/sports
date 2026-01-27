---
phase: 05-programs-core
plan: 01
subsystem: api
tags: [rest-api, crud, programs, sessions-scheduling, prisma, next.js-api-routes, authentication, transactions]

# Dependency graph
requires:
  - phase: 04-sessions-core
    provides: Sessions API patterns, auth() function, ownership validation pattern
  - phase: 02-database-models
    provides: Program, ProgramSession models with relations
provides:
  - GET/POST /api/programs for listing and creating training programs
  - GET/PUT/DELETE /api/programs/[id] for program detail operations
  - PUT /api/programs/[id]/sessions for atomic session scheduling
  - Ownership validation preventing unauthorized access
affects: [05-02-programs-ui, 07-discovery, 08-progression-tracking]

# Tech tracking
tech-stack:
  added: []
  patterns: [rest-api-pattern, ownership-authorization, prisma-transactions, session-scheduling]

key-files:
  created:
    - src/app/api/programs/route.ts
    - src/app/api/programs/[id]/route.ts
    - src/app/api/programs/[id]/sessions/route.ts
  modified: []

key-decisions:
  - "Session scheduling uses atomic replacement pattern (delete all, create new)"
  - "Ownership check returns 403 Forbidden for unauthorized access attempts"
  - "ProgramSession validation includes weekNumber bounds check against program.durationWeeks"

patterns-established:
  - "Program ownership validation mirrors Sessions pattern"
  - "Nested include pattern for programSessions with session data"
  - "Transaction pattern for atomic operations (session assignment replacement)"

issues-created: []

# Metrics
duration: 8min
completed: 2026-01-27
---

# Phase 5 Plan 01: Programs Core API Summary

**REST API endpoints for Programs CRUD with session scheduling, ownership validation, and atomic session assignment replacement via Prisma transactions**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-27T14:00:00Z
- **Completed:** 2026-01-27T14:08:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Programs list endpoint (GET /api/programs) returns user's programs with nested programSessions
- Program create endpoint (POST /api/programs) with name/sport/durationWeeks validation
- Program detail endpoints (GET/PUT/DELETE /api/programs/[id]) with ownership enforcement
- Atomic session scheduling via PUT /api/programs/[id]/sessions using Prisma $transaction
- Validation of weekNumber (1 to durationWeeks) and dayOfWeek (1-7) for session assignments
- Verification that assigned sessions exist and belong to the user

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Programs list and create API routes** - `4c79974` (feat)
2. **Task 2: Create Program detail API routes (get, update, delete)** - `4ba28b1` (feat)
3. **Task 3: Create ProgramSessions management endpoint** - `dcb5ed1` (feat)

## Files Created/Modified

- `src/app/api/programs/route.ts` - GET returns user's programs, POST creates new program with validation
- `src/app/api/programs/[id]/route.ts` - GET/PUT/DELETE with ownership check, sessions ordered by week/day/order
- `src/app/api/programs/[id]/sessions/route.ts` - PUT atomically replaces program's session schedule

## Decisions Made

1. **Atomic session replacement** - PUT /api/programs/[id]/sessions deletes all existing ProgramSession records and creates new ones in a single transaction, ensuring data consistency for drag-drop calendar operations.

2. **Session ownership validation** - When assigning sessions to a program, all sessions must exist AND belong to the user. This prevents users from adding other users' sessions to their programs.

3. **WeekNumber bounds checking** - Session assignments validate weekNumber against the program's durationWeeks field, preventing assignments to non-existent weeks.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully.

## Next Phase Readiness

- All API endpoints functional and tested via build
- Ready for 05-02: Programs UI to consume these endpoints
- Session scheduling API enables drag-drop calendar interface
- Ownership patterns consistent with Sessions API

---
*Phase: 05-programs-core*
*Completed: 2026-01-27*
