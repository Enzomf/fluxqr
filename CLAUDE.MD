# CLAUDE.md

## Stack
- **Framework:** Next.js 15, App Router, React 19, TypeScript (strict)
- **Database:** Supabase (PostgreSQL + RLS + Realtime)
- **Auth:** Supabase Auth — Google OAuth only
- **Styling:** Tailwind CSS v4 + shadcn/ui (dark mode, class strategy)
- **Font:** Geist Sans + Geist Mono via `next/font`
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
│   ├── auth/callback/route.ts
│   ├── login/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx              # sidebar shell
│   │   ├── page.tsx                # QR list
│   │   ├── actions.ts              # signOut
│   │   ├── new/page.tsx + actions.ts
│   │   └── [id]/edit/page.tsx + actions.ts
│   ├── q/[slug]/
│   │   ├── page.tsx                # proxy: fetch + increment
│   │   ├── scanner-landing.tsx     # client component
│   │   └── not-found.tsx
│   └── api/slug-check/route.ts
├── components/
│   ├── ui/                         # shadcn — do not edit
│   ├── shared/                     # app-button, platform-badge, empty-state, page-header, qr-pulse-wrapper, app-toast
│   ├── auth/                       # google-sign-in-button
│   ├── dashboard/                  # sidebar, sidebar-link, qr-list, qr-list-row, delete-button
│   ├── qr-management/              # qr-form, platform-selector, slug-input, delete-dialog
│   ├── qr-generation/              # qr-image
│   └── scanner/                    # (reserved)
├── hooks/
│   ├── use-slug-check.ts
│   ├── use-qr-image.ts
│   └── use-copy-to-clipboard.ts
├── lib/
│   ├── supabase/server.ts + client.ts + middleware.ts
│   ├── redirect.ts                 # buildPlatformUrl()
│   ├── qr-generator.ts             # generateQrDataUrl(), downloadQrPng()
│   └── utils.ts                    # cn(), formatScanCount()
├── types/
│   ├── supabase.ts                 # auto-generated — run: supabase gen types
│   └── index.ts                    # Platform, QrCode app types
└── middleware.ts                   # protects /dashboard/*
```

---

## Database

```sql
qr_codes (
  id, user_id, slug UNIQUE, label,
  platform CHECK('whatsapp','sms','telegram'),
  contact_target, default_message,
  is_active DEFAULT true, scan_count DEFAULT 0,
  created_at, updated_at
)
```

RLS: owners have full CRUD · unauthenticated can SELECT where `is_active = true` (proxy only).
RPC: `increment_scan_count(qr_slug)` — atomic, SECURITY DEFINER.

---

## Env vars

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     # server only
NEXT_PUBLIC_SITE_URL          # used in OAuth redirectTo + QR image URL generation
```≈x
