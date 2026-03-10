# External Integrations

**Analysis Date:** 2026-03-10

## APIs & External Services

**Messaging Deep Links (outbound, client-side):**
- WhatsApp - QR scanner redirect to `wa.me/{number}?text={message}`
  - Implementation: `lib/redirect.ts` → `buildPlatformUrl()`
  - Note: strip non-digits from phone numbers before building URL
- SMS - QR scanner redirect to `sms:{number}?body={message}`
  - Implementation: `lib/redirect.ts` → `buildPlatformUrl()`
- Telegram - QR scanner redirect to `t.me/{username}`
  - Implementation: `lib/redirect.ts` → `buildPlatformUrl()`
  - Note: Telegram deep links do NOT support pre-filled messages; always render copy fallback

**Google Fonts API:**
- `next/font/google` loading `Geist` and `Geist_Mono` at build time
  - Location: `app/layout.tsx`
  - No API key required; handled by Next.js font optimization

## Data Storage

**Databases:**
- Supabase (PostgreSQL) — primary data store
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Server-only: `SUPABASE_SERVICE_ROLE_KEY`
  - Client library: `@supabase/supabase-js` + `@supabase/ssr`
  - Server client: `lib/supabase/server.ts` → `createClient()` (cookie-based)
  - Browser client: `lib/supabase/client.ts`
  - Middleware helper: `lib/supabase/middleware.ts`
  - Schema: single table `qr_codes` (id, user_id, slug, label, platform, contact_target, default_message, is_active, scan_count, created_at, updated_at)
  - RLS: enabled on all tables — owners have full CRUD; unauthenticated users can SELECT `WHERE is_active = true`
  - RPC: `increment_scan_count(qr_slug TEXT)` — atomic scan counter, `SECURITY DEFINER`
  - Realtime: not used in MVP
  - Auto-generated types: `src/types/supabase.ts` (run `supabase gen types typescript --local`)

**File Storage:**
- Local filesystem only — QR images are generated client-side as data URLs, not stored in object storage

**Caching:**
- None — Next.js Server Component default caching; `revalidatePath('/dashboard')` called after mutations

## Authentication & Identity

**Auth Provider:**
- Supabase Auth with Google OAuth 2.0
  - Provider: Google (only OAuth provider in MVP)
  - Flow: `signInWithOAuth({ provider: 'google', options: { redirectTo: NEXT_PUBLIC_SITE_URL + '/auth/callback' } })`
  - Callback route: `app/auth/callback/route.ts` — exchanges OAuth `code` for Supabase session
  - Server action: `app/login/actions.ts` → `signInWithGoogle()`
  - Sign-out action: `app/dashboard/actions.ts` → `signOut()`
  - Session storage: HTTP-only cookies via `@supabase/ssr`
  - Route protection: `middleware.ts` guards all `/dashboard/*` routes, redirects unauthenticated to `/login`
  - RLS enforcement: every query validates `auth.uid() = user_id`

**Required external setup:**
- Google Cloud Console: OAuth 2.0 client with callback URL `{SITE_URL}/auth/callback`
- Supabase Dashboard → Auth → Providers → Google: client ID + secret from Google Cloud Console

## Monitoring & Observability

**Error Tracking:**
- Not detected — no Sentry, Datadog, or equivalent configured

**Logs:**
- Next.js default server logging only

**Analytics:**
- Internal only — `scan_count` column on `qr_codes` table, incremented via `increment_scan_count` RPC on every `/q/[slug]` visit
- No third-party analytics (explicitly excluded from scanner landing page per CLAUDE.md: "zero analytics scripts on this route")

## CI/CD & Deployment

**Hosting:**
- Vercel — production deployment target
- `next build` produces optimized output for Vercel runtime

**CI Pipeline:**
- Not configured — no `.github/workflows/` or equivalent detected

**Database migrations:**
- Supabase CLI: `supabase db reset` (local) + migration applied to production project manually

## Slug Availability API

**Internal API route:**
- `app/api/slug-check/route.ts` — `GET /api/slug-check?slug={slug}` → `{ available: boolean }`
- Consumed by: `hooks/use-slug-check.ts` (debounced 400ms fetch)
- Used in: `components/qr-management/slug-input.tsx`

## Environment Configuration

**Required environment variables:**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (client-safe)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key (client-safe)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server only — never expose to client or prefix with NEXT_PUBLIC_)
- `NEXT_PUBLIC_SITE_URL` — Production domain (e.g. `https://fluxqr.io`) — used in OAuth `redirectTo` and QR image URL generation

**No `.env` file detected** — environment not yet configured in the scaffold.

**Secrets storage:**
- Development: `.env.local` (not committed, not yet created)
- Production: Vercel → Project → Settings → Environment Variables

## Webhooks & Callbacks

**Incoming:**
- `GET /auth/callback` (`app/auth/callback/route.ts`) — OAuth callback from Google via Supabase Auth

**Outgoing:**
- None — no outbound webhooks in MVP

## QR Code Generation

**Library:**
- `qrcode` npm package (planned, not yet installed)
  - Usage: `lib/qr-generator.ts` → `generateQrDataUrl(slug)` and `downloadQrPng(slug)`
  - Config: `width: 400, margin: 2, color.dark: '#0F172A', errorCorrectionLevel: 'H'`
  - URL encoded into QR: `${NEXT_PUBLIC_SITE_URL}/q/{slug}`
  - Client hook: `hooks/use-qr-image.ts`
  - Component: `components/qr-generation/qr-image.tsx`

---

*Integration audit: 2026-03-10*
