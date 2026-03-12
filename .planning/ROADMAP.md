# Roadmap: FluxQR

## Overview

FluxQR ships in four phases. Phase 1 establishes the technical foundation — design system, database, auth, and app shell — so everything that follows has solid ground. Phase 2 delivers the core product: the scanner proxy that QR codes point to. Phase 3 builds the owner-facing dashboard for creating, managing, and tracking QR codes. Phase 4 ships to production and ensures the system behaves correctly under real-world conditions.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Design system, database schema, auth, and app shell — everything the app stands on (completed 2026-03-11)
- [x] **Phase 2: Scanner** - The core product: proxy route that opens messaging apps with pre-filled messages (completed 2026-03-11)
- [x] **Phase 3: QR Management** - Dashboard CRUD for creating, editing, deleting, and tracking QR codes (completed 2026-03-11)
- [ ] **Phase 3.1: QR Fullscreen Preview & Share** - Fullscreen QR preview dialog with grow-from-thumbnail animation, Web Share API, and copy link (INSERTED)
- [ ] **Phase 4: Production** - Deploy to Vercel, configure production env vars, branded error pages
- [ ] **Phase 5: Public QR Generation** - Public QR creation with phone verification, 5-use freemium gate, scan tracking, and admin dashboard
- [ ] **Phase 6: Modal QR CRUD** - Refactor add/edit QR pages into dialog-based flows with QR type selection grid

## Phase Details

### Phase 1: Foundation
**Goal**: Authenticated users see a working app shell and the database is ready to store QR codes
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, DB-01, DB-02, DB-03, DB-04, DB-05, AUTH-01, AUTH-02, AUTH-03, AUTH-04, SHELL-01, SHELL-02, SHELL-03
**Success Criteria** (what must be TRUE):
  1. App renders with dark background, brand indigo, and Geist font — no flash of unstyled content
  2. User can sign in with Google OAuth and land on `/dashboard`
  3. Visiting `/dashboard` without a session redirects to `/login`
  4. User can sign out from the sidebar and session is cleared
  5. Authenticated users see the sidebar with logo, nav, avatar, and a working Sheet drawer on mobile
**Plans:** 4/4 plans complete

Plans:
- [x] 01-01-PLAN.md — Scaffold src/ directory, install deps, design system, Supabase clients, shared types
- [ ] 01-02-PLAN.md — Database migration (qr_codes table, RLS, RPC, index, trigger)
- [ ] 01-03-PLAN.md — Google OAuth login, callback route, proxy.ts route protection
- [ ] 01-04-PLAN.md — Dashboard app shell with responsive sidebar and sign-out

### Phase 2: Scanner
**Goal**: Scanning a QR code opens the correct messaging app with the pre-filled message — zero auth, minimal JS
**Depends on**: Phase 1
**Requirements**: SCAN-01, SCAN-02, SCAN-03, SCAN-04, SCAN-05, SCAN-06, SCAN-07
**Success Criteria** (what must be TRUE):
  1. Visiting `/q/[slug]` shows the scanner landing with label, editable message textarea, and platform CTA
  2. Tapping the CTA opens WhatsApp, SMS, or Telegram deep link with the message pre-filled
  3. Telegram shows copy-message + open-Telegram fallback (no pre-fill)
  4. Each page load atomically increments the scan count without blocking the render
  5. A missing or inactive slug shows a branded not-found page — no sidebar, no auth
**Plans:** 2/2 plans complete

Plans:
- [ ] 02-01-PLAN.md — Deep link URL builder, Telegram fallback component, scanner landing client component
- [ ] 02-02-PLAN.md — Server component page with data fetch, after() scan increment, not-found/inactive states

