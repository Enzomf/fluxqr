# Codebase Concerns

**Last updated:** 2026-03-12 (Phase 07 code review — full rewrite reflecting post-implementation state)

---

## Project State: Post-Implementation (v1.0 complete)

The FluxQR application is fully implemented across 7 phases. All concerns below reflect the **actual current codebase**, not pre-implementation gaps.

---

## Tech Debt

**`types/supabase.ts` is hand-written (never auto-generated):**
- Issue: `CLAUDE.md` says "auto-generated — run: `supabase gen types`" but the file contains hand-written type definitions.
- Files: `src/types/supabase.ts` — or the file may not exist; app uses `src/types/index.ts` for hand-written types
- Impact: DB schema changes require manual type updates. No type drift detection from Supabase schema.
- Fix: Run `supabase gen types typescript --project-id <ref> > src/types/supabase.ts` and update imports.

**`CLAUDE.md` says "Next.js 15" but package.json has `next: 16.1.6`:**
- Issue: Stack version mismatch between documentation and installed package.
- Files: `CLAUDE.md`, `package.json`
- Impact: Low functional impact — Next.js 16 is the installed version. Documentation is misleading.
- Fix: Update `CLAUDE.md` to reflect Next.js 16.

**Middleware deprecated in Next.js 16:**
- Issue: Build output shows `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.`
- Files: `src/middleware.ts`
- Impact: Will need to rename to `src/proxy.ts` before Next.js removes the old convention.
- Fix: Rename `src/middleware.ts` to `src/proxy.ts` when ready to migrate.

**Telegram remains in DB `platform CHECK` but is removed from UI:**
- Issue: The `qr_codes.platform` column has `CHECK('whatsapp','sms','telegram')` in the DB. Telegram was removed from the product UI in Quick Task 10.
- Files: Supabase migration file (DB constraint)
- Impact: No runtime risk — the server action schema only accepts `'whatsapp' | 'sms'`. DB constraint is wider than app allows, not tighter. Pre-existing telegram QRs remain valid in the DB.
- Fix (optional): Add a migration to remove `'telegram'` from the platform CHECK constraint. Low priority unless cleaning up legacy data.

---

## Security Considerations

**`/api/slug-check` has no rate limiting:**
- Risk: The endpoint returns slug availability (boolean) without auth. Full namespace enumeration possible.
- Files: `src/app/api/slug-check/route.ts`
- Current mitigation: Returns only boolean; no data beyond availability status.
- Recommendation: Add Vercel Edge rate limit headers or `x-ratelimit` logic for production.

**`phone_usage` table has no RLS (by design):**
- Risk: Service-role admin client is used for all phone_usage operations. If this were changed to anon, users could manipulate their own usage counts.
- Files: `src/app/actions/create-public-qr.ts`, `src/app/page.tsx`
- Current mitigation: Only accessed via `createAdminClient()` (service role). No user-scoped access.
- Status: Working as designed — documented here for audit clarity.

**`verified_phone` cookie is unencrypted:**
- Risk: The cookie value is the raw phone number. If intercepted, it reveals the user's phone number.
- Files: `src/app/page.tsx` (reads cookie), `src/app/actions/verify-phone.ts` (sets cookie)
- Impact: Cookie is httpOnly and secure in production (Vercel). Risk is acceptable for MVP.
- Recommendation: Consider signing the cookie value in v1.1 for tamper detection.

---

## Performance

**Scanner route client JS footprint (post-Phase-07 measured state):**
- The scanner page (`/q/[slug]`) is a pure Server Component with zero page-specific client JS.
- The root layout's `<Toaster />` (sonner, ~37KB) is loaded for all pages including the scanner. This is a shared framework chunk, not scanner-specific code.
- `ScannerError` uses plain `<img>` (not `next/image`) to avoid pulling the 15KB next/image client chunk into the scanner route.
- **Measured (2026-03-12 production build):** Zero page-specific JS chunks for `/q/[slug]`. The CLAUDE.md constraint (under 10KB page-specific JS) is satisfied.

**QR image generation is client-side only:**
- `generateQrDataUrl()` runs in browser via canvas. Every dashboard load regenerates QR data URLs for all visible rows.
- Files: `src/lib/qr-generator.ts`, `src/hooks/use-slug-check.ts`
- Impact: Burst of canvas operations on dashboard load. Acceptable for MVP with typical QR counts (<50 per user).
- Improvement: Memoize results or generate server-side for v1.1.

**`scan_count` is total-only, no time-series:**
- Schema has no `scan_events` table. Daily/weekly/geo analytics are impossible without a migration.
- Improvement: Add `scan_events(id, qr_id, scanned_at)` in v1.1 for sparkline charts.

---

## Fragile Areas

**`after()` for scan increment — fire-and-forget risk:**
- Files: `src/app/q/[slug]/page.tsx`
- The `increment_scan_count` RPC is called inside `after()` with an empty-cookie Supabase client. This is correct for the serverless environment (cookies() throws inside after()).
- Risk: Vercel serverless may terminate the function before the `after()` callback resolves in cold-start or edge cases. Scan counts could be undercounted under load.
- Mitigation: SECURITY DEFINER RPC is atomic — partial increments are not possible, only missed increments.

**`auth/callback` phone linkage is fire-and-forget:**
- Files: `src/app/auth/callback/route.ts`
- After Google OAuth sign-in, if a `verified_phone` cookie exists, the callback tries to link the phone to the user's profile. This is wrapped in try/catch and failure does not block the redirect to `/dashboard`.
- Risk: Silent failure means the phone is not linked but the user still lands on the dashboard without error.
- Mitigation: Low-impact — phone linkage is a convenience feature, not security-critical.

---

## Test Coverage

**Unit tests exist only for `redirect.ts`:**
- `src/lib/__tests__/redirect.test.ts` — tests `buildPlatformUrl()` with tsx runner (no test framework)
- All other code (Server Actions, Supabase queries, middleware, components) has zero test coverage
- High risk areas: Server Actions (auth bypass potential), RLS policies (unauthorized access potential)

**RLS policies have no integration tests:**
- A misconfigured RLS policy could expose one user's QR codes to another, or allow unauthenticated users to modify records.
- Fix: Add Supabase `pgTAP` tests or a local integration test suite for the 5 core RLS policies.

---

## Scaling Limits

**Single Supabase project for all environments:**
- Development, staging, and production likely share a single Supabase project.
- Fix: Create separate Supabase projects per environment before v1.1.

**No CDN caching for scanner route:**
- `/q/[slug]` is a dynamic route with `revalidate = 0` (default for routes that use cookies/after).
- Every QR scan hits a cold Vercel serverless function.
- Improvement: Add `export const revalidate = 60` to cache the QR record lookup for 60 seconds — trade-off: deactivation takes up to 60s to reflect.

---

*Concerns audit: 2026-03-12 (reflects post-implementation, v1.0 state)*
