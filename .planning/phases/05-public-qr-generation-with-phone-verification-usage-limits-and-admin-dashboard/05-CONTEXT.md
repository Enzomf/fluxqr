# Phase 5: Public QR Generation with Phone Verification, Usage Limits, and Admin Dashboard - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform FluxQR from an owner-only tool into a public-facing system. The home page becomes a public QR generator where anyone can create messaging QR codes after verifying their phone number via SMS OTP. A 5-use freemium gate (tracked per phone number) forces sign-up after 5 QR codes. Includes a role-based admin dashboard at /admin with user/QR visibility and deactivation powers. Does not include analytics charts, scan history, notifications, or additional OAuth providers.

</domain>

<decisions>
## Implementation Decisions

### Public generation flow
- Home page (/) becomes the public QR generation tool — no login required to start
- Two-card selection grid on the home page: "My QR Code" (default messaging QR for verified phone, no custom message) and "Custom QR" (visitor writes a custom message)
- Minimal form: phone number + message textarea only — platform defaults to WhatsApp, slug is auto-generated
- After generation, QR appears in a modal/dialog (reusing Phase 3.1 preview dialog pattern) with download action
- Visitor dismisses dialog to create another QR code
- /login remains available for returning authenticated users

### Phone verification
- Twilio for SMS OTP delivery (6-digit code) sent to the visitor's phone number
- Verification happens first — before the form/card selection is shown
- Verified phone remembered via cookie/session for future visits (skip re-verification on return)
- Phone is locked: visitor can only create QR codes for the number they verified — no way to enter a different contact_target

### Freemium gate
- Each QR code created = 1 use toward the 5-use limit
- Usage tracked server-side per verified phone number — reliable, can't be bypassed by clearing cookies
- At limit: form is disabled with hard block — "You've used your 5 free QR codes. Sign up with Google to continue." with Google sign-in button inline
- After signing up with Google, QR codes previously created with their verified phone number are auto-linked to the new account — seamless transition to dashboard

### Admin dashboard
- Admin access determined by a role column on a user/profiles table (not hardcoded emails)
- Separate /admin route with its own layout — middleware checks admin role
- Admin sidebar link visible only to users with admin role
- Data view: table of all users with email, phone, QR codes created count, total scans, sign-up date
- Click a user row to see their individual QR codes with per-code scan counts
- Admin actions: can deactivate users and deactivate individual QR codes (abuse prevention)
- No edit/delete capabilities — deactivation only

### Carried from prior phases
- Dark-only theme with canvas/raised/overlay surface tokens (Phase 1)
- Server Actions for all mutations (Phase 1)
- Soft delete only — is_active = false, never hard DELETE (project rule)
- No Framer Motion — Tailwind keyframes only (project rule)
- QR image uses brand colors: #0F172A modules on white background (Phase 3)
- Compact scan count formatting via formatScanCount() (Phase 3)

### Claude's Discretion
- Session/cookie implementation for remembered verification
- Database schema for profiles table and phone-to-user linking
- Auto-generated slug format for public QR codes
- Admin layout design (shared sidebar shell or standalone)
- Responsive behavior of the two-card grid on mobile
- OTP input UX (number of digits, auto-submit, resend timer)
- How to associate phone-created QR codes with Google account on sign-up

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/qr-generator.ts`: `generateQrDataUrl()` (server) and `downloadQrPng()` (client) — reuse for public QR generation
- `src/hooks/use-qr-image.ts`: `useQrImage()` hook — reuse in public generation result dialog
- `src/components/dashboard/qr-preview-dialog.tsx`: Preview dialog pattern from Phase 3.1 — adapt for public generation result
- `src/hooks/use-copy-to-clipboard.ts`: Copy to clipboard — reuse in result dialog
- `src/components/shared/platform-badge.tsx`: PlatformBadge component — reuse in admin views
- `src/lib/utils.ts`: `cn()`, `formatScanCount()` — used across all new views
- `src/lib/supabase/server.ts`: `createClient()` for server-side queries
- `src/lib/redirect.ts`: `buildPlatformUrl()` — existing deep link builder
- `src/components/auth/google-sign-in-button.tsx`: Google sign-in button — reuse in freemium gate CTA

### Established Patterns
- Server Components for data fetching, Client Components for interactivity
- Server Actions with `'use server'` for mutations
- Dashboard layout with sidebar (src/app/dashboard/layout.tsx) — pattern reference for admin layout
- Middleware-based route protection (dashboard uses getUser() check) — extend for admin role check
- Tailwind v4 CSS-first config via globals.css @theme inline

### Integration Points
- `src/app/page.tsx`: Currently redirects to /login — becomes the public QR generation page
- `src/app/login/page.tsx`: Stays as-is for returning users
- `src/app/admin/`: New route group for admin dashboard
- `src/app/admin/layout.tsx`: New layout with admin role check
- `src/middleware.ts`: Needs creation — protect /dashboard/* and /admin/* routes
- Database: New profiles table with role column, phone number field, usage tracking
- Database: Modify qr_codes to support phone-based ownership (nullable user_id, add phone_number column)

</code_context>

<specifics>
## Specific Ideas

- The home page should feel like a tool you can use immediately — verify phone, pick default or custom, get your QR
- Two-card grid ("My QR Code" vs "Custom QR") is the central UX decision point — should feel like choosing between two product options
- Freemium gate must be a hard stop, not a soft nudge — form disabled, clear message, sign-up button right there
- Admin deactivation is for abuse prevention, not content management — keep it simple

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-public-qr-generation-with-phone-verification-usage-limits-and-admin-dashboard*
*Context gathered: 2026-03-11*
