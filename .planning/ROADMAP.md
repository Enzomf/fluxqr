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
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 3.1 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete   | 2026-03-11 |
| 2. Scanner | 2/2 | Complete   | 2026-03-11 |
| 3. QR Management | 4/4 | Complete   | 2026-03-11 |
| 3.1 Preview & Share | 1/2 | In Progress|  |
| 4. Production | 0/TBD | Not started | - |
