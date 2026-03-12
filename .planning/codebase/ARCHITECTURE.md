# Architecture

**Last updated:** 2026-03-12 (Phase 07 code review — full rewrite reflecting current state)

---

## Pattern Overview

**Overall:** Next.js 16 App Router with Server-first Architecture

**Key Characteristics:**
- Server Components handle all data fetching and Supabase queries — Client Components are UI-only
- Server Actions replace REST endpoints for mutations (create, update, soft-delete)
- Supabase Row-Level Security enforces authorization at the database layer, not just application layer
- Defense-in-depth auth: middleware (first layer) + layout Server Component `getUser()` (second layer)
- The scanner route (`/q/[slug]`) is a public, auth-free, Server Component-only path — zero client JS from page code

---

## Route Structure

```
/                           Server Component — public home, phone verification gate, public QR creation
/login                      Server Component — Google OAuth sign-in page
/auth/callback              Route Handler (GET) — OAuth exchange, session cookie write, redirect to /dashboard
/dashboard                  Server Component — authenticated QR list with inline modal dialogs
/admin                      Server Component — admin user table (admin role required)
/admin/[userId]             Server Component — per-user QR codes detail view
/q/[slug]                   Server Component — scanner proxy: fetch, increment scan, redirect
/api/slug-check             Route Handler (GET) — availability check for slug (no auth required)
/robots.txt                 Static — generated via src/app/robots.ts (MetadataRoute.Robots)
/sitemap.xml                Static — generated via src/app/sitemap.ts (MetadataRoute.Sitemap)
```

**Error boundaries:**
- `/dashboard/error.tsx` — Client Component error boundary with Try Again button
- `/admin/error.tsx` — Client Component error boundary with Try Again button
- `/q/[slug]/not-found.tsx` — Server Component 404 page (no JS, uses ScannerError)

---

## Server / Client Component Boundaries

| File | Type | Reason |
|------|------|--------|
| `app/layout.tsx` | Server Component | HTML shell, metadata — no browser APIs |
| `app/page.tsx` | Server Component | Reads cookies, queries phone_usage via admin client |
| `app/home-client.tsx` | Client Component (`'use client'`) | Interactive multi-step form state |
| `app/login/page.tsx` | Server Component | Static render |
| `app/dashboard/layout.tsx` | Server Component | Auth guard, fetches user + role |
| `app/dashboard/page.tsx` | Server Component | Fetches QR list |
| `app/admin/layout.tsx` | Server Component | Auth + role guard |
| `app/admin/page.tsx` | Server Component | Fetches all users + stats |
| `app/admin/[userId]/page.tsx` | Server Component | Fetches single user's QRs |
| `app/q/[slug]/page.tsx` | Server Component | Scanner proxy — zero client JS |
| `app/dashboard/error.tsx` | Client Component (`'use client'`) | Next.js error boundary API requires client |
| `app/admin/error.tsx` | Client Component (`'use client'`) | Next.js error boundary API requires client |
| `components/dashboard/sidebar.tsx` | Client Component | Mobile sheet toggle, responsive state |
| `components/dashboard/qr-list.tsx` | Client Component | Dialog state, optimistic UI, router.refresh() |
| `components/dashboard/qr-list-row.tsx` | Client Component | Per-row toast, pulse animation trigger |
| `components/dashboard/qr-preview-dialog.tsx` | Client Component | Clipboard, dialog state |
| `components/dashboard/phone-verify-dialog.tsx` | Client Component | OTP form, multi-step |
| `components/qr-management/qr-form-dialog.tsx` | Client Component | Dialog wrapper with form |
| `components/qr-management/qr-form.tsx` | Client Component (`useActionState`) | Form with server action |
| `components/qr-management/slug-input.tsx` | Client Component | Debounced availability check |
| `components/qr-management/platform-selector.tsx` | Client Component | Selection state |
| `components/public/freemium-gate.tsx` | Client Component | Gating UI logic |
| `components/public/phone-verify-form.tsx` | Client Component | Phone input, OTP trigger |
| `components/public/otp-verify-form.tsx` | Client Component | OTP input, auto-submit on 6 digits |
| `components/public/public-qr-form.tsx` | Client Component | Public QR creation form |
| `components/public/public-qr-result-dialog.tsx` | Client Component | QR result display, clipboard |
| `components/scanner/scanner-error.tsx` | Server Component | Static error page, no client JS |
| `components/shared/*` | Server Components | Stateless display components |
| `components/auth/google-sign-in-button.tsx` | Client Component | Form submit |

