---
phase: 02-database-models
plan: 01
subsystem: database
tags: [prisma, sqlite, models, relations, orm]

# Dependency graph
requires:
  - phase: 01-foundation/02
    provides: Prisma ORM configured with SQLite adapter and client singleton
provides:
  - User model with auth-ready passwordHash field
  - Exercise model for sport-specific exercises
  - Session model for training sessions with author ownership
  - SessionExercise junction for session composition with exercise parameters
  - Program model for multi-week training programs
  - ProgramSession junction for program scheduling by week and day
affects: [03-authentication, 04-sessions-core, 05-programs-core, all-crud-phases]

# Tech tracking
tech-stack:
  added: []
  patterns: [junction-table-pattern, content-hierarchy-pattern]

key-files:
  created: []
  modified:
    - prisma/schema.prisma

key-decisions:
  - "Junction tables with explicit ordering for flexible content composition"
  - "SessionExercise stores exercise parameters (sets, reps, duration, distance, intensity)"
  - "ProgramSession stores scheduling (weekNumber, dayOfWeek, order)"
  - "Cascade delete on junction tables for data integrity"

patterns-established:
  - "Content hierarchy: Exercise -> Session -> Program via junction tables"
  - "All models use cuid() for IDs"
  - "All content models have authorId -> User relation"
  - "Timestamps with createdAt/updatedAt on all models"

issues-created: []

# Metrics
duration: 5min
completed: 2026-01-26
---

# Phase 2 Plan 01: Database Schema Summary

**Complete Prisma schema with User, Exercise, Session, Program models and junction tables supporting the content hierarchy Exercise -> Session -> Program**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-26T18:10:00Z
- **Completed:** 2026-01-26T18:15:00Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments

- User model with email, passwordHash, and relations to authored content
- Exercise model as base content unit for all sports
- Session model with exercises via SessionExercise junction (supports sets, reps, duration, distance, intensity)
- Program model with sessions via ProgramSession junction (supports week/day scheduling)
- All relations properly configured with foreign keys and cascade deletes
- Prisma client regenerated with full TypeScript types
- Database schema applied successfully with db push

## Task Commits

Each task was committed atomically:

1. **Task 1: Define User and Exercise models** - `92dcdca` (feat)
2. **Task 2: Define Session model with SessionExercise junction** - `cdb7a35` (feat)
3. **Task 3: Define Program model with ProgramSession junction** - `655bdb3` (feat)

## Files Created/Modified

- `prisma/schema.prisma` - Complete database schema with 6 models:
  - User: Core user model with auth fields
  - Exercise: Base exercise definitions by sport
  - Session: Training sessions composed of exercises
  - SessionExercise: Junction with exercise parameters (sets, reps, etc.)
  - Program: Multi-week training programs
  - ProgramSession: Junction with week/day scheduling

## Decisions Made

1. **Junction tables for many-to-many relationships** - Using explicit junction tables (SessionExercise, ProgramSession) instead of implicit many-to-many allows storing additional metadata (order, parameters, scheduling).

2. **Exercise parameters on junction table** - sets, reps, duration, distance, intensity are stored on SessionExercise rather than Exercise. This allows the same exercise to be used with different parameters in different sessions.

3. **Program scheduling via weekNumber/dayOfWeek** - ProgramSession stores scheduling information (week 1-N, day 1-7) to enable calendar-style program layouts.

4. **Cascade delete on parent removal** - SessionExercise cascades when Session is deleted; ProgramSession cascades when Program is deleted. Exercises and Sessions remain intact as reusable content.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully.

## Next Phase Readiness

- Database schema complete with all core models
- Content hierarchy established: Exercise -> Session -> Program
- Ready for Phase 3: Authentication (User model has passwordHash field)
- All CRUD operations can be built against these models

---
*Phase: 02-database-models*
*Completed: 2026-01-26*
