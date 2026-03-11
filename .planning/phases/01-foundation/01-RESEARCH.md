# Phase 1: Foundation - Research

**Researched:** 2026-03-10
**Domain:** Next.js 16 App Router + Supabase SSR Auth + Tailwind v4 + shadcn/ui
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Login page branding:**
- Text wordmark only — "FluxQR" in brand-500 indigo, bold, no icon
- Tagline: "Smart links for instant messaging" below the wordmark in slate-400
- Card style: brand-glow shadow around card — subtle premium feel
- Nothing below the Google sign-in button — clean card, no footer links
- Layout A: centered card on dark bg-surface canvas

**Sidebar navigation:**
- Single nav link: "My QR Codes" — no "New QR Code" link in sidebar
- "Create new" action lives inside the dashboard page instead (e.g., button in page header)
- FluxQR text wordmark at top of sidebar, same indigo brand style as login
- Bottom: Google avatar + truncated email + sign-out button, separated by divider
- Mobile: hamburger icon top-left fixed position, Sheet opens from left
- Active link: brand highlight with left border accent per BACKLOG spec

### Claude's Discretion
- Exact shadcn CSS variable values (follow BACKLOG spec as baseline, adjust if needed)
- Database migration approach (local vs remote)
- Exact mobile breakpoint for sidebar collapse (md: 768px is standard)
- Loading states and skeleton patterns during auth flow
- Exact border opacity and glow intensity fine-tuning

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUN-01 | App renders with Geist font, dark surface background, and brand indigo tokens | Geist npm package + Tailwind v4 @theme directive pattern |
| FOUN-02 | shadcn/ui components inherit dark color scheme without manual overrides | shadcn CSS variables + @theme inline in globals.css |
| FOUN-03 | `cn()` utility available for conditional class merging | clsx + tailwind-merge combo pattern |
| FOUN-04 | `Platform` and `QrCode` TypeScript types defined and shared across app | `src/types/index.ts` creation |
| DB-01 | `qr_codes` table with all required columns | PostgreSQL migration + Supabase CLI |
| DB-02 | RLS policies: owners have full CRUD, unauthenticated can SELECT active | Supabase RLS syntax documented |
| DB-03 | `increment_scan_count(qr_slug)` RPC — atomic, SECURITY DEFINER | PostgreSQL SECURITY DEFINER function pattern |
| DB-04 | Partial index on `(slug) WHERE is_active = true` for proxy lookup | PostgreSQL partial index syntax |
| DB-05 | `update_updated_at()` trigger on every UPDATE | PostgreSQL trigger pattern |
| AUTH-01 | User can sign in with Google OAuth | `@supabase/ssr` + signInWithOAuth pattern |
| AUTH-02 | Unauthenticated visits to `/dashboard/*` redirect to `/login` | proxy.ts (Next.js 16) with getClaims() |
| AUTH-03 | OAuth callback exchanges code for session, redirects to `/dashboard` | `app/auth/callback/route.ts` exchangeCodeForSession |
| AUTH-04 | User can sign out from sidebar, session cleared, redirected to `/login` | Server Action + supabase.auth.signOut() |
| SHELL-01 | Authenticated users see sidebar with logo, nav links, avatar, and sign out | Server Component layout + Client Component sidebar |
| SHELL-02 | On mobile, sidebar opens as Sheet drawer via menu icon | shadcn Sheet component pattern |
| SHELL-03 | Active nav link shows brand highlight with left border accent | usePathname() + conditional className |
</phase_requirements>

---

## Summary

This phase scaffolds a Next.js 16 project from a bare CNA bootstrap into a fully configured app shell. The project currently has no `src/` directory, no Supabase packages, no shadcn/ui, and uses `next/font/google` for Geist instead of the `geist` npm package. Phase 1 must migrate the project to the `src/` structure, install and configure the full dependency set, set up the Supabase database schema with RLS, wire Google OAuth authentication, and build the sidebar app shell.

