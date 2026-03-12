---
phase: quick
plan: 7
subsystem: tooling
tags: [lint, react-hooks, typescript, code-quality]
dependency_graph:
  requires: []
  provides: [clean-lint-baseline]
  affects: [sidebar, qr-pulse-wrapper, use-slug-check, new-actions, edit-actions, home-client, qr-list-row, qr-preview-dialog, public-qr-result-dialog]
tech_stack:
  added: []
  patterns: [module-level-component-extraction, render-body-derived-state, eslint-disable-inline]
key_files:
  created: []
  modified:
    - src/components/dashboard/sidebar.tsx
    - src/components/shared/qr-pulse-wrapper.tsx
    - src/hooks/use-slug-check.ts
    - src/app/dashboard/new/actions.ts
    - src/app/dashboard/[id]/edit/actions.ts
    - src/app/home-client.tsx
    - src/app/page.tsx
    - src/components/dashboard/qr-list-row.tsx
    - src/components/dashboard/qr-preview-dialog.tsx
    - src/components/public/public-qr-result-dialog.tsx
decisions:
  - SidebarNav extracted to module scope with explicit props instead of closure — React 19 eslint rule forbids component definitions inside render
  - QrPulseWrapper simplified to zero-state: trigger prop applied as CSS class directly, no useEffect or useState needed
  - useSlugCheck derives idle/available/invalid status in render body (syncStatus var), effect only handles async fetch
  - contact_target destructuring removed from new/edit actions — profile.phone_number referenced directly at point of use
  - usageCount prop removed from HomeClientProps entirely — isGated boolean already encodes the gate decision server-side
metrics:
  duration: 3 min
  completed: "2026-03-12"
  tasks_completed: 2
  files_modified: 10
---

# Quick Task 7: Fix All Lint Issues Summary

**One-liner:** Resolved all 10 lint issues (4 errors, 6 warnings) — SidebarNav extracted to module scope, QrPulseWrapper simplified to CSS-only trigger, useSlugCheck derives sync status in render body.

## Tasks Completed

| # | Task | Commit | Result |
|---|------|--------|--------|
| 1 | Fix 4 lint errors (static-components + set-state-in-effect) | 7bbb8b6 | All errors eliminated |
| 2 | Fix 6 lint warnings (unused vars + img elements) | 3c49576 | All warnings eliminated |

## What Was Built

`pnpm run lint` now exits with code 0 — zero errors, zero warnings. `pnpm run build` also succeeds with all routes building cleanly.

### Task 1: Fix 4 lint errors

**sidebar.tsx — react-hooks/static-components (2 errors):**
- Extracted `SidebarNav` from inside `Sidebar` render body to module scope
- Created `SidebarNavProps` interface with `navItems`, `avatarUrl`, `email`, `fallbackLetter`, `onNavigate`
- Desktop render: `<SidebarNav ... />` without `onNavigate`
- Mobile render: `<SidebarNav ... onNavigate={() => setOpen(false)} />`

**qr-pulse-wrapper.tsx — react-hooks/set-state-in-effect (1 error):**
- Eliminated all state and effects entirely
- CSS animation class applied directly from `trigger` prop: `cn(trigger && 'animate-qr-pulse rounded-md')`
- The parent (`QrList`) already manages how long `trigger` is true via search params lifecycle

**use-slug-check.ts — react-hooks/set-state-in-effect (1 error):**
- Moved synchronous status derivation to render body as `syncStatus` variable
- `useEffect` only runs when `syncStatus === null` (valid slug needing server check)
- No `setState` calls in effect body — only inside the async setTimeout callback (which is fine)
- Return: `syncStatus ?? (asyncStatus === 'idle' ? 'checking' : asyncStatus)`

### Task 2: Fix 6 lint warnings

**new/actions.ts + edit/actions.ts — @typescript-eslint/no-unused-vars:**
- Removed the destructuring of `contact_target` entirely
- Restructured to destructure only the fields actually used (`label`, `slug`, `platform`, `default_message`)
- `profile.phone_number` referenced directly at insert/update call site

**home-client.tsx — @typescript-eslint/no-unused-vars:**
- Removed `usageCount` from `HomeClientProps` interface and destructuring
- Removed `usageCount={usageCount}` prop from `page.tsx` call site
- `isGated` boolean already encodes the gate decision; `usageCount` was redundant

**Three `<img>` elements — @next/next/no-img-element:**
- Added `{/* eslint-disable-next-line @next/next/no-img-element */}` above each tag
- These render base64 data URLs — `next/image` does not optimize inline base64 and would require a custom loader

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] QrPulseWrapper — ref-based approach still violated lint rules**
- **Found during:** Task 1
- **Issue:** The plan suggested a `useRef` + render-body comparison approach, but the lint rule `react-hooks/no-ref-in-render` also flagged reading `ref.current` during render
- **Fix:** Simplified further — removed all state and effect, applied CSS class directly from `trigger` prop
- **Files modified:** `src/components/shared/qr-pulse-wrapper.tsx`
- **Commit:** 7bbb8b6

**2. [Rule 1 - Bug] contact_target rename to `_` still flagged**
- **Found during:** Task 2
- **Issue:** Renaming to `_` or `_contact_target` still triggered the warning — the ESLint config's `@typescript-eslint/no-unused-vars` rule does not use `varsIgnorePattern` (set to bare `'warn'`)
- **Fix:** Removed the destructuring entirely, restructured to only destructure used fields
- **Files modified:** `src/app/dashboard/new/actions.ts`, `src/app/dashboard/[id]/edit/actions.ts`
- **Commit:** 3c49576

## Verification

```
pnpm run lint  → exit code 0, 0 errors, 0 warnings
pnpm run build → success, all 11 routes built
```

## Self-Check: PASSED
