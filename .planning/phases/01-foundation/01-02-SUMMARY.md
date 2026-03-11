---
phase: 01-foundation
plan: 02
subsystem: database
tags: [postgres, supabase, rls, rpc, migrations, sql]

# Dependency graph
requires: []
provides:
  - "qr_codes table with 11 columns (id, user_id, slug, label, platform, contact_target, default_message, is_active, scan_count, created_at, updated_at)"
  - "RLS: 4 owner CRUD policies + 1 public SELECT for active rows"
  - "increment_scan_count(qr_slug) SECURITY DEFINER RPC for atomic scan counting"
  - "Partial index on slug WHERE is_active = true for proxy lookup performance"
  - "update_updated_at trigger firing BEFORE UPDATE on every row"
affects: [01-03, 01-04, 02-scanner, 03-qr-management, 04-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Supabase SQL migration files in supabase/migrations/ with sequential numeric prefix"
    - "SECURITY DEFINER RPC for privileged atomic updates without service role key in client"
    - "Partial indexes on boolean flag columns for filtered lookups"
    - "Separate RLS policies per operation (SELECT, INSERT, UPDATE, DELETE) for clarity"

key-files:
  created:
    - supabase/migrations/0001_create_qr_codes.sql
  modified: []

key-decisions:
  - "SECURITY DEFINER on increment_scan_count — allows anon scanner proxy to increment without service role key"
  - "Partial index on slug WHERE is_active = true — proxy lookups only touch active rows, keeps index small"
  - "Separate owner policies per operation — more verbose but easier to audit and modify individually"
  - "ON DELETE CASCADE from auth.users — cleaning up orphan rows automatically when user account is deleted"
  - "Public SELECT policy allows unauthenticated reads of is_active=true rows — required for zero-auth scanner page"

patterns-established:
  - "SQL migration naming: NNNN_description.sql (0001_create_qr_codes.sql)"
  - "RLS always enabled on every table — enforced at DB level, not just application"
  - "Atomic updates via SECURITY DEFINER RPC — avoids service role key exposure in client code"

requirements-completed: [DB-01, DB-02, DB-03, DB-04, DB-05]

# Metrics
duration: ~15min
completed: 2026-03-11
---

# Phase 1 Plan 2: Database Schema Summary

**PostgreSQL qr_codes table with 5 RLS policies, SECURITY DEFINER scan increment RPC, partial index on active slugs, and updated_at trigger applied to Supabase**

## Performance

- **Duration:** ~15 min (including human-action checkpoint for migration apply)
- **Started:** 2026-03-11T01:57:54Z
- **Completed:** 2026-03-11T02:01:37Z
- **Tasks:** 2 (1 auto + 1 human-action)
- **Files modified:** 1

## Accomplishments
- Complete SQL migration for qr_codes table with all 11 required columns, correct types, constraints, and defaults
- 5 RLS policies: 4 owner CRUD (SELECT, INSERT, UPDATE, DELETE) + 1 public SELECT for active rows (scanner proxy requirement)
- SECURITY DEFINER RPC `increment_scan_count(qr_slug)` enabling atomic scan count updates without exposing service role key
- Partial index `idx_qr_codes_slug_active` on `slug WHERE is_active = true` for fast scanner proxy lookups
- `update_updated_at` trigger function firing BEFORE UPDATE to auto-maintain updated_at timestamp
- Migration applied to Supabase instance (confirmed by user)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create qr_codes table migration with RLS, RPC, index, and trigger** - `16588ce` (feat)
2. **Task 2: Apply database migration to Supabase instance** - human-action (no commit — applied via Supabase Dashboard/CLI)

**Plan metadata:** (docs commit — this summary)

## Files Created/Modified
- `supabase/migrations/0001_create_qr_codes.sql` - Complete database migration: CREATE TABLE, partial index, updated_at trigger, RLS enable + 5 policies, SECURITY DEFINER RPC

## Decisions Made
- SECURITY DEFINER on `increment_scan_count` — scanner page is zero-auth, so the RPC must run with elevated DB permissions to UPDATE scan_count without the service role key being exposed client-side
- Partial index on `slug WHERE is_active = true` — the scanner proxy (highest-traffic query) only looks up active rows, so a partial index keeps it small and fast
- Separate RLS policies per operation (SELECT/INSERT/UPDATE/DELETE) rather than single permissive policy — more verbose but individually auditable and modifiable
- ON DELETE CASCADE from auth.users — prevents orphan qr_codes rows when a user account is deleted
- Public SELECT policy for `is_active = true` rows — required by CLAUDE.md: "unauthenticated can SELECT where is_active = true (proxy only)"

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — migration applied cleanly. Human-action checkpoint (Task 2) was a normal flow gate for applying the SQL migration to the Supabase instance.

## User Setup Required

The database migration was applied manually by the user as part of Task 2 (human-action checkpoint). No additional setup required — all database objects are now live.

## Next Phase Readiness
- qr_codes table is live and operational in Supabase
- RLS policies enforce security at the database level for all subsequent plans
- Scanner proxy (Plan 01-03) can immediately use `increment_scan_count` RPC and the public SELECT policy
- QR CRUD (Plan 01-04) can immediately use owner policies with `auth.uid() = user_id`
- No blockers — database foundation is complete

## Self-Check: PASSED

- FOUND: `supabase/migrations/0001_create_qr_codes.sql`
- FOUND: `.planning/phases/01-foundation/01-02-SUMMARY.md`
- FOUND: commit `16588ce` (feat(01-02): create qr_codes database migration)

---
*Phase: 01-foundation*
*Completed: 2026-03-11*
