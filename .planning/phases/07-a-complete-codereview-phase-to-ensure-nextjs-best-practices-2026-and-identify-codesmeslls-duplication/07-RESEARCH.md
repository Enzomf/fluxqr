# Phase 7: Complete Code Review — Next.js Best Practices 2026 & Code Smells/Duplication - Research

**Researched:** 2026-03-12
**Domain:** Next.js 16 / React 19 App Router — code quality audit, best practices enforcement, dead code elimination
**Confidence:** HIGH (based on full codebase read + official Next.js docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Review scope & depth**
- Full codebase audit — every file in src/ including components/ui/ (shadcn) and types/supabase.ts (auto-generated)
- Find duplicated logic/patterns and refactor into shared utilities, hooks, or components
- Find and remove dead code — unused imports, exports, variables, and files
- Update codebase maps (.planning/codebase/) — CONCERNS.md, CONVENTIONS.md, ARCHITECTURE.md are outdated (written pre-implementation 2026-03-10)

**Fix approach**
- Fix everything inline during the review — code smells, duplication, dead code, best practice violations
- Commits grouped by category (e.g., "fix: remove dead code", "refactor: extract shared utils", "fix: Next.js best practices") — clean git history
- Brief summary report produced after all fixes — categories, file counts, key improvements — lives in phase directory

**Next.js 2026 baseline**
- **Server/Client boundaries:** Verify 'use client' only where needed, no Supabase calls in Client Components, proper data passing between server and client
- **Metadata & SEO:** Check generateMetadata usage, Open Graph tags, proper titles/descriptions on all routes, robots.txt
- **Caching & revalidation:** Review fetch caching, revalidatePath/revalidateTag usage, Server Action invalidation, static vs dynamic rendering
- **Security patterns:** Verify RLS enforcement, input validation (Zod), env var exposure, CSRF protection via Server Actions, middleware auth checks
- **Accessibility basics:** Check alt text on images, aria labels on interactive elements, keyboard navigation on dialogs/modals — fix issues found
- **Error boundaries & loading states:** Check all route segments for error.tsx, loading.tsx, not-found.tsx — add missing ones where appropriate
- **Scanner bundle budget:** Verify /q/[slug] stays under 10KB JS — if over, identify and fix the cause (CLAUDE.md hard rule)

### Claude's Discretion
- Order of review categories (which to tackle first)
- Whether to split large refactors into sub-tasks or handle inline
- How to structure the summary report
- Which error/loading states are worth adding vs unnecessary
- Exact accessibility improvements needed

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

</user_constraints>

---

## Summary

This phase is a full codebase audit of ~75 files in `src/`. The codebase is a Next.js 16 / React 19 App Router project with Supabase, Tailwind v4, and shadcn/ui. After reading every file, the overall code quality is good — the project was built systematically over 6+ phases with strong patterns. However, several concrete, fixable issues were identified across 7 categories: hardcoded color tokens, missing metadata, missing route-level special files, duplicate Server Client inline instantiation in the scanner page, a thin wrapper component that adds no value, inconsistent toast language mixing (Portuguese vs English), and a redundant hook. The codebase maps in `.planning/codebase/` need a full rewrite to reflect the actual implementation.

**Primary recommendation:** Fix all issues inline in category-grouped commits. The biggest wins are: replacing hardcoded hex values with design tokens, eliminating the inline `createServerClient` duplication in the scanner page, adding `robots.txt` / `sitemap.ts`, and adding `error.tsx` to route segments that can fail.

---

## Actual Codebase State (Full Read Summary)

### File count by directory

| Directory | Files | Notes |
|-----------|-------|-------|
| `src/app/` | 20 | routes, layouts, actions, globals |
| `src/components/` | 38 | ui (13 shadcn), shared (5), dashboard (7), qr-management (6), public (6), admin (2), scanner (1) |
| `src/hooks/` | 3 | use-slug-check, use-qr-image, use-copy-to-clipboard |
| `src/lib/` | 7 | utils, redirect, qr-generator, twilio, supabase/* (4) |
| `src/types/` | 1 | index.ts (supabase.ts is absent — not generated yet) |
| `src/middleware.ts` | 1 | |
| **Total** | **70** | |

Note: `src/types/supabase.ts` listed in CLAUDE.md does NOT exist — `supabase gen types` was never run. The app uses the `QrCode` type from `src/types/index.ts` instead, which is manually maintained and accurate for current needs.

---

## Findings by Category

### Category 1: Hardcoded Color Tokens (WIDE SPREAD)

**Problem:** Multiple components use raw hex values (`#1E293B`, `#334155`, `#6366F1`, `#4F46E5`, `#0F172A`, `#94A3B8`, `#64748B`) instead of Tailwind design tokens defined in `globals.css`.

**Files with hardcoded hex values:**
- `src/app/home-client.tsx` — `bg-[#0F172A]`, `text-[#6366F1]`, `text-[#94A3B8]`, `text-[#64748B]`, `text-[#6366F1]`, `hover:text-[#4F46E5]`
- `src/app/admin/layout.tsx` — `bg-[#0F172A]`, `bg-[#1E293B]`, `text-[#6366F1]`, `text-[#818CF8]`, `bg-[#6366F1]/10`
- `src/components/dashboard/qr-list-row.tsx` — `bg-[#1E293B]`, `border-[#334155]`
- `src/components/qr-management/qr-form.tsx` — `border-[#334155]`, `bg-[#0F172A]`, `text-[#F59E0B]`, `bg-[#6366F1]`, `hover:bg-[#4F46E5]`, `bg-[#1E293B]`
- `src/components/qr-management/qr-form-dialog.tsx` — `bg-[#6366F1]`, `hover:bg-[#4F46E5]`
- `src/components/qr-management/delete-dialog.tsx` — `bg-[#1E293B]`, `border-[#334155]`, `bg-[#F43F5E]`, `hover:bg-[#F43F5E]/90`
- `src/components/public/public-qr-form.tsx` — `bg-[#1E293B]`, `border-[#334155]`, `bg-[#0F172A]`, `text-[#6366F1]`, `text-[#94A3B8]`, `focus:ring-[#6366F1]`, `bg-[#6366F1]`, `hover:bg-[#4F46E5]`
- `src/components/public/freemium-gate.tsx` — `bg-[#1E293B]`, `border-[#334155]`, `text-[#94A3B8]`
- `src/components/admin/user-table.tsx` — `bg-[#1E293B]`, `bg-[#0F172A]`, `bg-[#334155]/30`, `text-[#6366F1]`, `hover:text-[#6366F1]`, `bg-[#F43F5E]/10`, `text-[#F43F5E]`, `border-[#F43F5E]/40`
- `src/components/dashboard/phone-verify-dialog.tsx` (not yet read, suspected)

**Available tokens (from globals.css `@theme inline`):**
```
bg-surface        → #0F172A (canvas)
bg-surface-raised → #1E293B (raised)
bg-surface-overlay → #334155 (overlay)
text-brand-400    → #818CF8
text-brand-500    → #6366F1 (brand)
text-brand-600    → #4F46E5 (brand hover)
text-warning      → #F59E0B
text-danger       → #F43F5E
bg-brand-500      → #6366F1
bg-brand-600      → #4F46E5
bg-danger         → #F43F5E
text-slate-400    (standard Tailwind)
text-slate-500    (standard Tailwind)
```

**Fix:** Replace all hardcoded hex values with named tokens. This is purely a find-replace operation per file.

---

### Category 2: Duplicate Inline Supabase Client Construction (scanner page)

**Problem:** `src/app/q/[slug]/page.tsx` (the scanner proxy) instantiates `createServerClient` inline twice:
1. An admin client for the inactive slug check (lines 28–39)
2. An anon client inside the `after()` callback for scan increment (lines 61–73)

Both constructions are boilerplate duplicating what `createAdminClient()` and the existing patterns already provide. The inline admin client at lines 28–39 is especially notable because `createAdminClient()` exists in `src/lib/supabase/admin.ts` for exactly this purpose.

**Fix:** Replace the inline admin client with `createAdminClient()` from `@/lib/supabase/admin`. The `after()` anon client is architecturally justified (no cookies in after callbacks) — document it clearly but leave it. This is the pattern already established in STATE.md.

---

### Category 3: Redundant Wrapper Component — `DeleteButton`

**Problem:** `src/components/dashboard/delete-button.tsx` is a one-liner that does nothing but re-export `DeleteDialog`:

```tsx
// delete-button.tsx — entire file:
export function DeleteButton({ id, label, onDelete }: DeleteButtonProps) {
  return <DeleteDialog id={id} label={label} onDelete={onDelete} />
}
```

This adds a file, an import, and an indirection with zero benefit.

**Fix:** In `qr-list-row.tsx`, import `DeleteDialog` directly and delete `delete-button.tsx`.

---

### Category 4: Thin Wrapper Hook — `useQrImage`

**Problem:** `src/hooks/use-qr-image.ts` is a 5-line hook that does nothing but call `downloadQrPng`:

```ts
export function useQrImage(slug: string, dataUrl: string) {
  return {
    dataUrl,
    download: () => downloadQrPng(dataUrl, slug),
  }
}
```

It is not used anywhere in the codebase (confirmed by reading all files — `qr-list-row.tsx` calls `downloadQrPng` directly). This is dead code.

**Fix:** Delete `src/hooks/use-qr-image.ts`. It is unused.

---

### Category 5: Metadata / SEO Gaps

**Problems found:**

1. **Missing Open Graph tags** — `src/app/layout.tsx` exports minimal metadata (title + description only). No `openGraph`, `twitter`, `robots`, `canonical` are defined.

2. **Missing metadata on scanner route** — `src/app/q/[slug]/page.tsx` exports a static `metadata = { title: 'FluxQR' }` at the top. Since the page immediately redirects, this is technically fine, but it should use `export const metadata` typed as `Metadata`.

3. **No `robots.ts`** — There is no `src/app/robots.ts` file. Next.js supports a typed `robots.ts` that generates `robots.txt` automatically. The default Next.js behavior (without a robots.ts) is `Allow: /` for all crawlers, which is permissible but `/admin` and `/dashboard` should be `Disallow`.

4. **No `sitemap.ts`** — There is no sitemap. For this app, a static sitemap with just `/` and `/login` is sufficient (all other routes are auth-gated or slug-based).

5. **Admin page metadata** — `src/app/admin/page.tsx` exports `metadata = { title: 'Admin — FluxQR' }` as an untyped object (should be `Metadata` type). Minor.

6. **Missing `metadataBase`** — The root layout metadata does not include `metadataBase`, which is required when using absolute URLs in Open Graph / canonical tags.

**Fix:** Add `metadataBase`, Open Graph tags, and Twitter card to root layout. Add `robots.ts`. Add `sitemap.ts`. Type the admin page metadata.

---

### Category 6: Missing Route Segment Files (error.tsx, loading.tsx)

**Current state of special files:**
- `src/app/q/[slug]/not-found.tsx` — EXISTS (custom branded 404)
- No `error.tsx` anywhere in the app
- No `loading.tsx` anywhere in the app
- No `global-error.tsx`

**What to add (Claude's discretion applies here):**

| Route | `error.tsx` | `loading.tsx` | Rationale |
|-------|-------------|---------------|-----------|
| `src/app/dashboard/` | YES — add | OPTIONAL | Dashboard does DB queries that can fail; error boundary needed |
| `src/app/admin/` | YES — add | OPTIONAL | Admin queries large datasets; error boundary needed |
| `src/app/` (root) | `global-error.tsx` optional | NO | Root-level fallback |

**Why loading.tsx is lower priority:** The scanner page redirects immediately (no visual loading state useful). The dashboard fetches are fast. The admin page is internal. A `loading.tsx` skeleton would improve perceived performance but is not a hard requirement.

**Fix:** Add `error.tsx` to `src/app/dashboard/` and `src/app/admin/`. Decide on `loading.tsx` at implementation time.

---

### Category 7: Inconsistent Toast Language (Portuguese strings in English UI)

**Problem:** `src/components/qr-management/qr-form.tsx` has:
```tsx
toast.success(mode === 'create' ? 'QR criado com sucesso' : 'QR atualizado')
```
These are Portuguese strings in an otherwise English UI. All other user-facing strings are in English.

**Fix:** Replace with English: `'QR code created'` / `'QR code updated'`.

---

### Category 8: Server/Client Boundary Issues — None Found

After reading all files, **no Supabase calls were found in Client Components**. The pattern is correctly implemented:
- All DB queries are in Server Components (`page.tsx`, `layout.tsx`)
- All mutations are in `'use server'` actions
- Client Components receive data via props
- The `useSlugCheck` hook fetches from `/api/slug-check` (a proper API route), not directly from Supabase

This is a confirmed clean bill of health.

---

### Category 9: Security Pattern Review — One Concern

**Problem in `src/app/api/slug-check/route.ts`:**
```ts
const { data } = await supabase
  .from('qr_codes')
  .select('id')
  .eq('slug', slug)
  .eq('is_active', true)  // BUG: only checks active slugs
  .single()

return Response.json({ available: data === null })
```

This reports inactive slugs as "available" — a user could claim a slug that belongs to an inactive (soft-deleted) QR code. This is a semantic correctness issue, not a security vulnerability per se, but it violates the intent of slug uniqueness.

**Fix:** Remove `.eq('is_active', true)` from the slug-check query so it checks all slugs regardless of active state.

---

### Category 10: `admin/layout.tsx` — Hardcoded Token + Duplicate Auth Check

**Problem 1:** The admin layout uses `bg-[#0F172A]` and `bg-[#1E293B]` instead of `bg-surface` and `bg-surface-raised` (covered in Category 1).

**Problem 2:** The admin layout duplicates auth + role checks that are also in middleware. This is intentional defense-in-depth (as documented in STATE.md), but the pattern is inconsistent — `dashboard/layout.tsx` also does a double auth check. This is acceptable and should remain, but deserves a comment documenting why both exist.

**Fix for Problem 2:** Add a brief comment to both layout files: `// Defense-in-depth: middleware is first layer, layout is second`.

---

### Category 11: Codebase Maps Need Full Rewrite

**`.planning/codebase/ARCHITECTURE.md`:** Written pre-implementation. Describes only the Phase 1 structure. Missing: `/admin` routes, `/app/actions/` directory, `public/` components, `phone_usage` table, profiles table, Twilio integration, modal flows.

**`.planning/codebase/CONCERNS.md`:** Written pre-implementation. Contains hypothetical concerns that have since been resolved (or not). Needs complete replacement with actual post-implementation concerns.

**`.planning/codebase/CONVENTIONS.md`:** May be largely accurate but should be verified against what actually evolved.

**Fix:** Rewrite all three codebase map files to reflect the actual current state.

---

### Category 12: `cn()` Redundant Usage in `page-header.tsx`

**Problem:**
```tsx
<div className={cn('flex items-center justify-between')}>
```
`cn()` with a single static string adds no value — it's just `className="flex items-center justify-between"`.

**Fix:** Remove `cn()` wrapper from static-only class strings in `page-header.tsx`.

---

### Category 13: `check-otp.ts` — Dynamic Import Anti-Pattern

**Problem:** `src/app/actions/check-otp.ts` uses dynamic imports inside the function body:
```ts
const { createClient } = await import('@/lib/supabase/server')
const { createAdminClient } = await import('@/lib/supabase/admin')
```
These are used to avoid circular dependency issues (per the comment), but this is a code smell. Dynamic imports in Server Actions add latency and obscure the dependency graph. Static imports at the file top are the correct pattern.

**Fix:** Investigate whether static imports cause circular deps. If not, convert to static imports. If they do, document the reason in a comment.

---

### Category 14: `home-client.tsx` — Inline Style `bg-[#0F172A]`

Covered under Category 1. The home page uses `min-h-screen bg-[#0F172A]` — should be `bg-surface`.

---

## Standard Stack

### Core (actual versions in use)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `next` | 16.1.6 | Framework | In use |
| `react` / `react-dom` | 19.2.3 | UI runtime | In use |
| `typescript` | ^5 | Type safety | In use |
| `@supabase/ssr` | ^0.9.0 | Auth + SSR cookies | In use |
| `@supabase/supabase-js` | ^2.99.0 | Service-role client | In use |
| `tailwindcss` | ^4 | Styling | In use |
| `zod` | ^4.3.6 | Input validation | In use |
| `sonner` | ^2.0.7 | Toast notifications | In use |
| `lucide-react` | ^0.577.0 | Icons | In use |
| `qrcode` | ^1.5.4 | QR generation | In use |
| `geist` | ^1.7.0 | Font | In use |

### Supporting

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `next-themes` | ^0.4.6 | Theme utility | Installed but NOT used (dark-only design) — DEAD DEPENDENCY |
| `@base-ui/react` | ^1.2.0 | Dialog primitive | Used only in `qr-preview-dialog.tsx` |
| `shadcn` | ^4.0.3 | Component generator | Dev-time only |

**Dead dependency:** `next-themes` is in `package.json` but used nowhere in the codebase. The app is permanently dark (`className="dark"` on `<html>`). This can be removed.

---

## Architecture Patterns

### What Is Actually Implemented

```
src/
├── app/
│   ├── layout.tsx                    # Root layout — Geist fonts, Toaster, dark class
│   ├── page.tsx                      # Home (SC) — reads cookies, passes props to HomeClient
│   ├── home-client.tsx               # Home flow state machine (CC) — step progression
│   ├── globals.css                   # Tailwind v4 CSS-first config + keyframes
│   ├── actions/                      # Cross-route Server Actions
│   │   ├── admin-actions.ts          # deactivateUser, deactivateQrCode
│   │   ├── check-otp.ts              # OTP verification + cookie set
│   │   ├── create-public-qr.ts       # Public QR creation (admin bypass)
│   │   └── verify-phone.ts           # sendOtp, resendOtp
│   ├── admin/
│   │   ├── layout.tsx                # Admin layout — own auth guard (defense-in-depth)
│   │   ├── page.tsx                  # Admin user list (SC)
│   │   └── [userId]/page.tsx         # Admin user detail (SC)
│   ├── api/slug-check/route.ts       # GET — slug availability check
│   ├── auth/callback/route.ts        # OAuth callback + account linking
│   ├── dashboard/
│   │   ├── layout.tsx                # Dashboard layout — auth guard + sidebar
│   │   ├── page.tsx                  # QR list (SC) — fetches + builds QR images
│   │   ├── actions.ts                # signOut
│   │   └── qr-actions.ts            # createQrCode, updateQrCode, deleteQrCode
│   ├── login/
│   │   ├── page.tsx                  # Login page (SC)
│   │   └── actions.ts                # signInWithGoogle
│   └── q/[slug]/
│       ├── page.tsx                  # Scanner proxy (SC) — fetch + redirect + increment
│       ├── scanner-landing.tsx       # NOT USED (page.tsx redirects before render)
│       └── not-found.tsx             # Branded 404 (SC)
├── components/
│   ├── ui/                           # shadcn primitives (DO NOT EDIT)
│   ├── shared/                       # Cross-feature UI (empty-state, page-header, platform-badge, qr-pulse-wrapper)
│   ├── auth/google-sign-in-button    # Google OAuth trigger
│   ├── dashboard/                    # Dashboard-specific components (sidebar, qr-list, qr-list-row, etc.)
│   ├── qr-management/                # QR CRUD form, dialog, slug-input, platform-selector, delete-dialog
│   ├── public/                       # Public home flow components (phone-verify, otp, qr-type-grid, etc.)
│   ├── admin/                        # Admin tables (user-table, user-qr-table)
│   └── scanner/scanner-error.tsx    # Branded error page for 404/410
├── hooks/
│   ├── use-slug-check.ts             # Debounced slug availability with sync+async state
│   ├── use-qr-image.ts               # DEAD CODE — unused
│   └── use-copy-to-clipboard.ts      # Clipboard API with reset timer
├── lib/
│   ├── supabase/
│   │   ├── server.ts                 # createClient() — SSR cookie-based
│   │   ├── client.ts                 # createBrowserClient() — browser singleton
│   │   ├── admin.ts                  # createAdminClient() — service role, no cookies
│   │   └── middleware.ts             # (exists, referenced in middleware.ts)
│   ├── redirect.ts                   # buildPlatformUrl(), platformColor(), platformLabel()
│   ├── qr-generator.ts               # generateQrDataUrl(), downloadQrPng()
│   ├── twilio.ts                     # sendVerification(), checkVerification()
│   └── utils.ts                      # cn(), formatScanCount()
├── types/index.ts                    # Platform, QrCode, AppRole, Profile
└── middleware.ts                     # Protects /dashboard/* and /admin/*
```

**Note on `scanner-landing.tsx`:** The current `q/[slug]/page.tsx` always calls `redirect(platformUrl)` before returning, so `ScannerLanding` is never rendered by this page. The file exists but its `ScannerLanding` component renders a textarea+CTA. This may have been intended for a future "preview before redirect" UX or is legacy from an earlier design. Needs decision: keep as-is or remove if unused.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Reason |
|---------|-------------|-------------|--------|
| Slug availability debounce | Custom timer logic | Keep existing `useSlugCheck` (well-implemented) | Already correct |
| Class merging | String concat | `cn()` from `lib/utils.ts` | Already universal |
| Toast notifications | Custom portal | `sonner` via `toast.success/error` | Already in use |
| QR generation | Canvas drawing | `qrcode` npm package | Already in use |
| Auth cookie management | Manual cookie ops | `@supabase/ssr` `createServerClient` | Already in use |
| Form state management | Prop gymnastics | `useActionState` | Already in use |

---

## Common Pitfalls

### Pitfall 1: Hardcoded Hex Values Drift
**What goes wrong:** When brand colors change, engineers update `globals.css` tokens but the hardcoded hex values throughout components remain stale.
**Root cause:** Components were written during rapid development without referencing the token system.
**Prevention:** Always use `bg-surface-raised` not `bg-[#1E293B]`. The token names are defined in `globals.css @theme inline`.

### Pitfall 2: `createServerClient` Inline Duplication
**What goes wrong:** The inline `createServerClient` in `q/[slug]/page.tsx` for the admin check bypasses `createAdminClient()`, creating two different patterns for the same operation.
**Root cause:** The scanner page was written to avoid importing from `lib/supabase/admin.ts` directly (fear of bundle contamination), but this is unfounded — server-only code is tree-shaken.
**Prevention:** Always use the helper functions. `createAdminClient()` is server-only by convention.

### Pitfall 3: Dead Code Accumulating
**What goes wrong:** `use-qr-image.ts` and `next-themes` were added/created and never used. Over time these accumulate.
**Root cause:** Refactoring that moved code didn't clean up the old helpers.
**Prevention:** After refactors, verify old helpers have at least one import. Run `eslint --rule no-unused-vars`.

### Pitfall 4: Slug Check Checks Only Active Slugs
**What goes wrong:** `api/slug-check/route.ts` filters `.eq('is_active', true)`. A soft-deleted slug appears available, so a new user can claim it. When the old QR owner reactivates their code (if that feature is added), there's a collision.
**Root cause:** Logical oversight — the filter was copied from the scanner page pattern where checking only active slugs makes sense (for redirecting), but availability check has different semantics.
**Prevention:** Slug uniqueness is enforced at DB level (`UNIQUE` constraint), so a collision would fail at insert with error code `23505`. But the UX check should reflect the same constraint.

### Pitfall 5: Mixed Languages in UI Strings
**What goes wrong:** Portuguese toast messages (`'QR criado com sucesso'`) alongside English UI creates inconsistency.
**Root cause:** Likely copy-pasted or written quickly during a coding sprint.
**Prevention:** Keep all user-facing strings in one language consistently.

---

## Code Examples

### Correct Token Usage (Replace Hardcoded Hex With)

```tsx
// WRONG — hardcoded hex
<div className="bg-[#1E293B] border-[#334155]">

// CORRECT — design tokens
<div className="bg-surface-raised border-border">

// WRONG — brand color hardcoded
<button className="bg-[#6366F1] hover:bg-[#4F46E5]">

// CORRECT — design tokens
<button className="bg-brand-500 hover:bg-brand-600">

// WRONG — admin layout
<div className="min-h-screen bg-[#0F172A]">

// CORRECT
<div className="min-h-screen bg-surface">
```

### Fix for Scanner Page Admin Client

```tsx
// WRONG — inline createServerClient for admin check
const adminClient = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { cookies: { getAll() { return [] }, setAll() {} } }
)

// CORRECT — use the existing helper
import { createAdminClient } from '@/lib/supabase/admin'
const adminClient = createAdminClient()
```

### Correct Metadata with metadataBase

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fluxqr.app'),
  title: {
    default: 'FluxQR — Smart QR Links for Messaging',
    template: '%s — FluxQR',
  },
  description: 'Create QR codes that open WhatsApp and SMS with pre-filled messages.',
  openGraph: {
    siteName: 'FluxQR',
    type: 'website',
  },
}
```

### robots.ts

```ts
// src/app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/'],
    },
  }
}
```

### Error Boundary (dashboard)

```tsx
// src/app/dashboard/error.tsx
'use client'

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <button
        type="button"
        onClick={reset}
        className="bg-brand-500 hover:bg-brand-600 text-white rounded-md px-4 py-2 text-sm"
      >
        Try again
      </button>
    </div>
  )
}
```

### Fix Slug Check to Include Inactive Slugs

```ts
// src/app/api/slug-check/route.ts
// WRONG — only checks active slugs
const { data } = await supabase
  .from('qr_codes')
  .select('id')
  .eq('slug', slug)
  .eq('is_active', true)   // remove this line
  .single()

// CORRECT — checks all slugs (matches DB UNIQUE constraint semantics)
const { data } = await supabase
  .from('qr_codes')
  .select('id')
  .eq('slug', slug)
  .single()
```

---

## State of the Art

| Old Approach | Current Approach | Status in This Codebase |
|--------------|------------------|------------------------|
| Page Router | App Router | Correct — App Router in use |
| `getServerSideProps` | Server Components | Correct — no GSSP anywhere |
| `useState` for server mutations | `useActionState` | Correct — in use |
| `useEffect` for form response | `useActionState` state | Mostly correct; one `useRef` guard pattern in `qr-form.tsx` is slightly awkward but functional |
| Manual fetch in components | Server Component direct DB | Correct |
| `next/font/google` for Geist | `geist` npm package | Correct per project spec |
| `tailwind.config.ts` | CSS-first `@theme inline` | Correct — Tailwind v4 pattern |
| `metadata` object only | `metadataBase` + OG tags | GAP — needs addition |
| No robots.txt | `robots.ts` | GAP — needs creation |

---

## Prioritized Fix List (for Planner)

| Priority | Category | Files Affected | Commit Category |
|----------|----------|----------------|-----------------|
| 1 | Hardcoded tokens → design tokens | ~10 files | `refactor: replace hardcoded tokens with design tokens` |
| 2 | Dead code removal | `use-qr-image.ts`, `next-themes` dep | `fix: remove dead code and unused dependency` |
| 3 | Slug check bug | `api/slug-check/route.ts` | `fix: check all slugs not just active in slug availability API` |
| 4 | Scanner page admin client | `q/[slug]/page.tsx` | `refactor: use createAdminClient() in scanner page` |
| 5 | DeleteButton wrapper | `delete-button.tsx`, `qr-list-row.tsx` | `refactor: remove redundant DeleteButton wrapper component` |
| 6 | Toast language | `qr-form.tsx` | `fix: use English toast messages` |
| 7 | Metadata + robots.ts | `layout.tsx`, new files | `feat: add metadataBase, OG tags, robots.ts, sitemap.ts` |
| 8 | Error boundaries | new `error.tsx` files | `feat: add error boundaries for dashboard and admin routes` |
| 9 | dynamic imports in check-otp.ts | `check-otp.ts` | `refactor: convert dynamic imports to static` |
| 10 | cn() redundant usage | `page-header.tsx` | `fix: remove redundant cn() wrapper` |
| 11 | Defense-in-depth comments | `dashboard/layout.tsx`, `admin/layout.tsx` | `docs: document double auth guard pattern` |
| 12 | Codebase map rewrite | `.planning/codebase/*.md` | `docs: update codebase maps to reflect current implementation` |
| 13 | scanner-landing.tsx decision | `q/[slug]/scanner-landing.tsx` | Keep or remove — needs decision at implementation time |

---

## Open Questions

1. **`scanner-landing.tsx` status**
   - What we know: `q/[slug]/page.tsx` always calls `redirect()` before rendering `ScannerLanding`. The component exists but is never rendered by the current page.tsx.
   - What's unclear: Was it intentionally kept for a future "preview before redirect" step, or is it dead code?
   - Recommendation: The CONTEXT.md says no deferred ideas, so if there's no near-term plan for it, remove it. The scanner page already has a direct redirect model.

2. **`types/supabase.ts` — generate or not?**
   - What we know: The CLAUDE.md says `supabase gen types` should be run to generate it, but it was never run. The manual `types/index.ts` covers all current needs accurately.
   - What's unclear: Whether Supabase types would add value vs. the manual types.
   - Recommendation: Generating types during a code review phase risks instability (the generated file can be large and change format). Leave for a dedicated migration task.

3. **`loading.tsx` — add or not?**
   - What we know: No `loading.tsx` exists anywhere. The dashboard fetches are server-side and generally fast.
   - What's unclear: Whether users on slow connections experience a blank screen during navigation.
   - Recommendation: Add `loading.tsx` with skeleton placeholders to `dashboard/` as a quality improvement. Skip `admin/` (internal tool).

---

## Validation Architecture

> `workflow.nyquist_validation` key is absent from `.planning/config.json` — treating as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None (plain Node.js `assert` + `tsx` runner) |
| Config file | None — see `src/lib/__tests__/redirect.test.ts` for existing pattern |
| Quick run command | `npx tsx src/lib/__tests__/redirect.test.ts` |
| Full suite command | `npx tsx src/lib/__tests__/redirect.test.ts` |

### Phase Requirements → Test Map

This phase has no formal requirement IDs. The validation is structural:

| Check | Behavior | Type | Command |
|-------|----------|------|---------|
| Lint clean | Zero ESLint errors/warnings | static | `npm run lint` |
| TypeScript clean | Zero type errors | static | `npx tsc --noEmit` |
| Redirect tests pass | Platform URL generation correct | unit | `npx tsx src/lib/__tests__/redirect.test.ts` |
| Build succeeds | No build errors after refactors | build | `npm run build` |

### Wave 0 Gaps

None — existing test infrastructure (lint + tsc) covers the phase requirements. No new test files are needed for a code review/refactor phase.

---

## Sources

### Primary (HIGH confidence)
- Full read of all 70 source files in `/Users/enzo.figueiredo/www/fluxqr/src/`
- `package.json` — actual versions confirmed
- `globals.css` — all design tokens verified
- `eslint.config.mjs` — lint config confirmed

### Secondary (MEDIUM confidence)
- [Next.js Official Docs — generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js Official Docs — Error Handling](https://nextjs.org/docs/app/getting-started/error-handling)
- [Next.js Official Docs — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js Official Docs — not-found.js](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
- [Next.js Official Blog — Next.js 15 Release](https://nextjs.org/blog/next-15)

### Tertiary (LOW confidence — general patterns)
- [Next.js Best Practices 2025 — RaftLabs](https://www.raftlabs.com/blog/building-with-next-js-best-practices-and-benefits-for-performance-first-teams/)
- [Next.js SEO Best Practices 2025 — AverageDevs](https://www.averagedevs.com/blog/nextjs-seo-best-practices)

---

## Metadata

**Confidence breakdown:**
- Codebase findings (categories 1-14): HIGH — based on direct file reading
- Next.js best practices: HIGH — based on official docs
- SEO recommendations: MEDIUM — based on official docs + community sources
- Scanner bundle budget: NOT VERIFIED — `@next/bundle-analyzer` not run, but scanner page has zero 'use client' components and redirects immediately, so bundle is effectively zero

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable libraries, 30-day window)
