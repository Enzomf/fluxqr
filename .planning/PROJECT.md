# FluxQR

## What This Is

FluxQR is a QR-code-to-messaging proxy. Users create QR codes that, when scanned, open WhatsApp, SMS, or Telegram with a pre-filled message and contact target. Built for a specific client who needs branded, trackable QR codes that bridge the physical-to-digital gap for customer messaging.

## Core Value

Scanning a QR code opens the right messaging app with the right message — zero friction, zero accounts, zero downloads.

## Requirements

### Validated

- ✓ Next.js 15 App Router scaffold with TypeScript strict mode — existing
- ✓ Tailwind CSS v4 configured with PostCSS — existing
- ✓ ESLint with Next.js core-web-vitals rules — existing
- ✓ Geist font variables loaded via next/font — existing

### Active

- [ ] Design system: brand tokens, shadcn/ui components, dark-only theme
- [ ] Database schema with RLS, partial index on slug, atomic scan counter RPC
- [ ] Google SSO with route protection (middleware redirects unauthenticated users)
- [ ] Sidebar app shell with responsive Sheet drawer on mobile
- [ ] Scanner proxy route: fetch QR by slug, increment count, render landing page
- [ ] Scanner landing: editable message textarea + platform CTA deep link
- [ ] Telegram fallback: copy message + open Telegram (no pre-fill support)
- [ ] QR creation form with live slug validation (debounced availability check)
- [ ] Dashboard QR list with label, slug, platform badge, scan count, edit/delete
- [ ] Empty state with CTA when user has no QR codes
- [ ] Edit QR form with read-only platform field + pulse confirmation on save
- [ ] Soft delete with confirmation dialog (sets is_active = false)
- [ ] QR image generation (qrcode lib) + PNG download
- [ ] Scan count display with formatScanCount() for 1k+ values
- [ ] Branded error/not-found pages for missing and inactive slugs
- [ ] Vercel deployment with production env vars and OAuth callback URLs

### Out of Scope

- Real-time chat — not core to QR-to-messaging value
- Video/image attachments in messages — adds complexity, not needed for MVP
- OAuth providers beyond Google — single SSO sufficient for client
- Mobile native app — web-first, mobile-responsive
- Framer Motion animations — Tailwind keyframes only per project rules
- Multi-tenant / team features — single-user ownership model for MVP
- Scan event history table (sparkline charts) — deferred to v1.1
- Dark/light mode toggle — permanently dark for MVP

## Context

- **Client project** — building for a specific client, not a SaaS launch
- **Supabase ready** — project exists with Google OAuth already configured
- **Brownfield scaffold** — Next.js 16 created via create-next-app, no business logic yet
- **Package manager** — pnpm 10.12.4
- **Detailed backlog exists** — `BACKLOG.MD` contains 13 tasks across 6 epics with full technical specs
- **Scanner page is the product** — `/q/[slug]` must be zero-auth, under 10KB JS, maximum performance
- **Platform deep links** — WhatsApp (`wa.me`), SMS (`sms:`), Telegram (`t.me`) with URL-encoded messages
- **Telegram limitation** — deep links don't support pre-filled messages, requires copy+open fallback

## Constraints

- **Tech stack**: Next.js 15 + Supabase + Tailwind v4 + shadcn/ui — per client agreement
- **Auth**: Google OAuth only — no email/password, no magic links
- **Security**: All Supabase queries server-side only, RLS on every table, service role key never exposed
- **Performance**: Scanner page under 10KB JS, Lighthouse mobile ≥ 90
- **Data integrity**: Soft delete only (is_active = false), never hard DELETE qr_codes rows
- **Platform lock**: Platform field read-only after QR creation (printed codes can't change behavior)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dark-only theme | Simpler MVP, brand consistency | — Pending |
| Soft delete over hard delete | Preserves scan history, graceful inactive page for old printed codes | — Pending |
| Server Actions over API routes | Type-safe, co-located mutations, simpler architecture | — Pending |
| No global state manager | Server Components own data, URL params drive navigation | — Pending |
| Atomic RPC for scan increment | SECURITY DEFINER prevents race conditions on concurrent scans | — Pending |
| Telegram copy fallback | Telegram deep links don't support pre-filled messages | — Pending |

---
*Last updated: 2026-03-10 after initialization*
