# CLAUDE.md

## Stack
- **Framework:** Next.js 16, App Router, React 19, TypeScript (strict)
- **Database:** Supabase (PostgreSQL + RLS + Realtime)
- **Auth:** Supabase Auth — Google OAuth + phone OTP (Twilio Verify)
- **Styling:** Tailwind CSS v4 + shadcn/ui (dark mode, class strategy)
- **Font:** Geist Sans + Geist Mono via `next/font`
- **PWA:** Serwist (service worker, offline page, web manifest)
- **Testing:** Vitest + Testing Library + jsdom
- **Phone verification:** Twilio Verify API (raw fetch, no SDK)
- **Package manager:** pnpm
- **Deploy:** Vercel

---

## Project rules

- All Supabase queries in Server Components or Server Actions — never in Client Components.
- Every table must have RLS enabled. Every action must verify `auth.uid() = user_id`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. Prefix client-safe vars with `NEXT_PUBLIC_`.
- Use `cn()` from `lib/utils.ts` for all conditional class merging.
- Shared UI components live in `components/shared/`. Feature components live in `components/<feature>/`. shadcn primitives live in `components/ui/` — do not hand-edit them.
- No Framer Motion in MVP. Use Tailwind keyframes for all animations.
- The scanner page (`/q/[slug]`) must have zero auth, zero sidebar, under 10KB JS.
- Platform field is read-only after QR creation.
- Use soft delete (`is_active = false`) — never hard DELETE a `qr_codes` row.
- Co-located test files (`*.test.ts` beside source) using Vitest globals — no per-file imports for `describe`/`it`/`expect`/`vi`.
- Telegram platform removed — only `whatsapp` and `sms` are supported.
- Phone verification required before QR creation (both public freemium and dashboard flows).
- Admin routes protected by middleware + Server Action double guard (`verifyAdmin()`).
- `next build --webpack` required — Serwist does not run under Turbopack.

---

## Design tokens (Tailwind)

```
Brand:   #6366F1 (brand-500) · hover #4F46E5 (brand-600)
Surface: #0F172A (canvas) · #1E293B (raised) · #334155 (overlay)
Success: #10B981 · Danger: #F43F5E · Warning: #F59E0B
Font:    font-sans (Geist) · font-mono (Geist Mono)
Radius:  rounded-md (6px default) · rounded-lg (cards) · rounded-xl (modals)
```

---

## Directory structure

```
src/
├── app/
│   ├── ~offline/page.tsx             # PWA offline fallback
│   ├── actions/                      # Server Actions (admin, check-otp, create-public-qr, verify-phone)
│   ├── admin/
│   │   ├── layout.tsx                # admin guard
│   │   ├── page.tsx                  # admin dashboard
│   │   ├── [userId]/page.tsx         # user detail
│   │   └── error.tsx
│   ├── auth/callback/route.ts        # OAuth callback + phone linking
│   ├── dashboard/
│   │   ├── layout.tsx                # sidebar shell
│   │   ├── page.tsx                  # QR list with modal management
│   │   ├── actions.ts                # signOut
│   │   ├── qr-actions.ts             # createQr, updateQr, deleteQr, toggleActive
│   │   └── error.tsx
│   ├── login/
│   │   ├── page.tsx
│   │   └── actions.ts                # signInWithGoogle
│   ├── q/[slug]/
│   │   ├── page.tsx                  # scanner proxy: fetch + increment
│   │   └── not-found.tsx             # 404/410 scanner error
│   ├── api/slug-check/route.ts
│   ├── home-client.tsx               # public freemium flow client component
│   ├── page.tsx                      # public landing / freemium QR generation
│   ├── layout.tsx                    # root layout
│   ├── manifest.ts                   # PWA manifest
│   ├── sw.ts                         # Serwist service worker entry
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── ui/                           # shadcn — do not edit
│   ├── shared/                       # empty-state, page-header, platform-badge, qr-pulse-wrapper
│   ├── auth/                         # google-sign-in-button
│   ├── admin/                        # user-table, user-qr-table
│   ├── dashboard/                    # sidebar, sidebar-link, qr-list, qr-list-row, qr-preview-dialog, phone-verify-dialog
│   ├── public/                       # freemium-gate, phone-verify-form, otp-verify-form, public-qr-form, public-qr-result-dialog, qr-type-grid
│   ├── qr-management/                # qr-form, qr-form-dialog, qr-type-select, platform-selector, slug-input, delete-dialog
│   └── scanner/                      # scanner-error
├── hooks/
│   ├── use-slug-check.ts
│   └── use-copy-to-clipboard.ts
├── lib/
│   ├── supabase/server.ts + client.ts + admin.ts
│   ├── redirect.ts                   # buildPlatformUrl()
│   ├── qr-generator.ts               # generateQrDataUrl(), downloadQrPng()
│   ├── twilio.ts                     # sendOtp(), checkOtp() via Twilio Verify API
│   ├── phone-token.ts                # HMAC-signed phone link tokens
│   └── utils.ts                      # cn(), formatScanCount()
├── test/
│   ├── setup.ts                      # Vitest global setup (mocks for next/*, jsdom fixes)
│   └── utils.tsx                     # Test render utilities
├── types/
│   └── index.ts                      # Platform ('whatsapp'|'sms'), QrCode, AppRole, Profile
└── middleware.ts                     # protects /dashboard/*, /admin/*, redirects logged-in from / and /login
```

---

## Database

```sql
qr_codes (
  id, user_id, slug UNIQUE, label,
  platform CHECK('whatsapp','sms'),
  contact_target, default_message,
  phone_number,
  is_active DEFAULT true, scan_count DEFAULT 0,
  created_at, updated_at
)

profiles (
  id, email, phone_number,
  role CHECK('admin','user') DEFAULT 'user',
  is_active DEFAULT true,
  created_at
)

phone_usage (
  id, phone_number, created_count DEFAULT 0,
  last_created_at, created_at
)
```

RLS: owners have full CRUD on `qr_codes`. Unauthenticated can SELECT `qr_codes` where `is_active = true` (proxy only). `profiles` accessed via `auth.uid()`. `phone_usage` has NO RLS (service-role only).
RPC: `increment_scan_count(qr_slug)` — atomic, SECURITY DEFINER.

---

## Env vars

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY       # server only
NEXT_PUBLIC_SITE_URL            # OAuth redirectTo + QR image URL generation
TWILIO_ACCOUNT_SID              # server only
TWILIO_API_KEY_SID              # server only
TWILIO_API_KEY_SECRET           # server only
TWILIO_VERIFY_SERVICE_SID       # server only
ADMIN_EMAILS                    # comma-separated, server only
```
