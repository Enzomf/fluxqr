# Architecture

**Analysis Date:** 2026-03-10

## Pattern Overview

**Overall:** Next.js App Router with Server-first Architecture

**Key Characteristics:**
- Server Components handle all data fetching and Supabase queries — Client Components are UI-only
- Server Actions replace REST endpoints for mutations (create, update, soft-delete)
- Supabase Row-Level Security enforces authorization at the database layer, not just application layer
- The scanner route (`/q/[slug]`) is a public, auth-free, minimal-JS proxy path isolated from the authenticated dashboard shell

## Layers

**Routing / Pages Layer:**
- Purpose: File-system routing, layout composition, page-level data fetching
- Location: `src/app/`
- Contains: `page.tsx` (Server Components), `layout.tsx` (shells), `actions.ts` (Server Actions), `route.ts` (API routes)
- Depends on: lib/supabase, components, types
- Used by: Next.js router

**Component Layer:**
- Purpose: Render UI; split between server-safe shared primitives and interactive client components
- Location: `src/components/`
- Contains: shadcn primitives (`ui/`), shared app components (`shared/`), feature-grouped components (`auth/`, `dashboard/`, `qr-management/`, `qr-generation/`, `scanner/`)
- Depends on: hooks, lib/utils
- Used by: pages and layouts

**Hooks Layer:**
- Purpose: Client-side stateful logic (slug availability check, QR image generation, clipboard)
- Location: `src/hooks/`
- Contains: `use-slug-check.ts`, `use-qr-image.ts`, `use-copy-to-clipboard.ts`
- Depends on: lib, browser APIs
- Used by: Client Components only

**Library Layer:**
- Purpose: Shared infrastructure — Supabase clients, URL builders, QR generation, class utilities
- Location: `src/lib/`
- Contains: `supabase/server.ts`, `supabase/client.ts`, `supabase/middleware.ts`, `redirect.ts`, `qr-generator.ts`, `utils.ts`
- Depends on: @supabase/supabase-js, qrcode
- Used by: pages, actions, middleware, hooks

**Types Layer:**
- Purpose: Shared TypeScript types across the entire app
- Location: `src/types/`
- Contains: `supabase.ts` (auto-generated DB types), `index.ts` (app-level types: `Platform`, `QrCode`)
- Depends on: nothing
- Used by: all other layers

**Middleware Layer:**
- Purpose: Route protection — redirects unauthenticated users away from `/dashboard/*`
- Location: `src/middleware.ts`
- Contains: Supabase session refresh + auth guard
- Depends on: `lib/supabase/middleware.ts`
- Used by: Next.js edge runtime on every request

## Data Flow

**Authenticated Dashboard (Read):**

1. User hits `/dashboard` — middleware validates session via `lib/supabase/middleware.ts`
2. `app/dashboard/page.tsx` (Server Component) calls Supabase server client from `lib/supabase/server.ts`
3. Supabase RLS filters rows to `auth.uid() = user_id` automatically
4. Data passed as props to `components/dashboard/qr-list.tsx`
5. Client renders — no client-side data fetching

**QR Creation (Mutation):**

1. User submits form in `components/qr-management/qr-form.tsx` (Client Component)
2. Form calls Server Action from `app/dashboard/new/actions.ts`
3. Server Action validates input (Zod), calls Supabase server client, inserts row
4. RLS verifies `auth.uid()` matches `user_id` on insert
5. Server Action redirects to `/dashboard` on success

**Scanner Proxy (Public):**

1. Mobile user scans QR code — hits `/q/[slug]`
2. `app/q/[slug]/page.tsx` (Server Component) fetches QR record via Supabase anon key
3. Calls `increment_scan_count(qr_slug)` RPC (SECURITY DEFINER — no auth required)
4. Builds redirect URL via `lib/redirect.ts` `buildPlatformUrl()`
5. Returns HTTP redirect OR renders `scanner-landing.tsx` for Telegram fallback

**State Management:**
- No global state manager. Server Components own data. URL params drive navigation state. Client Components use local `useState`/`useReducer` and custom hooks.

## Key Abstractions

**Supabase Clients (server vs client):**
- Purpose: Separate clients for server-side (cookie-based session) and client-side (browser) usage
- Examples: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`
- Pattern: `createServerClient` (SSR) from `@supabase/ssr` for Server Components and Actions; `createBrowserClient` for hooks

**Server Actions:**
- Purpose: Type-safe, co-located mutation handlers that run on the server
- Examples: `src/app/dashboard/actions.ts`, `src/app/dashboard/new/actions.ts`, `src/app/dashboard/[id]/edit/actions.ts`
- Pattern: `'use server'` directive at top, Zod validation, Supabase server client, `revalidatePath` or `redirect` on completion

**Platform URL Builder:**
- Purpose: Constructs deep-link URLs for WhatsApp, SMS, Telegram from QR data
- Examples: `src/lib/redirect.ts` — `buildPlatformUrl(platform, contactTarget, defaultMessage)`
- Pattern: Pure function, no side effects, called in scanner proxy page

**QR Generator:**
- Purpose: Converts a URL string into a PNG data URL for download and display
- Examples: `src/lib/qr-generator.ts` — `generateQrDataUrl()`, `downloadQrPng()`
- Pattern: Wraps `qrcode` library; used by `use-qr-image.ts` hook client-side

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page render
- Responsibilities: HTML shell, Geist font variables, global CSS

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: Every request matching `/dashboard/*`
- Responsibilities: Session refresh, unauthenticated redirect to `/login`

**Dashboard Layout:**
- Location: `src/app/dashboard/layout.tsx`
- Triggers: Any `/dashboard/*` route render
- Responsibilities: Sidebar shell, authenticated user context

**Scanner Page:**
- Location: `src/app/q/[slug]/page.tsx`
- Triggers: QR code scan (unauthenticated GET)
- Responsibilities: Fetch QR record, increment scan count, redirect to platform URL

**Auth Callback:**
- Location: `src/app/auth/callback/route.ts`
- Triggers: Google OAuth redirect
- Responsibilities: Exchange code for session, redirect to dashboard

**Slug Check API:**
- Location: `src/app/api/slug-check/route.ts`
- Triggers: Client-side slug availability check during QR creation form
- Responsibilities: Returns availability boolean for a given slug

## Error Handling

**Strategy:** Next.js built-in error boundaries + dedicated not-found pages

**Patterns:**
- `src/app/q/[slug]/not-found.tsx` — renders when slug does not exist in DB
- Server Actions return typed error objects or throw, caught by Client Component state
- Middleware redirects on session failure rather than exposing protected pages

## Cross-Cutting Concerns

**Logging:** None (MVP) — relies on Vercel function logs
**Validation:** Zod in Server Actions for all mutation inputs
**Authentication:** Supabase Auth via `@supabase/ssr` cookie strategy; enforced at middleware + RLS layers simultaneously

---

*Architecture analysis: 2026-03-10*
