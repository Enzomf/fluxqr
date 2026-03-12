# Phase 4: Production - Research

**Researched:** 2026-03-12
**Domain:** Vercel deployment, Next.js App Router error pages, Google OAuth production configuration, environment variables
**Confidence:** HIGH

## Summary

Phase 4 is a pure deployment and polish phase — no new product features. The five requirements split into two work streams: (1) infrastructure (PROD-03, PROD-04, PROD-05) which is Vercel env var configuration and Google Cloud Console OAuth callback registration, and (2) UI polish (PROD-01, PROD-02) which is upgrading the two minimal placeholder error pages into fully-branded, sidebar-free experiences.

The infrastructure stream has zero code changes in the repository — it is entirely configuration in external dashboards (Vercel UI, Supabase dashboard, Google Cloud Console). The UI stream is small: the two existing inline error renders in `src/app/q/[slug]/page.tsx` (the "deactivated" case) and `src/app/q/[slug]/not-found.tsx` need branding upgrades. No new dependencies are required.

**Primary recommendation:** Treat PROD-01 and PROD-02 as one component task (extract both error states into a shared `ScannerError` component in `components/scanner/`), and PROD-03/PROD-04/PROD-05 as a single infrastructure checklist task with no code changes.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROD-01 | Branded not-found page for missing slugs (no sidebar, minimal JS) | Next.js App Router `not-found.tsx` co-located in `src/app/q/[slug]/` — already exists but is a plain placeholder; needs brand tokens and FluxQR identity |
| PROD-02 | Branded inactive page for deactivated slugs | Currently inline JSX in `src/app/q/[slug]/page.tsx` — needs same branded treatment as PROD-01; can share a component |
| PROD-03 | App deployed on Vercel with all env vars configured | Four env vars identified in CLAUDE.md: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`. Vercel dashboard → Settings → Environment Variables |
| PROD-04 | Google OAuth callback URL updated for production domain | In Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs: add `https://{prod-domain}/auth/callback`. Also add production `Site URL` in Supabase Auth → URL Configuration |
| PROD-05 | QR images generate URLs using production domain, not localhost | `generateQrDataUrl()` in `src/lib/qr-generator.ts` already reads `process.env.NEXT_PUBLIC_SITE_URL` — fix is setting this env var to the production domain in Vercel |
</phase_requirements>

---

## Standard Stack

### Core (all already in the project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router, `not-found.tsx` convention | Already in use |
| Tailwind CSS | v4 | Brand tokens for error page styling | Already in use; CSS-first config |
| Vercel | — | Hosting + env var management | Declared deploy target in CLAUDE.md |
| Supabase Auth | via `@supabase/ssr` ^0.9.0 | OAuth provider configuration | Already in use |

### No New Dependencies Required
This phase requires zero `npm install` / `pnpm add` operations.

---

## Architecture Patterns

### Recommended Project Structure Impact
No new directories. One new component file:
```
src/
├── app/
│   └── q/[slug]/
│       ├── not-found.tsx          # UPGRADE: add branding (PROD-01)
│       └── page.tsx               # EXTRACT: deactivated inline JSX → shared component (PROD-02)
└── components/
    └── scanner/
        └── scanner-error.tsx      # NEW: shared branded error component
```

### Pattern 1: Next.js App Router Co-located `not-found.tsx`
**What:** A file named `not-found.tsx` co-located inside a route segment is automatically shown when `notFound()` is called within that segment. It does not inherit the segment's `layout.tsx`, so it has no sidebar by default.
**When to use:** Scanner slug not found in database — `notFound()` is already called in `page.tsx` line 56.
**Example:**
```tsx
// src/app/q/[slug]/not-found.tsx
// No 'use client' directive — pure Server Component, minimal JS
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-surface-raised rounded-lg p-8 w-full max-w-sm text-center space-y-3">
        <span className="text-4xl" aria-hidden="true">404</span>
        <h1 className="text-foreground font-semibold text-lg">Link not found</h1>
        <p className="text-muted-foreground text-sm">
          This QR code link doesn&apos;t exist.
        </p>
        <p className="text-xs text-muted-foreground">Powered by FluxQR</p>
      </div>
    </main>
  )
}
```

### Pattern 2: Inline Inactive Page (PROD-02)
**What:** The deactivated case in `page.tsx` (lines 47-55) returns JSX directly. Currently a plain `<p>` with no branding.
**When to use:** Slug exists in DB but `is_active = false`.
**Recommended change:** Extract to `components/scanner/scanner-error.tsx` and use it from both the deactivated inline return and potentially from `not-found.tsx` (or keep them distinct if copy differs — recommended since the two messages should be distinct).

### Pattern 3: Vercel Environment Variables
**What:** Vercel stores env vars per project, per environment (Production / Preview / Development). Variables set in Vercel UI are injected at build time (for `NEXT_PUBLIC_*`) and at runtime (for server-only vars).
**Critical detail:** `NEXT_PUBLIC_*` vars are baked into the client bundle at build time. Changing `NEXT_PUBLIC_SITE_URL` in Vercel and redeploying is sufficient — no code change needed.

