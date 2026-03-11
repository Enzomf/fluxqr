# Requirements: FluxQR

**Defined:** 2026-03-10
**Core Value:** Scanning a QR code opens the right messaging app with the right message — zero friction, zero accounts, zero downloads.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [ ] **FOUN-01**: App renders with Geist font, dark surface background, and brand indigo tokens
- [ ] **FOUN-02**: shadcn/ui components inherit dark color scheme without manual overrides
- [ ] **FOUN-03**: `cn()` utility available for conditional class merging
- [ ] **FOUN-04**: `Platform` and `QrCode` TypeScript types defined and shared across app

### Database

- [ ] **DB-01**: `qr_codes` table with id, user_id, slug (unique), label, platform, contact_target, default_message, is_active, scan_count, created_at, updated_at
- [ ] **DB-02**: RLS policies: owners have full CRUD, unauthenticated can SELECT where is_active = true
- [ ] **DB-03**: `increment_scan_count(qr_slug)` RPC — atomic, SECURITY DEFINER
- [ ] **DB-04**: Partial index on `(slug) WHERE is_active = true` for proxy lookup performance
- [ ] **DB-05**: `update_updated_at()` trigger on every UPDATE

### Authentication

- [ ] **AUTH-01**: User can sign in with Google OAuth
- [ ] **AUTH-02**: Unauthenticated visits to `/dashboard/*` redirect to `/login`
- [ ] **AUTH-03**: OAuth callback exchanges code for session and redirects to `/dashboard`
- [ ] **AUTH-04**: User can sign out from sidebar, session cleared, redirected to `/login`

### App Shell

- [ ] **SHELL-01**: Authenticated users see sidebar with logo, nav links, avatar, and sign out
- [ ] **SHELL-02**: On mobile, sidebar opens as Sheet drawer via menu icon
- [ ] **SHELL-03**: Active nav link shows brand highlight with left border accent

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
| FOUN-01 | — | Pending |
| FOUN-02 | — | Pending |
| FOUN-03 | — | Pending |
| FOUN-04 | — | Pending |
| DB-01 | — | Pending |
| DB-02 | — | Pending |
| DB-03 | — | Pending |
| DB-04 | — | Pending |
| DB-05 | — | Pending |
| AUTH-01 | — | Pending |
| AUTH-02 | — | Pending |
| AUTH-03 | — | Pending |
| AUTH-04 | — | Pending |
| SHELL-01 | — | Pending |
| SHELL-02 | — | Pending |
| SHELL-03 | — | Pending |
| SCAN-01 | — | Pending |
| SCAN-02 | — | Pending |
| SCAN-03 | — | Pending |
| SCAN-04 | — | Pending |
| SCAN-05 | — | Pending |
| SCAN-06 | — | Pending |
| SCAN-07 | — | Pending |
| CREATE-01 | — | Pending |
| CREATE-02 | — | Pending |
| CREATE-03 | — | Pending |
| CREATE-04 | — | Pending |
| CREATE-05 | — | Pending |
| LIST-01 | — | Pending |
| LIST-02 | — | Pending |
| LIST-03 | — | Pending |
| EDIT-01 | — | Pending |
| EDIT-02 | — | Pending |
| EDIT-03 | — | Pending |
| EDIT-04 | — | Pending |
| DEL-01 | — | Pending |
| DEL-02 | — | Pending |
| DEL-03 | — | Pending |
| GEN-01 | — | Pending |
| GEN-02 | — | Pending |
| GEN-03 | — | Pending |
| ANLYT-01 | — | Pending |
| ANLYT-02 | — | Pending |
| ANLYT-03 | — | Pending |
| PROD-01 | — | Pending |
| PROD-02 | — | Pending |
| PROD-03 | — | Pending |
| PROD-04 | — | Pending |
| PROD-05 | — | Pending |

**Coverage:**
- v1 requirements: 48 total
- Mapped to phases: 0
- Unmapped: 48 ⚠️

---
*Requirements defined: 2026-03-10*
*Last updated: 2026-03-10 after initial definition*