---

## Data Flow

### Authenticated Dashboard (Read)

1. Request hits `/dashboard` → middleware validates session via inline Supabase client
2. `app/dashboard/layout.tsx` (Server Component) calls `getUser()` — defense-in-depth second check
3. `app/dashboard/page.tsx` (Server Component) fetches QR list via `lib/supabase/server.ts`
4. Supabase RLS automatically filters rows to `auth.uid() = user_id`
5. Data passed as props to `QrList` Client Component
6. `QrList` owns dialog state (`dialogOpen`, `editingQr`, `pulseId`) — single source of truth

### QR Creation (Mutation — Dashboard)

1. User opens create dialog in `QrList` → `QrFormDialog` renders `QrForm` with `key="create"`
2. `QrForm` uses `useActionState(createQrCode, initialState)` — tied to `qr-actions.ts`
3. `createQrCode` Server Action: Zod validation → getUser() → profile phone check → Supabase insert
4. Server Action returns `{ success: true }` — `QrFormDialog` detects via `useEffect`, closes dialog
5. `router.refresh()` called after close — re-fetches dashboard data from server

### QR Mutation (Mutation — Edit/Delete)

- Edit: `updateQrCode(id, prevState, formData)` — platform field excluded from schema (read-only)
- Delete: `deleteQrCode(id)` — soft delete (`is_active = false`), never hard DELETE
- Both call `revalidatePath('/dashboard')` after success

### Scanner Proxy (Public)

1. Mobile user scans QR code → hits `/q/[slug]`
2. `app/q/[slug]/page.tsx` fetches record with anon client (RLS: `is_active = true`)
3. If not found: checks with admin client whether slug exists (inactive vs. missing distinction)
4. If inactive: renders `ScannerError` with 410 status copy (no redirect)
5. If missing: calls `notFound()` → renders `not-found.tsx`
6. If found: schedules scan increment via `after()` callback with empty-cookie Supabase client
7. Calls `buildPlatformUrl()` and redirects to platform deep link
8. Zero client JavaScript from page code — Server Component all the way

### Public QR Creation (Unauthenticated)

1. Home page (`/`) — Server Component reads `verified_phone` cookie
2. Server Component checks `phone_usage` via admin client to determine `isGated`
3. Passes `{ verifiedPhone, isGated }` to `HomeClient` — prevents flash of wrong step
4. `HomeClient` shows: phone form → OTP verify → QR type grid → QR form → result dialog
5. `createPublicQr` Server Action: uses admin client (bypasses user RLS), `user_id = null`
6. Phone verification uses Twilio via raw fetch in `lib/twilio.ts`

### Admin Flow

1. Middleware checks `/admin/*` — requires authenticated + admin role (from `profiles.role`)
2. Admin layout double-checks role (defense-in-depth)
3. Admin actions in `admin-actions.ts` call `verifyAdmin()` before any DB operation
4. Admin UI: user table with QR counts, per-user QR detail view

---

## Supabase Client Variants

| File | Type | When Used |
|------|------|-----------|
| `lib/supabase/server.ts` | `createServerClient` (SSR, cookies) | Server Components, Server Actions |
| `lib/supabase/client.ts` | `createBrowserClient` | Client-side hooks (e.g., future use) |
| `lib/supabase/admin.ts` | `createClient` (@supabase/supabase-js, service role) | Admin actions, public QR creation, scanner inactive check |
| Inline in `middleware.ts` | `createServerClient` with request/response cookies | Middleware (cannot use server.ts — no cookie API) |
| Inline in `auth/callback/route.ts` | `createServerClient` with direct cookie write | OAuth code exchange (needs direct cookie control) |
| Inline `after()` in scanner | `createServerClient` with empty cookies | Fire-and-forget scan increment (no cookie context in after()) |

