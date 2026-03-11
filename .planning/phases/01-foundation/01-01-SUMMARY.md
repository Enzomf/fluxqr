---
phase: 01-foundation
plan: 01
subsystem: ui
tags: [nextjs, tailwind, shadcn, supabase, typescript, geist, design-system]

# Dependency graph
requires: []
provides:
  - src/ directory structure with App Router
  - Tailwind v4 @theme inline design tokens (brand-500, surface, success, danger, warning)
  - shadcn/ui components (button, sheet, separator, avatar, skeleton, sonner) in dark theme
  - Geist font loaded from npm package via GeistSans/GeistMono variables
  - cn() and formatScanCount() utilities in src/lib/utils.ts
  - Platform and QrCode TypeScript types in src/types/index.ts
  - Supabase server client (createClient) in src/lib/supabase/server.ts
  - Supabase browser client (createClient) in src/lib/supabase/client.ts
affects: [01-02, 01-03, 01-04, all subsequent phases]

# Tech tracking
tech-stack:
  added:
    - "@supabase/supabase-js ^2"
    - "@supabase/ssr 0.9.0"
    - "geist 1.7.0"
    - "zod 4.3.6"
    - "shadcn/ui (button, sheet, separator, avatar, skeleton, sonner)"
    - "clsx + tailwind-merge (installed by shadcn)"
    - "tw-animate-css (installed by shadcn)"
  patterns:
    - "Tailwind v4 CSS-first config via @theme inline in globals.css (no tailwind.config.ts)"
    - "shadcn CSS variables mapped to FluxQR dark-only design tokens in :root"
    - "Geist font via npm geist package — GeistSans.variable / GeistMono.variable pattern"
    - "Supabase SSR with getAll/setAll cookie methods only (never individual get/set/remove)"

key-files:
  created:
    - src/types/index.ts
    - src/lib/supabase/server.ts
    - src/lib/supabase/client.ts
    - src/components/ui/avatar.tsx
    - src/components/ui/separator.tsx
    - src/components/ui/sheet.tsx
    - src/components/ui/skeleton.tsx
    - src/components/ui/sonner.tsx
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/lib/utils.ts
    - tsconfig.json
    - package.json
    - components.json

key-decisions:
  - "Dark-only theme: :root variables always set to dark values; dark class on html element locks this permanently without a toggle"
  - "Geist from npm package (geist/font/sans) not next/font/google — enables GeistSans.variable pattern required by BACKLOG"
  - "No tailwind.config.ts created — Tailwind v4 CSS-first config via globals.css @theme inline"
  - "NEXT_PUBLIC_SUPABASE_ANON_KEY used per CLAUDE.md (not PUBLISHABLE_KEY)"

patterns-established:
  - "Pattern 1: All design tokens defined in @theme inline in globals.css — generates bg-brand-500, bg-surface, etc. automatically"
  - "Pattern 2: Supabase SSR clients always use getAll()/setAll() cookie methods for correct auth session handling"
  - "Pattern 3: Import cn() from @/lib/utils for all conditional class merging"

requirements-completed: [FOUN-01, FOUN-02, FOUN-03, FOUN-04]

# Metrics
duration: 3min
completed: 2026-03-11
---

# Phase 1 Plan 01: Project Scaffold and Design System Summary

**Next.js 16 src/ migration with Tailwind v4 dark-only design tokens, shadcn/ui, Geist npm font, and Supabase SSR client helpers**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-11T01:54:39Z
- **Completed:** 2026-03-11T01:57:54Z
- **Tasks:** 3
- **Files modified:** 13

## Accomplishments
- Migrated bare CNA scaffold to src/ directory structure with tsconfig @/* alias pointing to ./src/*
- Installed and configured Tailwind v4 design system with FluxQR brand tokens (#6366F1 indigo, dark surface palette) via @theme inline
- Created Supabase SSR client helpers (server + browser) with correct getAll/setAll cookie pattern

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold src/ structure, install deps, configure design system** - `936fd94` (feat)
2. **Task 2: Create shared types and utility functions** - `a7dc8de` (feat)
3. **Task 3: Create Supabase server and client helpers** - `287b650` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified
- `src/app/globals.css` - FluxQR @theme inline design tokens; :root dark-only variables; qr-pulse and slide-up keyframes
- `src/app/layout.tsx` - Geist from npm, dark class on html, Toaster from sonner
- `src/app/page.tsx` - Minimal placeholder (FluxQR heading in brand-500)
- `src/lib/utils.ts` - cn() (from shadcn) + formatScanCount() appended
- `src/types/index.ts` - Platform union type and QrCode interface
- `src/lib/supabase/server.ts` - createClient() for Server Components/Actions using createServerClient
- `src/lib/supabase/client.ts` - createClient() for browser using createBrowserClient
- `tsconfig.json` - @/* paths updated from ./* to ./src/*
- `components.json` - shadcn/ui configuration
- `src/components/ui/*` - button, sheet, separator, avatar, skeleton, sonner

## Decisions Made
- Dark-only theme with :root always dark — avoids theme toggle complexity, matches brand identity
- Geist from npm package not next/font/google — required for `GeistSans.variable` pattern in BACKLOG spec
- No tailwind.config.ts — Tailwind v4 CSS-first config via globals.css @theme inline
- NEXT_PUBLIC_SUPABASE_ANON_KEY follows CLAUDE.md convention (not new PUBLISHABLE_KEY)

## Deviations from Plan

None - plan executed exactly as written. The initial commit (1c98d45) had already performed the app/ to src/app/ migration and initialized shadcn — current tasks built on that state. shadcn init was already done, so `pnpm dlx shadcn@latest init -d` ran on top of the existing init (which updated fonts and globals.css correctly).

## Issues Encountered
None.

## User Setup Required
None — no external service configuration required for this plan. Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) will be needed in later plans when auth is wired.

## Next Phase Readiness
- Foundation is complete: design tokens, shared types, Supabase clients all in place
- Plan 01-02 (Database) can proceed: qr_codes migration already committed in 16588ce
- Plan 01-03 (Auth) ready to consume src/lib/supabase/server.ts and src/lib/supabase/client.ts
- Plan 01-04 (App Shell) ready to use shadcn Sheet, Avatar, Separator components

---
*Phase: 01-foundation*
*Completed: 2026-03-11*
