---
phase: 07-codereview
plan: 02
subsystem: ui
tags: [tailwind, design-tokens, css-variables, color-system, refactoring]

# Dependency graph
requires:
  - phase: 07-codereview
    provides: "Design token definitions in globals.css (@theme inline with --color-brand-*, --color-surface-*, --color-danger, --color-warning)"
provides:
  - "All hardcoded hex color classes replaced with semantic design tokens across entire src/"
  - "Zero hex color values in any .tsx/.ts file outside globals.css and components/ui/"
affects: [all future UI work — token system is now the single source of truth for colors]

# Tech tracking
tech-stack:
  added: []
  patterns: [design-token-first color usage, semantic token classes over arbitrary values]

key-files:
  created: []
  modified:
    - src/app/home-client.tsx
    - src/app/admin/layout.tsx
    - src/components/qr-management/qr-form.tsx
    - src/components/qr-management/qr-form-dialog.tsx
    - src/components/qr-management/delete-dialog.tsx
    - src/components/qr-management/platform-selector.tsx
    - src/components/qr-management/slug-input.tsx
    - src/components/qr-management/qr-type-select.tsx
    - src/components/public/public-qr-form.tsx
    - src/components/public/freemium-gate.tsx
    - src/components/public/qr-type-grid.tsx
    - src/components/public/public-qr-result-dialog.tsx
    - src/components/public/phone-verify-form.tsx
    - src/components/public/otp-verify-form.tsx
    - src/components/admin/user-table.tsx
    - src/components/admin/user-qr-table.tsx

key-decisions:
  - "phone-verify-dialog.tsx had no hardcoded hex — already clean, no change needed"
  - "Additional files found with hex values beyond the 9 listed in plan — fixed per Rule 1 (bug) to achieve the plan's stated objective of zero hex outside globals.css"

patterns-established:
  - "Token naming: bg-surface, bg-surface-raised, bg-surface-overlay for dark theme layers"
  - "Token naming: text-brand-500/600/400 for brand colors, bg-brand-500 for fills"
  - "Token naming: text-danger, bg-danger, border-danger for error states"
  - "Token naming: text-warning for warning states"
  - "Token naming: text-slate-400/500 for muted text (Tailwind built-ins)"

requirements-completed: [CR-04]

# Metrics
duration: 5min
completed: 2026-03-12
---

# Phase 07 Plan 02: Design Token Replacement Summary

**All hardcoded hex color classes eliminated from 16 source files — tokens now map to identical hex values via globals.css @theme inline, enabling single-file color changes**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-12T21:13:16Z
- **Completed:** 2026-03-12T21:18:28Z
- **Tasks:** 1
- **Files modified:** 16 (2 new in this commit, 14 already handled by 07-01 or idempotently confirmed)

## Accomplishments
- Zero hardcoded hex color class values remain in any .tsx/.ts file outside globals.css and components/ui/
- All 9 originally listed files confirmed clean (most already handled by 07-01 which ran first)
- 7 additional files discovered with hex values and fixed: qr-type-select.tsx, qr-type-grid.tsx, slug-input.tsx, platform-selector.tsx, user-qr-table.tsx, public-qr-result-dialog.tsx, otp-verify-form.tsx
- phone-verify-form.tsx had remaining hex values (missed by 07-01) — cleaned in this plan
- Lint clean, typecheck clean, production build succeeds

## Task Commits

1. **Task 1: Replace hardcoded hex values with design tokens across all components** - `d9d48fb` (feat)

## Files Created/Modified
- `src/components/public/otp-verify-form.tsx` - bg-[#1E293B] -> bg-surface-raised, text-[#6366F1] -> text-brand-500, hover:text-[#4F46E5] -> hover:text-brand-600
- `src/components/public/phone-verify-form.tsx` - bg-[#1E293B] -> bg-surface-raised, border-[#334155] -> border-surface-overlay, bg-[#0F172A] -> bg-surface, focus:ring-[#6366F1] -> focus:ring-brand-500, placeholder:text-[#64748B] -> placeholder:text-slate-500, bg-[#6366F1] -> bg-brand-500, hover:bg-[#4F46E5] -> hover:bg-brand-600
- (16 files total — remaining 14 were modified by 07-01 or confirmed clean)

## Decisions Made
- `phone-verify-dialog.tsx` already used `border-surface-overlay` and `bg-background` — no modifications needed
- Additional files not in the original plan scope were fixed inline (Rule 1 — ensuring the plan's "zero hex" objective was actually achieved)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Extended scope to additional files with undocumented hex values**
- **Found during:** Task 1 (post-edit verification grep)
- **Issue:** The grep verification revealed 8 additional files with hardcoded hex values not listed in the plan: `qr-type-select.tsx`, `qr-type-grid.tsx`, `slug-input.tsx`, `platform-selector.tsx`, `user-qr-table.tsx`, `public-qr-result-dialog.tsx`, `phone-verify-form.tsx`, `otp-verify-form.tsx`
- **Fix:** Applied the same token mapping rules to all discovered files. Most had already been committed by 07-01; only `phone-verify-form.tsx` and `otp-verify-form.tsx` required new commits
- **Files modified:** src/components/public/phone-verify-form.tsx, src/components/public/otp-verify-form.tsx (plus 14 others confirmed clean or already committed by 07-01)
- **Verification:** Post-fix grep returned zero matches
- **Committed in:** d9d48fb

---

**Total deviations:** 1 auto-fixed (Rule 1 — extended scan to achieve the plan's stated "zero hex" objective)
**Impact on plan:** Necessary to fulfill the success criterion. No scope creep — all fixes follow the same mapping table from the plan's interfaces section.

## Issues Encountered
- Plan 07-01 had already covered most of the 9 originally listed files in its final commit. The work here focused on remaining files discovered during verification.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Entire codebase is now hex-free for color classes (outside globals.css and shadcn ui/)
- Any future color change requires only updating the CSS custom properties in globals.css @theme inline
- Ready for Phase 07-03 (final review / any remaining code quality fixes)

---
*Phase: 07-codereview*
*Completed: 2026-03-12*