### Anti-Patterns to Avoid
- **Editing `components/ui/` files:** CLAUDE.md forbids hand-editing shadcn primitives. Error pages use raw Tailwind directly — no shadcn needed.
- **Adding `'use client'` to error pages:** Both `not-found.tsx` and the deactivated return must remain Server Components (no client JS) to satisfy SCAN-06's "under 10KB JS" budget. No state, no hooks.
- **Importing sidebar or layout components into error pages:** The scanner pages intentionally have no sidebar. Error states should match this.
- **Hard-coding production URL in code:** `NEXT_PUBLIC_SITE_URL` is the single source of truth. Do not hard-code any domain in source files.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Not-found routing | Custom 404 routing logic | Next.js `not-found.tsx` co-location | Built into App Router; automatically handles `notFound()` throws |
| Env var validation | Runtime env var checker | Vercel UI + Supabase dashboard | External config, not code's job for MVP |
| OAuth redirect registration | Custom redirect handler | Google Cloud Console URI registration | OAuth 2.0 standard; Google validates redirect URIs server-side |

**Key insight:** The QR URL domain is already abstracted through `NEXT_PUBLIC_SITE_URL` in `qr-generator.ts`. PROD-05 is a zero-code fix — just set the env var correctly in Vercel.

---

## Common Pitfalls

### Pitfall 1: NEXT_PUBLIC_SITE_URL Set to localhost in Vercel
**What goes wrong:** QR codes generated after deployment encode `http://localhost:3000/q/slug` instead of the production URL. Scanned QR codes fail to resolve.
**Why it happens:** The `.env` file has `NEXT_PUBLIC_SITE_URL=http://localhost:3000`. If this is accidentally committed or if the Vercel env var is not set, the fallback value is localhost.
**How to avoid:** In Vercel → Settings → Environment Variables, set `NEXT_PUBLIC_SITE_URL=https://{your-domain}` for Production environment. Trigger a redeploy.
**Warning signs:** Inspect any existing QR data URL — if the encoded URL starts with `localhost`, the var is wrong.

### Pitfall 2: Google OAuth Callback URL Not Registered for Production
**What goes wrong:** After deploying, clicking "Continue with Google" completes Google sign-in but returns an `Error 400: redirect_uri_mismatch` from Google.
**Why it happens:** Google OAuth 2.0 requires exact URI matching. The `signInWithGoogle` action passes `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` as `redirectTo`. If the production domain is not registered in Google Cloud Console, Google rejects it.
**How to avoid:** In Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID → Authorized redirect URIs, add `https://{prod-domain}/auth/callback`.
**Warning signs:** Error 400 page from Google after OAuth consent; never reaches `/auth/callback` route.

### Pitfall 3: Supabase Site URL Not Updated
**What goes wrong:** OAuth redirect works at Google level but Supabase rejects it as an unauthorized redirect URI.
**Why it happens:** Supabase Auth has its own allowlist of valid redirect URLs. The `redirectTo` passed in `signInWithOAuth` must match a pattern in Supabase → Authentication → URL Configuration → Redirect URLs.
**How to avoid:** In Supabase dashboard → Authentication → URL Configuration:
  - Set "Site URL" to `https://{prod-domain}`
  - Add `https://{prod-domain}/auth/callback` to "Redirect URLs" allowlist
**Warning signs:** Redirected to Supabase error page instead of the app.

### Pitfall 4: Inactive Page Has Client JS
**What goes wrong:** Adding `'use client'` or importing any client component into the deactivated page inflates the JS bundle for the scanner route.
**Why it happens:** SCAN-06 requires the scanner page to be under 10KB JS. The deactivated inline return shares the same `page.tsx` server render — but if a shared `ScannerError` component adds `'use client'`, that bundle cost applies.
**How to avoid:** Keep `scanner-error.tsx` as a pure Server Component with no hooks, no `'use client'`, and no dynamic imports.

### Pitfall 5: Not-found Page Inheriting Wrong Layout
**What goes wrong:** Not-found page shows a sidebar, or the page has a different background color.
**Why it happens:** If `not-found.tsx` is placed in the wrong directory (e.g., at `src/app/not-found.tsx` instead of `src/app/q/[slug]/not-found.tsx`), it may inherit the root layout. Or it may render on the canvas background but forget to explicitly set `bg-surface`.
**How to avoid:** Keep `not-found.tsx` co-located at `src/app/q/[slug]/not-found.tsx` where it already lives. The `q/[slug]` segment has no `layout.tsx`, so no sidebar is inherited. Explicitly add `bg-surface` to the `<main>` wrapper.

---

## Code Examples

Verified patterns from existing codebase:

### Current not-found.tsx (needs branding upgrade)
```tsx
// src/app/q/[slug]/not-found.tsx — CURRENT STATE (plain, no branding)
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-surface-raised rounded-lg p-8 w-full max-w-sm text-center">
        <p className="text-foreground">This link does not exist.</p>
      </div>
    </main>
  )
}
```