### Phase 3: QR Management
**Goal**: Owners can create, view, edit, delete, and download QR codes from the dashboard
**Depends on**: Phase 1
**Requirements**: CREATE-01, CREATE-02, CREATE-03, CREATE-04, CREATE-05, LIST-01, LIST-02, LIST-03, EDIT-01, EDIT-02, EDIT-03, EDIT-04, DEL-01, DEL-02, DEL-03, GEN-01, GEN-02, GEN-03, ANLYT-01, ANLYT-02, ANLYT-03
**Success Criteria** (what must be TRUE):
  1. User can create a QR code and be redirected to the dashboard on success; duplicate slugs show inline error
  2. Dashboard list shows all active QR codes with thumbnail, label, slug, platform badge, scan count, and edit/delete actions; empty state shows CTA
  3. User can edit label, contact target, and message — platform field is read-only with tooltip; save triggers pulse confirmation
  4. Deleting opens a confirmation dialog naming the QR code; confirming sets is_active = false and removes the row from the list
  5. User can download the QR image as a PNG; scan counts ≥ 1000 display as compact notation (e.g., 1.2k)
**Plans:** 4/4 plans complete

Plans:
- [ ] 03-01-PLAN.md — Install deps (qrcode, shadcn), create QR generator, hooks, slug-check API, shared components
- [ ] 03-02-PLAN.md — Create QR flow: Server Action + form components + /dashboard/new page
- [ ] 03-03-PLAN.md — Dashboard list with QR thumbnails, actions, empty state, and soft-delete flow
- [ ] 03-04-PLAN.md — Edit QR flow: update Server Action, edit page, success toast, CRUD verification

### Phase 03.1: QR Fullscreen Preview & Share (INSERTED)

**Goal:** Clicking a QR code thumbnail in the dashboard opens a fullscreen preview dialog with grow-from-thumbnail animation, large QR display, and share actions (Web Share API + copy link)
**Requirements**: PREVIEW-01, PREVIEW-02, PREVIEW-03, PREVIEW-04, PREVIEW-05, PREVIEW-06
**Depends on:** Phase 3
**Success Criteria** (what must be TRUE):
  1. Clicking the QR thumbnail opens a dialog with the QR at ~280px, label, platform badge, and scan count
  2. The QR image grows from the thumbnail's position with a CSS animation (~300ms ease-out)
  3. Share button (Web Share API) appears when browser supports it, shares URL + title
  4. Copy link button copies QR URL to clipboard with "Copied!" feedback for 2 seconds
  5. Dialog dismisses via X button, backdrop click, or Escape — all trigger reverse shrink animation
  6. Existing row actions (edit, download, delete) remain unaffected
**Plans:** 2/2 plans complete

Plans:
- [ ] 03.1-01-PLAN.md — Install shadcn Dialog, create use-copy-to-clipboard hook, add QR pop animation keyframes
- [ ] 03.1-02-PLAN.md — Build QrPreviewDialog component, wire into QrListRow with thumbnail click and animation

### Phase 4: Production
**Goal**: The app is live on Vercel with correct OAuth, production URLs, and branded error pages
**Depends on**: Phase 2, Phase 3
**Requirements**: PROD-01, PROD-02, PROD-03, PROD-04, PROD-05
**Success Criteria** (what must be TRUE):
  1. App is accessible on the production domain with all env vars configured
  2. Google OAuth callback works on the production domain
  3. QR images encode the production domain URL, not localhost
  4. Missing slug and inactive slug each render a branded, sidebar-free error page
**Plans:** 1/2 plans executed

Plans:
- [ ] 04-01-PLAN.md — Branded error pages: ScannerError component, upgrade not-found and deactivated pages
- [ ] 04-02-PLAN.md — Deploy to Vercel with env vars, configure OAuth for production, verify deployment

### Phase 5: Public QR Generation

**Goal:** Transform FluxQR from an owner-only tool into a public-facing system where anyone can generate QR codes with a custom message, verified phone number, and usage tracking — with a freemium gate (5 uses before forced sign-up), scan analytics per QR code, a lightweight admin panel, and a default/custom QR toggle grid
**Requirements**: PUB-01, PUB-02, PUB-03, PUB-04, PUB-05, PUB-06
**Depends on:** Phase 4
**Success Criteria** (what must be TRUE):
  1. Any visitor can customize a message and generate a QR code tied to their verified phone number
  2. Phone number verification ensures users can only create QR codes for their own number
  3. Unauthenticated users can use the system up to 5 times before being forced to create an account (tracked reliably across sessions)
  4. Every QR code has a persistent scan counter visible to its owner
  5. Admin UI shows per-user QR code counts and per-code scan counts
  6. Users can choose between "display my default QR code" and "set my custom QR code" via a 2-option grid