---

## Auth Flow

```
User hits /dashboard
  → middleware: createServerClient + getUser()
    → no session: redirect to /login
    → session OK: continue
  → dashboard layout: getUser() (defense-in-depth)
    → no user: redirect to /login
    → user OK: fetch profile.role
  → render dashboard with isAdmin prop

Google OAuth sign-in:
  /login → GoogleSignInButton → supabase.auth.signInWithOAuth()
  → redirects to Google → Google redirects to /auth/callback?code=...
  → callback route: exchange code for session (supabase.auth.exchangeCodeForSession)
  → if verifiedPhone cookie: fire-and-forget phone linkage to profile
  → redirect to /dashboard
```

---

## Modal Dialog Flow (QrList State Machine)

```
QrList (Client Component) owns:
  - dialogOpen: boolean
  - editingQr: QrCodeWithImage | null
  - pulseId: string | null

Create flow:
  "New QR" button → setDialogOpen(true), setEditingQr(null)
  QrFormDialog renders QrForm with key="create" (resets useActionState)
  Form success → QrFormDialog detects success → closes dialog
  QrList.onSuccess() → setPulseId(newId) → router.refresh()

Edit flow:
  Row edit button → setEditingQr(qr), setDialogOpen(true)
  QrFormDialog renders QrForm with key={qr.id} (resets useActionState)
  Form success → QrFormDialog detects success → closes dialog
  QrList.onSuccess() → setPulseId(editedId) → router.refresh()

Delete flow:
  Row delete button → DeleteDialog confirms → deleteQrCode(id)
  → revalidatePath from server action triggers router.refresh() via Next.js
```

---

## Key Abstractions

**FormState type** (`src/app/dashboard/qr-actions.ts`):
```ts
export type FormState = {
  success?: boolean
  errors?: { [field: string]: string[] }
  message?: string | null
  id?: string
}
```
Used with `useActionState` in Client Components. `id` field enables callers to identify which record was affected without redirect.

**buildPlatformUrl** (`src/lib/redirect.ts`):
Pure function. Constructs deep-link URLs for WhatsApp (`wa.me/...?text=`) and SMS (`sms:...?body=`). Telegram removed — deep links don't support pre-filled messages, and platform was removed from the product. Exhaustive switch with `satisfies never` default for compile-time safety.

**createAdminClient** (`src/lib/supabase/admin.ts`):
Uses `@supabase/supabase-js` (not `@supabase/ssr`) — no cookie handling needed for service-role bypass operations. Canonical pattern for all elevated DB access.

**QrGenerator** (`src/lib/qr-generator.ts`):
`generateQrDataUrl()` for canvas-based PNG generation (client-side via hook). `downloadQrPng()` for browser download. No directive — tree-shaking separates server/client usage.

---

## Error Handling

| Pattern | Location |
|---------|----------|
| Next.js error boundaries | `app/dashboard/error.tsx`, `app/admin/error.tsx` |
| Not-found pages | `app/q/[slug]/not-found.tsx` |
| 410 deactivated | `app/q/[slug]/page.tsx` renders `ScannerError` with 410 copy |
| Server Action errors | Returns typed `FormState` with `errors` or `message` field |
| Middleware redirect | Auth failure → redirect to /login, role failure → redirect to /dashboard |

---

## SEO / Metadata

| File | Output |
|------|--------|
| `app/layout.tsx` | Root metadata: metadataBase, title template, OG tags, Twitter card |
| `app/robots.ts` | `/robots.txt`: allows `/`, disallows `/dashboard/` and `/admin/` |
| `app/sitemap.ts` | `/sitemap.xml`: lists `/` and `/login` |
| Route `page.tsx` files | Override title via `export const metadata: Metadata = { title: '...' }` using template |

---

*Architecture: last updated 2026-03-12 (Phase 07 — reflects all 7 implementation phases)*
