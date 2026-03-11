# Requirements: FluxQR

**Defined:** 2026-03-10
**Core Value:** Scanning a QR code opens the right messaging app with the right message — zero friction, zero accounts, zero downloads.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUN-01**: App renders with Geist font, dark surface background, and brand indigo tokens
- [x] **FOUN-02**: shadcn/ui components inherit dark color scheme without manual overrides
- [x] **FOUN-03**: `cn()` utility available for conditional class merging
- [x] **FOUN-04**: `Platform` and `QrCode` TypeScript types defined and shared across app

### Database

- [x] **DB-01**: `qr_codes` table with id, user_id, slug (unique), label, platform, contact_target, default_message, is_active, scan_count, created_at, updated_at
- [x] **DB-02**: RLS policies: owners have full CRUD, unauthenticated can SELECT where is_active = true
- [x] **DB-03**: `increment_scan_count(qr_slug)` RPC — atomic, SECURITY DEFINER
- [x] **DB-04**: Partial index on `(slug) WHERE is_active = true` for proxy lookup performance
- [x] **DB-05**: `update_updated_at()` trigger on every UPDATE

### Authentication

- [x] **AUTH-01**: User can sign in with Google OAuth
- [x] **AUTH-02**: Unauthenticated visits to `/dashboard/*` redirect to `/login`
- [x] **AUTH-03**: OAuth callback exchanges code for session and redirects to `/dashboard`
- [x] **AUTH-04**: User can sign out from sidebar, session cleared, redirected to `/login`

### App Shell

- [x] **SHELL-01**: Authenticated users see sidebar with logo, nav links, avatar, and sign out
- [x] **SHELL-02**: On mobile, sidebar opens as Sheet drawer via menu icon
- [x] **SHELL-03**: Active nav link shows brand highlight with left border accent

### Scanner Proxy

- [ ] **SCAN-01**: `/q/[slug]` fetches QR record by slug where is_active = true
- [ ] **SCAN-02**: Scan count increments atomically on page load (fire-and-forget, non-blocking)
- [ ] **SCAN-03**: Scanner landing shows label, editable message textarea, and platform CTA
- [ ] **SCAN-04**: Platform CTA opens WhatsApp (`wa.me`), SMS (`sms:`), or Telegram (`t.me`) deep link
- [ ] **SCAN-05**: Telegram renders copy-message + open-Telegram fallback (no pre-fill support)
- [ ] **SCAN-06**: Scanner page has zero auth, zero sidebar, under 10KB JS
- [ ] **SCAN-07**: Missing or inactive slug renders branded not-found page

### QR Creation

- [ ] **CREATE-01**: User can create QR code via form with label, slug, platform, contact target, message
- [ ] **CREATE-02**: Slug validates format (lowercase letters, numbers, hyphens only) on blur
- [ ] **CREATE-03**: Slug availability checked via debounced API call with inline feedback
- [ ] **CREATE-04**: Duplicate slug (unique constraint violation) handled gracefully
- [ ] **CREATE-05**: Successful creation redirects to `/dashboard`

### QR List

- [ ] **LIST-01**: Dashboard shows all user's active QR codes ordered by created_at desc
- [ ] **LIST-02**: Each row displays QR image thumbnail, label, slug, platform badge, scan count, edit and delete actions
- [ ] **LIST-03**: Empty state shows illustration + "Create your first QR" CTA when no codes exist

### QR Edit

- [ ] **EDIT-01**: Edit page pre-fills all fields from existing QR data
- [ ] **EDIT-02**: Platform selector is read-only on edit with tooltip explaining why
- [ ] **EDIT-03**: Successful save triggers green pulse on list row + success toast
- [ ] **EDIT-04**: Duplicate slug on edit handled with inline error

### QR Delete

- [ ] **DEL-01**: Delete opens confirmation dialog naming the specific QR code
- [ ] **DEL-02**: Confirming sets is_active = false (soft delete, never hard DELETE)
- [ ] **DEL-03**: Deleted code disappears from list, scanner shows inactive page

### QR Generation