**Plans:** 3/5 plans executed

Plans:
- [ ] 05-01-PLAN.md — Install deps (twilio, shadcn InputOTP), DB schema (profiles, phone_usage, qr_codes changes), Twilio + admin client utilities, types
- [ ] 05-02-PLAN.md — Phone verification flow: Server Actions (send OTP, check OTP), phone input form, OTP entry component
- [ ] 05-03-PLAN.md — Public home page: two-card QR type grid, public QR form, freemium gate, result dialog
- [ ] 05-04-PLAN.md — Middleware (dashboard + admin route protection), OAuth callback account linking, sidebar admin link
- [ ] 05-05-PLAN.md — Admin dashboard: layout, user table, user detail, deactivation actions

### Phase 6: Refactor add/edit QR pages into modals with platform choice UX

**Goal:** Convert full-page /dashboard/new and /dashboard/[id]/edit routes into a centered dialog-based flow with a two-card QR type grid (Meu QR / Custom QR) as the first step of the create flow, and remove the old page routes entirely
**Requirements**: MODAL-01, MODAL-02, MODAL-03, MODAL-04, MODAL-05, MODAL-06, MODAL-07, MODAL-08
**Depends on:** Phase 5
**Success Criteria** (what must be TRUE):
  1. Clicking "New QR Code" opens a dialog with the QR type grid; selecting a type advances to the form
  2. Edit click opens the dialog directly on the form step, pre-filled with existing QR data
  3. Server Actions return { success: true } instead of redirect(), enabling dialog-based flow
  4. After create/edit: dialog closes, list refreshes via router.refresh(), toast fires, edited row pulses
  5. Old routes /dashboard/new and /dashboard/[id]/edit are removed (404)
**Plans:** 2 plans

Plans:
- [ ] 06-01-PLAN.md — Server Actions refactor (qr-actions.ts), QrTypeSelect component, QrForm dialog adaptation
- [ ] 06-02-PLAN.md — QrFormDialog component, QrList/QrListRow/DashboardPage wiring, old route deletion

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 3.1 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete   | 2026-03-11 |
| 2. Scanner | 2/2 | Complete   | 2026-03-11 |
| 3. QR Management | 4/4 | Complete   | 2026-03-11 |
| 3.1 Preview & Share | 1/2 | In Progress|  |
| 4. Production | 1/2 | In Progress|  |
| 5. Public QR Generation | 3/5 | In Progress|  |
| 6. Modal QR CRUD | 0/2 | Not started | - |
| 7. Code Review | 3/3 | Complete   | 2026-03-12 |

### Phase 7: Complete Code Review — Next.js Best Practices 2026 & Code Smells/Duplication

**Goal:** Audit the entire codebase for Next.js 16 / React 19 best practices, eliminate dead code, replace hardcoded hex values with design tokens, fix logic bugs, add SEO metadata and error boundaries, and update codebase documentation to reflect the actual implementation
**Requirements**: CR-01, CR-02, CR-03, CR-04, CR-05, CR-06, CR-07
**Depends on:** Phase 6
**Success Criteria** (what must be TRUE):
  1. Zero dead code files, zero unused dependencies, zero redundant wrapper components
  2. All hardcoded hex color values replaced with Tailwind design tokens
  3. Slug availability check queries all slugs (not just active), toast messages in English
  4. Root layout has metadataBase, Open Graph, Twitter card; robots.ts and sitemap.ts exist
  5. Dashboard and admin routes have error.tsx boundaries
  6. Codebase maps (ARCHITECTURE.md, CONCERNS.md, CONVENTIONS.md) reflect actual implementation
**Plans:** 3/3 plans complete

Plans:
- [ ] 07-01-PLAN.md — Dead code removal, redundant wrappers, bug fixes, toast language, dynamic imports, defense-in-depth comments
- [ ] 07-02-PLAN.md — Replace all hardcoded hex color values with Tailwind design tokens across ~10 files
- [ ] 07-03-PLAN.md — SEO metadata, error boundaries, codebase map rewrite, summary report