### Current deactivated inline JSX (needs extraction + branding)
```tsx
// src/app/q/[slug]/page.tsx lines 47-54 — CURRENT STATE
if (existing) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-surface-raised rounded-lg p-8 w-full max-w-sm text-center">
        <p className="text-foreground">This link has been deactivated.</p>
      </div>
    </main>
  )
}
```

### generateQrDataUrl — already env-var-driven (PROD-05 is a config-only fix)
```ts
// src/lib/qr-generator.ts — reads NEXT_PUBLIC_SITE_URL already
export async function generateQrDataUrl(slug: string): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/q/${slug}`
  // ...
}
```

### signInWithGoogle redirectTo — already env-var-driven
```ts
// src/app/login/actions.ts — redirectTo uses NEXT_PUBLIC_SITE_URL
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  },
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `pages/404.js` | Co-located `not-found.tsx` per segment | Next.js 13 App Router | Not-found can be segment-scoped without a global 404 page |
| Manual env var injection | Vercel UI env var management | Vercel platform standard | No `.env.production` committed to repo; zero secrets in source |

---

## Open Questions

1. **Production domain name**
   - What we know: The project deploys to Vercel; `NEXT_PUBLIC_SITE_URL` is currently `http://localhost:3000`
   - What's unclear: The actual production domain (custom domain vs `.vercel.app`)
   - Recommendation: The plan should include a placeholder step: "Set `NEXT_PUBLIC_SITE_URL=https://{your-vercel-domain}` in Vercel env vars" — the exact value depends on the developer's Vercel project name or custom domain

2. **Whether TWILIO env vars need to be set in Vercel**
   - What we know: `TWILIO_VERIFY_SERVICE_SID` and `TWILIO_FROM_NUMBER` are in `.env` but not documented in CLAUDE.md's env var list
   - What's unclear: Phase 4 requirements don't mention Twilio explicitly, but a fully functional deploy needs these
   - Recommendation: Include these in the PROD-03 env var checklist as additional required vars (beyond CLAUDE.md's list)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None configured (no pytest.ini, jest.config.*, or vitest.config.* detected) |
| Config file | none — existing tests use plain Node.js assert + tsx runner (Phase 02 decision) |
| Quick run command | `pnpm build` (type-checks + compiles) |
| Full suite command | `pnpm lint && pnpm build` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROD-01 | Not-found page renders without sidebar, uses brand tokens | manual-only | — see note | ❌ (UI visual check) |
| PROD-02 | Inactive slug page renders without sidebar, uses brand tokens | manual-only | — see note | ❌ (UI visual check) |
| PROD-03 | All env vars present in Vercel → build succeeds | smoke | `pnpm build` after env vars set | N/A (build CI) |
| PROD-04 | Google OAuth callback works on production domain | manual-only | Sign in → verify redirect lands on dashboard | N/A (external service) |
| PROD-05 | QR data URL encodes production domain | manual-only | Inspect generated QR data URL in production dashboard | N/A (env var check) |

> Note on manual-only: PROD-01 and PROD-02 are pure UI components with no logic. They are verified by visual inspection on a running app. A TypeScript build (`pnpm build`) will catch structural errors; visual correctness requires a browser.

### Sampling Rate
- **Per task commit:** `pnpm build` (zero TS errors is the gate)
- **Per wave merge:** `pnpm lint && pnpm build`
- **Phase gate:** Manual walkthrough: deploy to Vercel, complete Google sign-in, create a QR, scan it, verify QR URL encodes production domain, navigate to `/q/nonexistent` and `/q/deactivated-slug`

### Wave 0 Gaps
None — existing test infrastructure (lint + build) covers all automated checks for this phase. Manual verification steps are defined above.

---

## Sources

### Primary (HIGH confidence)
- Codebase inspection — `src/app/q/[slug]/not-found.tsx`, `src/app/q/[slug]/page.tsx`, `src/lib/qr-generator.ts`, `src/app/login/actions.ts`
- `CLAUDE.md` — env var list, project rules, design tokens
- `package.json` — confirmed Next.js 16.1.6, no test framework

### Secondary (MEDIUM confidence)
- Next.js App Router docs convention — co-located `not-found.tsx` for per-segment not-found UI (standard since Next.js 13 App Router)
- Vercel environment variable docs — `NEXT_PUBLIC_*` vars baked at build time, server vars injected at runtime
- Google OAuth 2.0 redirect URI validation — exact URI matching required

### Tertiary (LOW confidence)
- None — all claims are directly verifiable from the existing codebase or platform documentation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — inspected package.json and all relevant source files directly
- Architecture: HIGH — existing patterns confirmed in source, Next.js not-found.tsx convention is stable
- Pitfalls: HIGH — derived from reading actual OAuth flow, qr-generator, and env var usage in source

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable domain — Vercel env vars and Google OAuth conventions don't change)
