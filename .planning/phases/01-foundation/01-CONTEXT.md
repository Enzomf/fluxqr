# Phase 1: Foundation - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Design system (Tailwind tokens, shadcn/ui, Geist font, dark-only theme), database schema (qr_codes table with RLS + RPC), Google OAuth authentication with route protection, and sidebar app shell with responsive mobile drawer. This is the infrastructure everything else stands on.

</domain>

<decisions>
## Implementation Decisions

### Login page branding
- Text wordmark only — "FluxQR" in brand-500 indigo, bold, no icon
- Tagline: "Smart links for instant messaging" below the wordmark in slate-400
- Card style: brand-glow shadow around card — subtle premium feel
- Nothing below the Google sign-in button — clean card, no footer links
- Layout A: centered card on dark bg-surface canvas

### Sidebar navigation
- Single nav link: "My QR Codes" — no "New QR Code" link in sidebar
- "Create new" action lives inside the dashboard page instead (e.g., button in page header)
- FluxQR text wordmark at top of sidebar, same indigo brand style as login
- Bottom: Google avatar + truncated email + sign-out button, separated by divider
- Mobile: hamburger icon top-left fixed position, Sheet opens from left
- Active link: brand highlight with left border accent per BACKLOG spec

### Claude's Discretion
- Exact shadcn CSS variable values (follow BACKLOG spec as baseline, adjust if needed)
- Database migration approach (local vs remote)
- Exact mobile breakpoint for sidebar collapse (md: 768px is standard)
- Loading states and skeleton patterns during auth flow
- Exact border opacity and glow intensity fine-tuning

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/layout.tsx`: Root layout with Geist font variables already loaded via `next/font/google` — needs migration to `geist` npm package per BACKLOG
- `app/globals.css`: Tailwind v4 import exists — needs CSS variable overrides for dark theme
- `tsconfig.json`: `@/*` path alias already configured, strict mode enabled

### Established Patterns
- Package manager: pnpm 10.12.4 — all installs must use `pnpm add`
- ESLint: flat config format (ESLint 9) with core-web-vitals + typescript rules
- No `src/` directory yet — scaffold has `app/` at root, must migrate to `src/app/` per CLAUDE.MD target structure

### Integration Points
- `src/middleware.ts`: New file — intercepts `/dashboard/*` routes for auth guard
- `src/lib/supabase/server.ts`: New file — createServerClient using `@supabase/ssr` with cookie handling
- `src/lib/supabase/middleware.ts`: New file — session refresh helper for middleware
- `src/app/auth/callback/route.ts`: New file — OAuth code exchange endpoint
- shadcn init will create `components/ui/` and configure component paths

</code_context>

<specifics>
## Specific Ideas

- Login card should feel premium but minimal — glow + shadow, no clutter
- Sidebar nav is intentionally minimal: single "My QR Codes" link. The create action is a page-level button, not a nav item. This keeps the sidebar clean for a product with one main view.
- User area at sidebar bottom follows standard SaaS pattern: avatar, email, sign-out

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-10*
