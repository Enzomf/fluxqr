---
phase: 07-codereview
plan: 01
subsystem: ui
tags: [nextjs, tailwind, supabase, typescript, code-review, dead-code, design-tokens]

# Dependency graph
requires:
  - phase: 06-refactor-add-edit-qr-pages-into-modals-with-platform-choice-ux
    provides: QrForm, DeleteDialog, QrList components that were cleaned up
provides:
  - Dead code removed (use-qr-image.ts, scanner-landing.tsx, delete-button.tsx, next-themes)
  - Design tokens applied consistently across all components (no hardcoded hex values)
  - Slug check bug fixed (queries all slugs, not just active)
  - Scanner page uses createAdminClient helper pattern
  - English toast messages throughout
  - Static imports in check-otp.ts
  - Defense-in-depth comments in layout guards
affects: [07-02, any plan modifying dashboard or public components]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "createAdminClient() helper pattern for service-role Supabase access (replaces inline createServerClient)"
    - "Static imports preferred over dynamic imports in Server Actions (unless circular dep)"
    - "Design tokens (bg-surface, bg-surface-raised, text-brand-500, etc.) replacing all hardcoded hex values"

key-files:
  created: []
  modified:
    - src/app/api/slug-check/route.ts
    - src/app/q/[slug]/page.tsx
    - src/app/actions/check-otp.ts
    - src/app/dashboard/layout.tsx
    - src/app/admin/layout.tsx
    - src/components/dashboard/qr-list-row.tsx
    - src/components/qr-management/qr-form.tsx
    - src/components/shared/page-header.tsx
    - src/components/ui/sonner.tsx

key-decisions:
  - "sonner.tsx (shadcn primitive) needed minimal edit to remove next-themes — hardcoded dark theme since app is permanently dark mode"
  - "Pre-existing uncommitted token replacement changes across 10+ files were included in plan commits — all in scope"
  - "createServerClient import kept in scanner page.tsx — still used by after() callback for anonClient"

patterns-established:
  - "createAdminClient() from lib/supabase/admin.ts is the canonical way to get service-role access"
  - "All hex color values replaced with design tokens — no hardcoded colors allowed going forward"

requirements-completed: [CR-01, CR-02, CR-03]

# Metrics
duration: 4min
completed: 2026-03-12
---

# Phase 7 Plan 01: Code Smells and Dead Code Cleanup Summary

**Eliminated 3 dead code files, 1 dead dependency, fixed a slug uniqueness bug, Portugese toast strings, and applied design tokens to 20+ components**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-12T21:13:19Z
- **Completed:** 2026-03-12T21:17:00Z
- **Tasks:** 2
- **Files modified:** 30 (including 3 deleted)

## Accomplishments
- Deleted `use-qr-image.ts`, `scanner-landing.tsx`, `delete-button.tsx` (confirmed no imports before deletion)
- Removed `next-themes` dependency (was installed but unused; app uses permanent dark mode)
- Fixed slug availability check: removed `.eq('is_active', true)` filter — now checks all slugs to match DB UNIQUE constraint
- Replaced Portuguese toast messages with English: 'QR criado com sucesso' -> 'QR code created', 'QR atualizado' -> 'QR code updated'
- Replaced inline `createServerClient` admin construction in scanner page with `createAdminClient()` helper
- Converted `check-otp.ts` dynamic imports to static imports at file top
- Added defense-in-depth comments to dashboard and admin layouts
- Applied design tokens to replace all hardcoded hex values across the entire codebase

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove dead code and redundant wrappers** - `37752e8` (feat)
2. **Task 2: Fix bugs, duplication, and add documentation comments** - `7f9798d` (fix)

## Files Created/Modified

**Deleted:**
- `src/hooks/use-qr-image.ts` - Unused hook (no imports anywhere)
- `src/app/q/[slug]/scanner-landing.tsx` - Dead component (page always redirects before rendering)
- `src/components/dashboard/delete-button.tsx` - 1:1 passthrough wrapper with zero added value

**Modified:**
- `src/app/api/slug-check/route.ts` - Removed is_active filter from slug uniqueness check
- `src/app/q/[slug]/page.tsx` - Use createAdminClient() helper instead of inline createServerClient
- `src/app/actions/check-otp.ts` - Static imports instead of dynamic imports
- `src/app/dashboard/layout.tsx` - Defense-in-depth comment
- `src/app/admin/layout.tsx` - Defense-in-depth comment + design tokens
- `src/components/dashboard/qr-list-row.tsx` - Direct DeleteDialog import + design tokens
- `src/components/qr-management/qr-form.tsx` - English toasts + design tokens
- `src/components/shared/page-header.tsx` - Removed redundant cn() on static string
- `src/components/ui/sonner.tsx` - Removed next-themes dependency, hardcoded dark theme
- `src/components/qr-management/delete-dialog.tsx` - Design tokens
- `src/components/qr-management/qr-form-dialog.tsx` - Design tokens
- `src/components/qr-management/platform-selector.tsx` - Design tokens
- `src/components/qr-management/slug-input.tsx` - Design tokens
- `src/components/qr-management/qr-type-select.tsx` - Design tokens
- `src/components/admin/user-table.tsx` - Design tokens
- `src/components/admin/user-qr-table.tsx` - Design tokens
- `src/components/public/freemium-gate.tsx` - Design tokens
- `src/components/public/public-qr-form.tsx` - Design tokens
- `src/components/public/qr-type-grid.tsx` - Design tokens
- `src/components/public/phone-verify-form.tsx` - Design tokens
- `src/components/public/public-qr-result-dialog.tsx` - Design tokens
- `src/app/home-client.tsx` - Design tokens
- `package.json` + `pnpm-lock.yaml` - next-themes removed

## Decisions Made
- `sonner.tsx` is a shadcn primitive (don't normally edit), but removing `next-themes` broke it — minimal edit applied: hardcoded `theme="dark"` since app is permanently dark. This is the correct behavior anyway.
- Pre-existing uncommitted design token changes (across ~10 files) were discovered during execution. All were included in the task commits since they're exactly the scope of this plan.
- Kept `import { createServerClient }` in scanner page — still used by the `after()` callback's anonClient. Only the admin client construction was replaced.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] sonner.tsx referenced deleted next-themes package**
- **Found during:** Task 1 (after pnpm remove next-themes)
- **Issue:** TypeScript error: `Cannot find module 'next-themes'` in src/components/ui/sonner.tsx
- **Fix:** Removed `useTheme` import and call; hardcoded `theme="dark"` since app is permanently dark mode
- **Files modified:** src/components/ui/sonner.tsx
- **Verification:** `npx tsc --noEmit` passes with zero errors
- **Committed in:** 37752e8 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug introduced by removing dependency)
**Impact on plan:** Fix was necessary and correct — app never needs theme switching, dark is always the right value.

## Issues Encountered
- Pre-existing uncommitted changes (design token replacements) existed in the working tree across ~10 files from a prior context session. These were all in-scope for this plan and were included in the commits.

## Next Phase Readiness
- Codebase is clean: no dead code, no hardcoded hex values, no dead dependencies
- Plan 07-02 (remaining best practices: caching, streaming, metadata) can proceed without conflict
- All files that Plan 07-02 might touch are now committed and clean

---
*Phase: 07-codereview*
*Completed: 2026-03-12*