**Critical discovery:** The project runs **Next.js 16.1.6**, not 15. In Next.js 16, `middleware.ts` is deprecated and renamed to `proxy.ts`. The exported function must be named `proxy`, not `middleware`. Additionally, Supabase has replaced `NEXT_PUBLIC_SUPABASE_ANON_KEY` with `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for new projects (though both work during transition). The BACKLOG.MD spec uses the older anon key name; this project should use whichever key was set during project creation (the env var approach in CLAUDE.md uses ANON_KEY — follow that).

**Primary recommendation:** Use `proxy.ts` (not `middleware.ts`) for route protection in Next.js 16. Use `@supabase/ssr` with `createServerClient` + `getAll`/`setAll` cookie methods exclusively. Define Tailwind v4 design tokens via `@theme inline` in `globals.css` instead of `tailwind.config.ts`. Run `pnpm dlx shadcn@latest init -t next` which detects Tailwind v4 automatically.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 (installed) | App Router framework | Already installed; v16 is current |
| react / react-dom | 19.2.3 (installed) | UI runtime | Already installed |
| @supabase/supabase-js | ^2 | Supabase client | Required for DB + Auth |
| @supabase/ssr | ^0.6 | Cookie-based SSR auth | Official SSR package; auth-helpers deprecated |
| geist | ^1 | Geist font npm package | Required for `geist/font/sans` imports per BACKLOG |
| tailwindcss | ^4 (installed) | Utility CSS | Already installed |
| shadcn/ui | (CLI) | Component primitives | Already in stack per CLAUDE.md |
| clsx | ^2 | Conditional classes | shadcn/ui installs this automatically |
| tailwind-merge | ^2 | Class deduplication | shadcn/ui installs this automatically |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.400+ | Icon set | shadcn/ui uses it; Menu, Check, X icons needed this phase |
| zod | ^3 | Runtime validation | Needed by server actions (Phase 3); install now |
| @types/node | ^20 (installed) | Node.js types | Already present |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| geist npm package | next/font/google | Existing code uses google import; BACKLOG requires npm package for `GeistSans.variable` pattern |
| proxy.ts (Next.js 16) | middleware.ts | middleware.ts still works but is deprecated; use proxy.ts for future compatibility |
| @supabase/ssr | @supabase/auth-helpers-nextjs | auth-helpers is deprecated; ssr is the official replacement |
| @theme inline (globals.css) | tailwind.config.ts | Tailwind v4 uses CSS-first config; no tailwind.config.ts needed |

**Installation:**
```bash
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add geist
pnpm add zod
pnpm dlx shadcn@latest init -t next
pnpm dlx shadcn@latest add button input textarea badge dialog sheet separator tooltip skeleton avatar sonner
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout: Geist font + dark class + Toaster
│   ├── globals.css             # @import tailwindcss + @theme inline tokens
│   ├── auth/callback/route.ts  # OAuth code exchange → /dashboard
│   ├── login/
│   │   ├── page.tsx            # Centered card layout
│   │   └── actions.ts          # signInWithGoogle() server action
│   └── dashboard/
│       ├── layout.tsx          # Server: auth check + renders Sidebar
│       ├── page.tsx            # QR list placeholder (Phase 3)
│       └── actions.ts          # signOut() server action
├── components/
│   ├── ui/                     # shadcn primitives — do NOT edit
│   ├── auth/
│   │   └── google-sign-in-button.tsx
│   └── dashboard/
│       ├── sidebar.tsx         # Client Component: desktop aside + mobile Sheet
│       └── sidebar-link.tsx    # Client: usePathname() active state
├── lib/
│   ├── supabase/
│   │   ├── server.ts           # createServerClient with cookies
│   │   ├── client.ts           # createBrowserClient
│   │   └── middleware.ts       # updateSession helper for proxy.ts
│   └── utils.ts                # cn() + formatScanCount()
├── types/
│   ├── supabase.ts             # supabase gen types output
│   └── index.ts                # Platform, QrCode types
└── proxy.ts                    # Next.js 16 route protection (replaces middleware.ts)
```

### Pattern 1: Tailwind v4 Token Definition via @theme inline

**What:** Design tokens defined as CSS custom properties inside `@theme inline`, which auto-generates Tailwind utility classes.
**When to use:** All custom colors, shadows, and keyframes for this project.

```css
/* src/app/globals.css */
/* Source: https://ui.shadcn.com/docs/tailwind-v4 */
@import "tailwindcss";