- [ ] **GEN-01**: QR image points to `{SITE_URL}/q/{slug}` and is scannable
- [ ] **GEN-02**: QR uses brand colors (dark #0F172A on white) with high error correction
- [ ] **GEN-03**: User can download QR as PNG named `{slug}-fluxqr.png`

### Analytics

- [ ] **ANLYT-01**: Dashboard list rows display current scan_count
- [ ] **ANLYT-02**: Scan counts ≥ 1000 formatted as compact notation (e.g., 1.2k)
- [ ] **ANLYT-03**: Concurrent scans produce accurate count (no race conditions)

### Production

- [ ] **PROD-01**: Branded not-found page for missing slugs (no sidebar, minimal JS)
- [ ] **PROD-02**: Branded inactive page for deactivated slugs
- [ ] **PROD-03**: App deployed on Vercel with all env vars configured
- [ ] **PROD-04**: Google OAuth callback URL updated for production domain
- [ ] **PROD-05**: QR images generate URLs using production domain, not localhost

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Notifications

- **NOTF-01**: User receives email when scan count hits milestones
- **NOTF-02**: User can configure notification preferences

### Analytics v2

- **ANLYT-04**: Scan event history table with timestamps
- **ANLYT-05**: Sparkline chart per QR code in dashboard list row
- **ANLYT-06**: Date range filtering for scan analytics

### Multi-Platform

- **PLAT-01**: Additional platform support (Instagram, Facebook Messenger)
- **PLAT-02**: Custom deep link builder for arbitrary URL schemes

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat | Not core to QR-to-messaging value |
| Video/image attachments | Adds complexity, not needed for MVP |
| OAuth beyond Google | Single SSO sufficient for client |
| Native mobile app | Web-first, mobile-responsive |
| Framer Motion | Tailwind keyframes only per project rules |
| Team/multi-tenant | Single-user ownership for MVP |
| Dark/light toggle | Permanently dark for MVP |
| Custom QR styling (logos, colors) | Deferred — standard brand QR sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Complete |
| FOUN-02 | Phase 1 | Complete |
| FOUN-03 | Phase 1 | Complete |
| FOUN-04 | Phase 1 | Complete |
| DB-01 | Phase 1 | Complete |
| DB-02 | Phase 1 | Complete |
| DB-03 | Phase 1 | Complete |
| DB-04 | Phase 1 | Complete |
| DB-05 | Phase 1 | Complete |
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| SHELL-01 | Phase 1 | Complete |
| SHELL-02 | Phase 1 | Complete |
| SHELL-03 | Phase 1 | Complete |
| SCAN-01 | Phase 2 | Pending |
| SCAN-02 | Phase 2 | Pending |
| SCAN-03 | Phase 2 | Pending |
| SCAN-04 | Phase 2 | Pending |
| SCAN-05 | Phase 2 | Pending |
| SCAN-06 | Phase 2 | Pending |
| SCAN-07 | Phase 2 | Pending |
| CREATE-01 | Phase 3 | Pending |
| CREATE-02 | Phase 3 | Pending |
| CREATE-03 | Phase 3 | Pending |
| CREATE-04 | Phase 3 | Pending |
| CREATE-05 | Phase 3 | Pending |
| LIST-01 | Phase 3 | Pending |
| LIST-02 | Phase 3 | Pending |
| LIST-03 | Phase 3 | Pending |
| EDIT-01 | Phase 3 | Pending |
| EDIT-02 | Phase 3 | Pending |
| EDIT-03 | Phase 3 | Pending |
| EDIT-04 | Phase 3 | Pending |
| DEL-01 | Phase 3 | Pending |
| DEL-02 | Phase 3 | Pending |
| DEL-03 | Phase 3 | Pending |
| GEN-01 | Phase 3 | Pending |
| GEN-02 | Phase 3 | Pending |
| GEN-03 | Phase 3 | Pending |
| ANLYT-01 | Phase 3 | Pending |
| ANLYT-02 | Phase 3 | Pending |
| ANLYT-03 | Phase 3 | Pending |
| PROD-01 | Phase 4 | Pending |
| PROD-02 | Phase 4 | Pending |
| PROD-03 | Phase 4 | Pending |
| PROD-04 | Phase 4 | Pending |
| PROD-05 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 48 total
- Mapped to phases: 48
- Unmapped: 0

---
*Requirements defined: 2026-03-10*
*Last updated: 2026-03-11 after 01-01-PLAN execution (FOUN-01 through FOUN-04 complete)*