/* shadcn CSS variable reset — always dark */
:root {
  --background:       hsl(215 28% 9%);    /* #0F172A surface */
  --foreground:       hsl(210 40% 98%);   /* slate-50 */
  --card:             hsl(215 25% 15%);   /* #1E293B surface-raised */
  --card-foreground:  hsl(210 40% 98%);
  --border:           hsl(0 0% 100% / 0.08);
  --input:            hsl(215 25% 15%);
  --ring:             hsl(239 84% 67%);   /* brand-500 */
  --primary:          hsl(239 84% 67%);
  --primary-foreground: hsl(0 0% 100%);
  --destructive:      hsl(351 96% 60%);   /* danger */
  --muted:            hsl(215 20% 27%);   /* surface-overlay */
  --muted-foreground: hsl(215 20% 65%);   /* slate-400 */
  --radius:           0.375rem;
}

@theme inline {
  /* shadcn bridge variables */
  --color-background:      var(--background);
  --color-foreground:      var(--foreground);
  --color-card:            var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-border:          var(--border);
  --color-input:           var(--input);
  --color-ring:            var(--ring);
  --color-primary:         var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-destructive:     var(--destructive);
  --color-muted:           var(--muted);
  --color-muted-foreground: var(--muted-foreground);

  /* FluxQR brand tokens */
  --color-brand-400: #818CF8;
  --color-brand-500: #6366F1;
  --color-brand-600: #4F46E5;
  --color-brand-700: #4338CA;
  --color-surface:   #0F172A;
  --color-surface-raised:   #1E293B;
  --color-surface-overlay:  #334155;
  --color-success:   #10B981;
  --color-danger:    #F43F5E;
  --color-warning:   #F59E0B;

  /* Shadows */
  --shadow-brand-glow:   0 0 20px -5px rgba(99,102,241,0.4);
  --shadow-success-glow: 0 0 12px -3px rgba(16,185,129,0.3);
  --shadow-surface-1:    0 1px 2px 0 rgba(0,0,0,0.3);
  --shadow-surface-2:    0 4px 6px -1px rgba(0,0,0,0.4);

  /* Keyframes */
  --animate-qr-pulse: qr-pulse 0.6s ease-out;
  --animate-slide-up: slide-up 0.2s ease-out;

  /* Fonts */
  --font-sans: var(--font-geist-sans), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), monospace;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
}

@keyframes qr-pulse {
  0%:   { box-shadow: 0 0 0 0px rgba(16,185,129,0.5); }
  100%: { box-shadow: 0 0 0 14px rgba(16,185,129,0); }
}

@keyframes slide-up {
  0%:   { opacity: 0; transform: translateY(8px); }
  100%: { opacity: 1; transform: translateY(0); }
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

### Pattern 2: Geist Font with npm Package

**What:** Import Geist from `geist/font/sans` and `geist/font/mono` instead of `next/font/google`.
**When to use:** Required — BACKLOG spec mandates the npm package import style.

```tsx
// src/app/layout.tsx
// Source: https://vercel.com/font
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="bg-surface text-slate-200 font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

**Important:** The `dark` class on `<html>` permanently locks dark mode — shadcn/ui respects this without a theme toggle.

### Pattern 3: Supabase SSR Clients

**What:** Three files for Supabase access across server, client, and proxy contexts.
**When to use:** All Supabase access must go through one of these; never import supabase-js directly.

```typescript
// src/lib/supabase/server.ts
// Source: https://supabase.com/docs/guides/auth/server-side/creating-a-client
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — middleware handles refresh
          }
        },
      },
    }
  )
}
```

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Pattern 4: Next.js 16 proxy.ts for Route Protection

**What:** In Next.js 16, `middleware.ts` is deprecated. Use `proxy.ts` at project root with the function exported as `proxy`.
**When to use:** Session refresh + `/dashboard/*` redirect guard.

```typescript
// src/proxy.ts  (NOT middleware.ts)
// Source: https://nextjs.org/docs/app/guides/upgrading/version-16
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Use getClaims() in Next.js 16 — faster (local JWT verification vs network call)
  const { data: { claims } } = await supabase.auth.getClaims()

  if (
    !claims &&
    request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Pattern 5: OAuth Callback Route

**What:** Exchanges the OAuth `code` for a session and redirects to `/dashboard`.

```typescript
// src/app/auth/callback/route.ts
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
```

### Pattern 6: Sidebar with Sheet Mobile Drawer

**What:** Single nav JSX shared between desktop `<aside>` and mobile shadcn `<Sheet>`, using `usePathname()` for active state.
**When to use:** SHELL-01, SHELL-02, SHELL-03.

```tsx
// src/components/dashboard/sidebar.tsx — Client Component
'use client'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { SidebarLink } from './sidebar-link'

const navItems = [
  { href: '/dashboard', label: 'My QR Codes' },
]

function SidebarNav({ user }: { user: { email: string; avatar_url?: string } }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4">
        <span className="text-brand-500 font-bold text-xl">FluxQR</span>
      </div>
      {/* Nav */}
      <nav className="flex-1 px-2">
        {navItems.map(item => (
          <SidebarLink key={item.href} href={item.href} label={item.label} />
        ))}
      </nav>
      {/* User area */}
      {/* avatar + email + sign out button */}
    </div>
  )
}
```

### Pattern 7: Database Migration

**What:** SQL migration file applied via Supabase CLI.

```sql
-- supabase/migrations/0001_create_qr_codes.sql
CREATE TABLE public.qr_codes (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug            text NOT NULL UNIQUE,
  label           text NOT NULL,
  platform        text NOT NULL CHECK (platform IN ('whatsapp', 'sms', 'telegram')),
  contact_target  text NOT NULL,
  default_message text,
  is_active       boolean NOT NULL DEFAULT true,
  scan_count      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Partial index for proxy lookup (hot path)
CREATE INDEX idx_qr_codes_slug_active ON public.qr_codes (slug) WHERE is_active = true;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER qr_codes_updated_at
  BEFORE UPDATE ON public.qr_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Owner policies
CREATE POLICY "owners_select" ON public.qr_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "owners_insert" ON public.qr_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owners_update" ON public.qr_codes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owners_delete" ON public.qr_codes
  FOR DELETE USING (auth.uid() = user_id);

-- Public SELECT for active codes (scanner proxy)
CREATE POLICY "public_select_active" ON public.qr_codes
  FOR SELECT USING (is_active = true);

-- Atomic scan count RPC
CREATE OR REPLACE FUNCTION public.increment_scan_count(qr_slug text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.qr_codes
  SET scan_count = scan_count + 1
  WHERE slug = qr_slug AND is_active = true;
END;
$$;
```

### Anti-Patterns to Avoid

- **Using `middleware.ts` in Next.js 16:** The file still works but is deprecated. Use `proxy.ts` and export `proxy` as the function name.
- **Using individual cookie methods:** `get()`, `set()`, `remove()` on the Supabase client break SSR. Only use `getAll()` and `setAll()`.
- **Using `getSession()` in server code:** Not reliable; can be spoofed. Use `getClaims()` (proxy) or `getUser()` (server components) instead.
- **Using `@supabase/auth-helpers-nextjs`:** Deprecated. Only `@supabase/ssr`.
- **Importing from `next/font/google` for Geist:** Existing layout uses this; must migrate to `geist/font/sans`.
- **Editing files in `components/ui/`:** shadcn primitives — never hand-edit; run `pnpm dlx shadcn@latest add` to update.
- **Creating `tailwind.config.ts`:** Tailwind v4 uses CSS-first config via `globals.css`. Do not create a config file.
- **Placing `proxy.ts` outside `src/`:** Since the project uses `src/`, place it at `src/proxy.ts`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS class merging | Custom merge logic | `cn()` = `clsx` + `tailwind-merge` | Handles Tailwind class conflicts automatically |
| Cookie-based auth sessions | Custom session management | `@supabase/ssr` createServerClient | Auth token refresh, cookie sync, edge cases |
| OAuth flow | Custom OAuth callbacks | Supabase `signInWithOAuth` + `exchangeCodeForSession` | PKCE flow, security, token management |
| Mobile drawer | Custom slide-out panel | shadcn `Sheet` | Accessibility (focus trap, escape key, aria) |
| Active link detection | URL string matching | `usePathname()` from `next/navigation` | Handles query strings, dynamic segments |
| Atomic DB counters | Application-level counter | PostgreSQL `UPDATE ... SET count = count + 1` via SECURITY DEFINER RPC | Race condition prevention |
| TypeScript DB types | Manually written interfaces | `supabase gen types typescript` | Auto-generated from actual schema; stays in sync |

**Key insight:** Every "simple" problem above (especially auth sessions and CSS merging) has at least 5 edge cases that destroy custom implementations.

## Common Pitfalls

### Pitfall 1: proxy.ts vs middleware.ts Confusion
**What goes wrong:** Creating `middleware.ts` works in Next.js 16 but emits deprecation warnings; the function name `middleware` is also deprecated.
**Why it happens:** Most tutorials still document `middleware.ts` because Next.js 16 docs are newer than most guides.
**How to avoid:** Create `src/proxy.ts` with `export async function proxy(...)`.
**Warning signs:** Build warnings about deprecated middleware convention.

### Pitfall 2: Supabase Cookies Using Individual Methods
**What goes wrong:** Using `.set()`, `.get()`, or `.remove()` on cookies causes silent auth failures in production.
**Why it happens:** Old tutorials use the auth-helpers pattern which had these methods.
**How to avoid:** Only use `getAll()` and `setAll()` as shown in Pattern 3.
**Warning signs:** Auth works in dev but fails in production, or session lost after refresh.

### Pitfall 3: Skipping the proxy.ts Cookie Double-Write
**What goes wrong:** Missing the `request.cookies.set` step inside `setAll` in proxy.ts causes Server Components to not see the refreshed token.
**Why it happens:** The proxy must write cookies to both the request (for downstream Server Components) and the response (for the browser).
**How to avoid:** Follow Pattern 4 exactly — set on both `request.cookies` and `supabaseResponse.cookies`.
**Warning signs:** Infinite redirect loops on `/dashboard`, or user appears logged out immediately after login.

### Pitfall 4: src/ Migration Breaking @/* Alias
**What goes wrong:** Moving `app/` to `src/app/` breaks `@/*` imports if `tsconfig.json` paths aren't updated.
**Why it happens:** Current tsconfig has `"@/*": ["./*"]` which resolves from project root, not `src/`.
**How to avoid:** Update `tsconfig.json` to `"@/*": ["./src/*"]` and add `baseUrl: "."` when migrating.
**Warning signs:** TypeScript errors on `@/` imports after migration.

### Pitfall 5: Tailwind v4 Utility Class Name Changes
**What goes wrong:** Custom colors defined as `--color-brand-500` generate utilities like `bg-brand-500` automatically — but only if defined under `@theme inline`. Colors defined only in `:root` as raw CSS vars do NOT auto-generate utilities.
**Why it happens:** Tailwind v4's CSS-first model requires explicit `@theme` registration for auto-generated utilities.
**How to avoid:** All FluxQR tokens go inside `@theme inline { }`, not just in `:root`.
**Warning signs:** `bg-brand-500` has no effect; no class generated.

### Pitfall 6: shadcn init Overwriting globals.css
**What goes wrong:** Running `pnpm dlx shadcn@latest init` after manually setting up globals.css can overwrite custom token definitions.
**Why it happens:** shadcn init creates its own globals.css.
**How to avoid:** Run shadcn init FIRST (creates the base), then apply FluxQR token overrides on top.
**Warning signs:** Brand colors disappear after shadcn init.

### Pitfall 7: RLS "public_select_active" Policy Conflicts with Owner Select
**What goes wrong:** With two SELECT policies (owner + public), the public policy may allow unauthenticated users to see ALL columns of active codes for ANY user.
**Why it happens:** Postgres RLS policies use OR logic by default — if either policy passes, the row is visible.
**How to avoid:** The public SELECT is intentional (scanner proxy needs it). Sensitive columns (user_id, contact details) should be acceptable to expose since scanning is the product. Document this decision explicitly.
**Warning signs:** Not a bug — but a design decision to confirm.

### Pitfall 8: Google OAuth Callback URL Mismatch
**What goes wrong:** OAuth fails with "redirect_uri_mismatch" in production.
**Why it happens:** The callback URL registered in Google Cloud Console doesn't match `NEXT_PUBLIC_SITE_URL/auth/callback`.
**How to avoid:** Register `http://localhost:3000/auth/callback` for local dev AND `https://yourdomain.com/auth/callback` for production in both Google Cloud Console and Supabase Auth settings.
**Warning signs:** OAuth error page after Google login.

## Code Examples

Verified patterns from official sources:

### Server Action for Sign In
```typescript
// src/app/login/actions.ts
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  if (data.url) redirect(data.url)
}
```

### Server Action for Sign Out
```typescript
// src/app/dashboard/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

### Dashboard Layout Auth Check
```tsx
// src/app/dashboard/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 p-6 md:ml-56">{children}</main>
    </div>
  )
}
```

### Active Sidebar Link
```tsx
// src/components/dashboard/sidebar-link.tsx
// Source: Next.js usePathname() docs
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function SidebarLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center px-3 py-2 rounded-md text-sm transition-colors',
        isActive
          ? 'bg-brand-500/10 text-brand-400 border-l-2 border-brand-500'
          : 'text-slate-400 hover:text-slate-200 hover:bg-surface-raised'
      )}
    >
      {label}
    </Link>
  )
}
```

### cn() Utility
```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScanCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString()
}
```

### TypeScript Types
```typescript
// src/types/index.ts
export type Platform = 'whatsapp' | 'sms' | 'telegram'

export type QrCode = {
  id: string
  user_id: string
  slug: string
  label: string
  platform: Platform
  contact_target: string
  default_message: string | null
  is_active: boolean
  scan_count: number
  created_at: string
  updated_at: string
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` + `export function middleware` | `proxy.ts` + `export function proxy` | Next.js 16 (2025) | Must use new filename; old still works but deprecated |
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2023-2024 | auth-helpers no longer maintained |
| `getSession()` in server code | `getClaims()` (proxy) / `getUser()` (server) | 2024-2025 | Security: getSession() can be spoofed |
| `tailwind.config.ts` color extensions | `@theme inline` in `globals.css` | Tailwind v4 (2025) | No config file needed; CSS-first |
| HSL CSS variables | OKLCH or `hsl()` wrapped variables | shadcn/ui Tailwind v4 | shadcn now uses OKLCH; custom vars can use either |
| `next/font/google` for Geist | `geist/font/sans` npm package | Vercel Geist v1 | Local serving, no network request at build time |
| `tailwindcss-animate` | `tw-animate-css` | shadcn/ui Tailwind v4 | Used by shadcn's new-york style |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Nov 2025 | Old projects still use ANON_KEY; CLAUDE.md uses ANON_KEY — follow CLAUDE.md |

**Deprecated/outdated:**
- `middleware.ts` function export `middleware`: deprecated in Next.js 16, use `proxy.ts` + `proxy` function
- `@supabase/auth-helpers-nextjs`: fully deprecated, do not install
- `supabase.auth.getSession()` in server code: unreliable, use `getClaims()` or `getUser()`
- `tailwind.config.ts` for v4 projects: no longer needed; tokens go in `globals.css`

## Open Questions

1. **NEXT_PUBLIC_SUPABASE_ANON_KEY vs PUBLISHABLE_KEY**
   - What we know: CLAUDE.md specifies `NEXT_PUBLIC_SUPABASE_ANON_KEY`; Supabase new projects (post Nov 2025) use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - What's unclear: Which key the user's existing Supabase project uses
   - Recommendation: Follow CLAUDE.md convention (`ANON_KEY`) in all code samples. If the project was created after Nov 2025, the user should substitute `PUBLISHABLE_KEY`. Either env var name works with `@supabase/ssr`.

2. **Local vs Remote Supabase Database Setup**
   - What we know: CONTEXT.md marks "Database migration approach" as Claude's discretion
   - What's unclear: Whether the user has Supabase CLI and a local stack, or only a remote project
   - Recommendation: Write migration as a SQL file in `supabase/migrations/`. Apply with `supabase db push` (remote) or `supabase db reset` (local). Include both commands in task instructions.

3. **getClaims() availability in @supabase/ssr**
   - What we know: Supabase documentation mentions `getClaims()` as the preferred method; some 2025 docs still show `getUser()` in proxy examples
   - What's unclear: Whether the current `@supabase/ssr` version in the npm registry exports `getClaims()`
   - Recommendation: Default to `getUser()` in proxy.ts for maximum compatibility. Note that `getClaims()` is preferred for performance if available. The plan should specify: use `getClaims()` if available in installed version, otherwise fall back to `getUser()`.

4. **tsconfig.json path alias migration**
   - What we know: Current tsconfig has `"@/*": ["./*"]` (resolves from root); target structure is `src/`
   - What's unclear: Whether Next.js 16 auto-detects `src/` and adjusts path resolution
   - Recommendation: Update tsconfig to `"@/*": ["./src/*"]` when migrating to `src/` directory structure.

## Sources

### Primary (HIGH confidence)
- [Next.js v16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) — proxy.ts vs middleware.ts, async params, breaking changes
- [Supabase SSR: Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) — createServerClient, proxy patterns, getClaims
- [Supabase SSR: Creating a client](https://supabase.com/docs/guides/auth/server-side/creating-a-client) — server.ts, client.ts cookie patterns
- [shadcn/ui Tailwind v4 guide](https://ui.shadcn.com/docs/tailwind-v4) — @theme inline, OKLCH, breaking changes
- [shadcn/ui Next.js installation](https://ui.shadcn.com/docs/installation/next) — `pnpm dlx shadcn@latest init -t next`
- [Vercel Geist Font](https://vercel.com/font) — `geist/font/sans` import pattern
- [Supabase AI Prompt: Next.js v16 Auth](https://supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth) — complete file structure

### Secondary (MEDIUM confidence)
- [Supabase getClaims() reference](https://supabase.com/docs/reference/javascript/auth-getclaims) — performance advantage over getUser()
- [Supabase API Keys: Publishable vs Anon](https://supabase.com/docs/guides/api/api-keys) — key naming transition
- Next.js 16 codemod documentation — middleware→proxy rename confirmed

### Tertiary (LOW confidence)
- Community articles on shadcn+Tailwind v4 setup — corroborated by official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — package.json confirms Next.js 16.1.6; official docs confirm all library choices
- Architecture: HIGH — directory structure matches CLAUDE.md spec; all file locations confirmed
- Pitfalls: HIGH — proxy.ts vs middleware.ts confirmed by official Next.js 16 upgrade guide; Supabase cookie patterns confirmed by official SSR docs
- Database SQL: MEDIUM — SQL is standard PostgreSQL/Supabase pattern; exact syntax confirmed by Supabase docs examples

**Research date:** 2026-03-10
**Valid until:** 2026-06-10 (90 days — Next.js and Supabase move fast, verify proxy.ts adoption if planning later)
