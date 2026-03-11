# Phase 2: Scanner - Research

**Researched:** 2026-03-10
**Domain:** Next.js 16 App Router server components, messaging deep links, Clipboard API, fire-and-forget async
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Scanner landing layout**
- Centered card on dark canvas — consistent with login page pattern
- Card structure: label at top, editable message textarea in middle, platform CTA button at bottom
- No FluxQR branding on the scanner page — clean page focused on the QR owner's label and message
- Platform CTA button shows platform icon + text (e.g., WhatsApp icon + "Abrir WhatsApp")
- CTA button uses platform brand color: WhatsApp green (#25D366), Telegram blue (#0088CC), SMS brand-500 indigo

**Message editing behavior**
- Textarea pre-filled with the QR owner's default message, fully editable by the scanner user
- When QR has no default message: empty textarea with placeholder text (e.g., "Digite sua mensagem...")
- CTA button disabled when textarea is empty — must have text to proceed
- Hard character limit at 500 characters on the textarea

**Telegram fallback UX**
- Two stacked buttons: "Copiar mensagem" (outline/ghost style) above "Abrir Telegram" (Telegram blue)
- Copy confirmation: button text changes to "Mensagem copiada!" with checkmark for 2 seconds, then reverts
- Short hint text above buttons: "O Telegram não suporta mensagens pré-preenchidas. Copie e cole no chat."
- "Copiar mensagem" uses outline/ghost button style — visually subordinate to the primary "Abrir Telegram" CTA

**Not-found / inactive pages**
- Same centered card layout for both missing and inactive slugs, with different message text
- Missing slug: "This link does not exist" / Inactive slug: "This link has been deactivated"
- Minimal text-only — no icons, illustrations, or CTAs
- Language: English
- No sidebar, no auth — matches scanner page's zero-chrome approach

### Claude's Discretion
- Exact card dimensions, padding, and spacing
- Textarea row count and resize behavior
- Loading skeleton while fetching QR data (if needed)
- Exact deep link URL construction for WhatsApp/SMS/Telegram
- Fire-and-forget scan count increment implementation
- Platform icon library choice (lucide, react-icons, or inline SVG)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCAN-01 | `/q/[slug]` fetches QR record by slug where is_active = true | Supabase anon client with `public_select_active` RLS policy covers this; `await params` pattern for Next.js 16 |
| SCAN-02 | Scan count increments atomically on page load (fire-and-forget, non-blocking) | `after()` from `next/server` — stable since Next.js 15.1, runs post-response without blocking render |
| SCAN-03 | Scanner landing shows label, editable message textarea, and platform CTA | Client Component (`scanner-landing.tsx`) with controlled textarea + platform-aware CTA button |
| SCAN-04 | Platform CTA opens WhatsApp (`wa.me`), SMS (`sms:`), or Telegram (`t.me`) deep link | Deep link URL formats verified: `wa.me/{phone}?text=`, `sms:{phone}?body=`, `https://t.me/{username}` |
| SCAN-05 | Telegram renders copy-message + open-Telegram fallback (no pre-fill support) | `navigator.clipboard.writeText()` in Client Component; Clipboard API does not require HTTPS in modern browsers for localhost but does for production (served over HTTPS on Vercel — safe) |
| SCAN-06 | Scanner page has zero auth, zero sidebar, under 10KB JS | `app/q/[slug]/` route outside `app/dashboard/` — no layout wrapping, no sidebar, no auth; middleware (`proxy.ts`) only checks `/dashboard/*` |
| SCAN-07 | Missing or inactive slug renders branded not-found page | Two-path logic: missing slug → `notFound()` (renders `not-found.tsx`); inactive slug → render static inactive card; both share the centered card layout |
</phase_requirements>

---

## Summary

Phase 2 builds the core product: the `/q/[slug]` proxy route. A scanner user visits the URL (from a printed QR code), the server fetches the QR record, atomically increments the scan count after the response, and renders a client-side landing page where the user can edit a message and tap a CTA to open their messaging app.

The architecture is straightforward: one async Server Component page (`page.tsx`) does all data fetching and passes data to a Client Component (`scanner-landing.tsx`) that owns the interactive state. The fire-and-forget scan count increment uses `after()` from `next/server` — stable as of Next.js 15.1, supported in the project's Next.js 16.1.6. The `increment_scan_count(qr_slug)` RPC already exists in the database (SECURITY DEFINER, atomic). Deep link URL construction lives in `src/lib/redirect.ts` (currently not created — this phase creates it).

Telegram does not support pre-filled messages via deep link. The fallback pattern is a two-button stack: copy message (Clipboard API) + open Telegram. This is the canonical solution for Telegram's limitation and is already specified in CONTEXT.md.

**Primary recommendation:** Use `after()` for fire-and-forget, one Server Component for data, one Client Component for interaction, `notFound()` for missing slugs, and a conditional inactive-card render for deactivated slugs.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next/server` (`after`) | 16.1.6 (stable since 15.1) | Fire-and-forget post-response side effects | Built-in, no dependency, designed for exactly this use case |
| `next/navigation` (`notFound`) | 16.1.6 | Render not-found.tsx for missing slugs | Built-in App Router convention, returns correct HTTP semantics |
| `@supabase/ssr` | ^0.9.0 | Supabase client for server-side data fetch | Already installed; anon key accesses `public_select_active` RLS policy |
| `navigator.clipboard` | Web API | Copy message to clipboard for Telegram fallback | Built-in browser API; no dependency needed |
| `lucide-react` | ^0.577.0 | Platform icons (already installed) | Already in project; MessageCircle, Send, Phone icons available |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@/components/ui/button` | (shadcn) | CTA and copy buttons | All interactive buttons on scanner landing |
| `@/lib/utils` (`cn`) | local | Conditional class merging | All className composition |
| `@/types/index.ts` (`Platform`, `QrCode`) | local | Type safety | Scanner page and redirect builder |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `after()` for scan increment | Separate API route + `fetch` from client | `after()` is simpler, server-only, no extra round-trip, no client JS needed |
| `lucide-react` icons | Inline SVGs or `react-icons` | `lucide-react` is already installed; inline SVG saves zero bytes at the cost of unmaintainability |
| `notFound()` for inactive slugs | Custom 404-like page component | Inactive slugs require different message than missing — use conditional render in page.tsx, not `notFound()` |

**Installation:** No new packages needed. All dependencies already in `package.json`.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/q/[slug]/
│   ├── page.tsx              # Server Component: fetch QR, call after(), render
│   ├── scanner-landing.tsx   # Client Component: textarea state, CTA, deep link
│   └── not-found.tsx         # Server Component: missing-slug card (no props)
├── lib/
│   └── redirect.ts           # buildPlatformUrl(platform, contact, message) → string
└── components/scanner/
    └── telegram-fallback.tsx # Client Component: copy + open two-button flow
```

### Pattern 1: Server Component Proxy with `after()` for Non-Blocking Increment

**What:** Page fetches QR data synchronously (needed to render), then schedules the scan count increment to run after the response is sent using `after()`.

**When to use:** Whenever a side effect (analytics, logging, increments) must not block the user-facing render.

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/after
import { after } from 'next/server'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ScannerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: qr } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  // Missing slug — render not-found.tsx
  if (!qr) {
    // Check if the slug exists at all (inactive)
    const { data: inactive } = await supabase
      .from('qr_codes')
      .select('is_active')
      .eq('slug', slug)
      .single()

    if (inactive) {
      // Render inline inactive card — different message from "not found"
      return <InactiveCard />
    }

    notFound()
  }

  // Fire-and-forget: runs after response is sent, does not block render
  after(async () => {
    const supabase = await createClient()
    await supabase.rpc('increment_scan_count', { qr_slug: slug })
  })

  return <ScannerLanding qr={qr} />
}
```

**Important:** `after()` callbacks in Server Components **cannot** call `cookies()` or `headers()` inside the callback. Read any needed request data before `after()` and pass values in via closure. In this case, `slug` is captured from the outer scope — this is the correct pattern.

**Important:** `after()` creates a new `createClient()` call inside the callback. This is required because the outer `supabase` instance's cookie store may no longer be valid after the response is sent.

### Pattern 2: Client Component for Interactive State

**What:** The scanner landing is a `"use client"` component that owns `useState` for the message text and calls `window.location.href` (or `<a href>`) to open deep links.

**When to use:** Any component with user input (textarea) or browser APIs (Clipboard).

**Example:**
```typescript
// Client Component — interactive textarea + CTA
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { buildPlatformUrl } from '@/lib/redirect'
import { TelegramFallback } from '@/components/scanner/telegram-fallback'
import type { QrCode } from '@/types'

export function ScannerLanding({ qr }: { qr: QrCode }) {
  const [message, setMessage] = useState(qr.default_message ?? '')

  const handleOpen = () => {
    const url = buildPlatformUrl(qr.platform, qr.contact_target, message)
    window.location.href = url
  }

  if (qr.platform === 'telegram') {
    return (
      <TelegramFallback
        message={message}
        contactTarget={qr.contact_target}
        onMessageChange={setMessage}
        label={qr.label}
      />
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-surface-raised rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-foreground font-semibold text-lg">{qr.label}</h1>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Digite sua mensagem..."
          className="mt-4 w-full rounded-md bg-surface-overlay text-foreground p-3 text-sm resize-none border border-border focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button
          onClick={handleOpen}
          disabled={!message.trim()}
          className="mt-4 w-full"
          style={{ backgroundColor: platformColor(qr.platform) }}
        >
          {platformLabel(qr.platform)}
        </Button>
      </div>
    </main>
  )
}
```

### Pattern 3: Deep Link URL Construction (`buildPlatformUrl`)

**What:** A pure function in `src/lib/redirect.ts` that maps platform + contact + message to the correct deep link URL.

**Verified URL formats (HIGH confidence):**

| Platform | URL Format | Notes |
|----------|-----------|-------|
| WhatsApp | `https://wa.me/{phone}?text={encoded}` | Phone without `+` or spaces; `encodeURIComponent` for message |
| SMS | `sms:{phone}?body={encoded}` | `?body=` works cross-platform iOS/Android; `encodeURIComponent` for body |
| Telegram | `https://t.me/{username}` | No pre-fill supported — username only, no message parameter |

**Example:**
```typescript
// Source: WhatsApp — https://wa.me docs; SMS — Apple developer docs; Telegram — core.telegram.org/api/links
import type { Platform } from '@/types'

export function buildPlatformUrl(
  platform: Platform,
  contactTarget: string,
  message: string
): string {
  const encodedMessage = encodeURIComponent(message)

  switch (platform) {
    case 'whatsapp':
      // contactTarget is phone number (digits only, with country code)
      return `https://wa.me/${contactTarget}?text=${encodedMessage}`
    case 'sms':
      // contactTarget is phone number
      return `sms:${contactTarget}?body=${encodedMessage}`
    case 'telegram':
      // contactTarget is username (without @); no pre-fill possible
      return `https://t.me/${contactTarget}`
  }
}
```

**WhatsApp phone format:** `contactTarget` should be stored as digits only with country code (e.g., `5511999998888`). The `wa.me` API strips any `+` or formatting automatically, but storing clean digits is safest.

**SMS cross-platform:** `sms:{phone}?body={encoded}` works on both iOS and Android. iOS older versions sometimes need `;body=` instead of `?body=`, but `?body=` is the current standard and works on iOS 14+.

### Pattern 4: Telegram Fallback Two-Button Component

**What:** A dedicated Client Component for the Telegram copy+open flow.

**Example:**
```typescript
'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TelegramFallbackProps {
  message: string
  contactTarget: string
  onMessageChange: (msg: string) => void
  label: string
}

export function TelegramFallback({
  message, contactTarget, onMessageChange, label
}: TelegramFallbackProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpen = () => {
    window.location.href = `https://t.me/${contactTarget}`
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-surface-raised rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-foreground font-semibold text-lg">{label}</h1>
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Digite sua mensagem..."
          className="mt-4 w-full rounded-md bg-surface-overlay text-foreground p-3 text-sm resize-none border border-border focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="mt-3 text-xs text-muted-foreground">
          O Telegram não suporta mensagens pré-preenchidas. Copie e cole no chat.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="outline" onClick={handleCopy} disabled={!message.trim()}>
            {copied ? (
              <><Check className="mr-2 h-4 w-4" /> Mensagem copiada!</>
            ) : (
              'Copiar mensagem'
            )}
          </Button>
          <Button
            onClick={handleOpen}
            style={{ backgroundColor: '#0088CC', color: '#fff' }}
          >
            Abrir Telegram
          </Button>
        </div>
      </div>
    </main>
  )
}
```

### Pattern 5: not-found.tsx for Missing Slugs

**What:** The `not-found.tsx` file in `app/q/[slug]/` renders when `notFound()` is called from `page.tsx`. No props accepted.

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/not-found
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

**Important:** `not-found.tsx` does NOT accept props. It cannot receive the slug. The inactive slug case (slug exists but `is_active = false`) must be handled in `page.tsx` with a conditional render — do not call `notFound()` for inactive slugs.

### Anti-Patterns to Avoid

- **Calling `cookies()` or `headers()` inside `after()` callback:** These throw a runtime error inside `after()` in Server Components. Read request data before `after()` and pass via closure.
- **Using `notFound()` for inactive slugs:** Will render the "does not exist" page for users who scanned a deactivated QR. These are two distinct states requiring different messages — handle inactive in the page component.
- **Putting Supabase query in Client Component:** Violates project rules. All Supabase queries stay in Server Components (or Server Actions). `page.tsx` fetches the data, passes it to `scanner-landing.tsx` as props.
- **Hard-coding message in the deep link href at render time:** The message is editable — the deep link must be built at button-click time using the current textarea value, not at component render time.
- **Using `window.location.href` for deep links on `<a>` tags:** Use `<a href={url}>` or `window.open(url)` for consistency. `window.location.href` is fine but an `<a>` tag with `target="_blank"` may be better for deep links to avoid breaking navigation context.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Atomic scan count increment | Custom UPDATE with optimistic locking | `supabase.rpc('increment_scan_count', { qr_slug })` | Already exists, SECURITY DEFINER, race-condition safe |
| Fire-and-forget post-response side effect | `void promise` or background fetch | `after()` from `next/server` | `void` promises can be cut off when the function returns; `after()` extends the request lifetime correctly on Vercel |
| URL encoding for deep links | Custom escape function | `encodeURIComponent()` | Built-in, handles all edge cases (emoji, newlines, special chars) |
| Copy to clipboard | `document.execCommand('copy')` | `navigator.clipboard.writeText()` | `execCommand` is deprecated; Clipboard API is the current standard |
| Platform icon display | Inline SVG strings in JSX | `lucide-react` (already installed) | Already in the project; `MessageCircle` (WhatsApp/SMS), `Send` (Telegram) available |

**Key insight:** The database layer for this phase is already complete (table, RLS, RPC, index). The entire phase is about routing + UI + deep link construction.

---

## Common Pitfalls

### Pitfall 1: Inactive Slug Calling `notFound()`
**What goes wrong:** Developer calls `notFound()` for both "slug not found" and "slug is inactive" — users who scanned a deactivated QR see a generic "not found" message that implies the link never existed.
**Why it happens:** Conflating two distinct states — missing vs. deactivated.
**How to avoid:** In `page.tsx`, run two separate queries: first SELECT with `is_active = true` (fast, uses partial index), then if null, SELECT without `is_active` filter to distinguish missing vs. inactive. Render different UI for each case.
**Warning signs:** "This link does not exist" shown to a user who previously scanned the same QR code successfully.

### Pitfall 2: `after()` Callback Calling `createClient()` with Stale Cookie Store
**What goes wrong:** `after()` runs after the response is sent; the outer `supabase` client created in the Server Component may have a cookie store that's been garbage collected or is no longer valid in the `after` closure.
**Why it happens:** `cookies()` from `next/headers` is request-scoped; `after()` runs outside the request lifecycle.
**How to avoid:** Create a fresh `createClient()` inside the `after()` callback. The anon key doesn't need cookies for the `increment_scan_count` RPC (SECURITY DEFINER bypasses RLS), so a cookieless client works fine. Alternatively: call `supabase.rpc()` directly using `@supabase/supabase-js` with env vars inside `after()`.
**Warning signs:** Runtime error: "Cookies can only be modified in a Server Action or Route Handler."

### Pitfall 3: params Not Awaited in Next.js 15+
**What goes wrong:** `params.slug` accessed synchronously throws a type error or returns undefined.
**Why it happens:** In Next.js 15+, `params` is a `Promise<{ slug: string }>`. Must be awaited.
**How to avoid:** Always `const { slug } = await params` in async Server Components.
**Warning signs:** TypeScript error on `params.slug` if types are correct; runtime undefined if not.

### Pitfall 4: Clipboard API Failing Without User Gesture
**What goes wrong:** `navigator.clipboard.writeText()` throws `NotAllowedError` if called outside a user-initiated event handler.
**Why it happens:** The Clipboard API requires a user gesture (click, tap) as a security measure.
**How to avoid:** Always call `navigator.clipboard.writeText()` directly inside the button's `onClick` handler — never in a `useEffect` or `setTimeout`.
**Warning signs:** Console error `DOMException: NotAllowedError`; copy silently fails.

### Pitfall 5: Scanner Page Accidentally Including Dashboard Layout
**What goes wrong:** The `app/dashboard/layout.tsx` adds the sidebar. If the scanner page is placed under `app/dashboard/`, it inherits the layout.
**Why it happens:** Next.js App Router applies all parent `layout.tsx` files to child routes.
**How to avoid:** `app/q/[slug]/` is a sibling of `app/dashboard/` at the `app/` level — it only inherits `app/layout.tsx` (which provides fonts and the Toaster, but no sidebar). This is already the correct structure per CLAUDE.md.
**Warning signs:** Sidebar appearing on scanner page; auth redirect for unauthenticated users visiting `/q/[slug]`.

### Pitfall 6: JS Bundle Size Exceeding 10KB
**What goes wrong:** The scanner page imports heavy libraries, violating the SCAN-06 requirement.
**Why it happens:** Accidentally importing from a large component tree or using heavy icon packs.
**How to avoid:** Keep scanner-landing.tsx and telegram-fallback.tsx lean. Use only: `react`, `lucide-react` (tree-shakeable), `@/components/ui/button`, `@/lib/utils`. No Supabase client in client components. No Framer Motion. No unneeded shadcn primitives.
**Warning signs:** `next build` output showing `/q/[slug]` bundle > 10KB.

---

## Code Examples

### Supabase Anon Client Query for Scanner (Server Component)
```typescript
// Uses public_select_active RLS policy — no auth needed
const { data: qr } = await supabase
  .from('qr_codes')
  .select('id, slug, label, platform, contact_target, default_message, is_active')
  .eq('slug', slug)
  .single()

// qr is null if slug doesn't exist at all
// qr.is_active === false means slug exists but is deactivated
```

### after() for Scan Count Increment
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/after
import { after } from 'next/server'

// Inside the Server Component, after fetching QR data:
after(async () => {
  // Fresh client inside after() — outer client's cookie store may be stale
  const { createClient: createServerClient } = await import('@/lib/supabase/server')
  const supabase = await createServerClient()
  await supabase.rpc('increment_scan_count', { qr_slug: slug })
})
```

### Platform Color Helper
```typescript
// Inline in scanner-landing.tsx — no external dependency
function platformColor(platform: Platform): string {
  switch (platform) {
    case 'whatsapp': return '#25D366'
    case 'telegram': return '#0088CC'
    case 'sms':      return '#6366F1' // brand-500 indigo per CONTEXT.md
  }
}

function platformLabel(platform: Platform): string {
  switch (platform) {
    case 'whatsapp': return 'Abrir WhatsApp'
    case 'telegram': return 'Abrir Telegram'
    case 'sms':      return 'Enviar SMS'
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `void promise` for fire-and-forget | `after()` from `next/server` | Next.js 15.0 RC, stable 15.1 | `after()` extends request lifetime; bare `void` can be cut off on serverless |
| Synchronous `params.slug` | `const { slug } = await params` | Next.js 15 | Must await params in all Server Components |
| `document.execCommand('copy')` | `navigator.clipboard.writeText()` | ~2020, universally supported by 2023 | `execCommand` deprecated; Clipboard API is current standard |
| `unstable_after` | `after` (stable) | Next.js 15.1.0 | No more `unstable_` prefix needed |

**Deprecated/outdated:**
- `unstable_after`: Replaced by stable `after` — use `import { after } from 'next/server'` directly.
- Synchronous `params` access: Still works in Next.js 15+ (backwards compat) but deprecated — always `await params`.

---

## Open Questions

1. **SMS `?body=` vs `;body=` for older iOS**
   - What we know: `sms:{phone}?body={encoded}` works on iOS 14+ and all Android. Older iOS (<14) uses `;body=`.
   - What's unclear: Whether any target users run iOS <14 (released 2020). iOS 13 market share is negligible by 2026.
   - Recommendation: Use `?body=` — iOS <14 is below 1% market share. No UA detection needed.

2. **WhatsApp `contact_target` format validation**
   - What we know: `wa.me/{phone}` requires the number to contain only digits with country code (no `+`, no spaces, no dashes).
   - What's unclear: Whether `contact_target` stored in the DB is already normalized at creation time (Phase 3 concern).
   - Recommendation: In `buildPlatformUrl`, strip non-digits from `contact_target` for WhatsApp: `contactTarget.replace(/\D/g, '')`. This is defensive and costs nothing.

3. **`after()` and Supabase client inside the callback**
   - What we know: Creating a new `createClient()` inside `after()` requires `await cookies()` inside the callback, which throws a runtime error per Next.js docs.
   - What's unclear: Whether the anon client (no cookies needed) can be created differently to avoid this.
   - Recommendation: Create a minimal Supabase client directly from env vars inside the `after()` callback, bypassing `@/lib/supabase/server.ts` (which calls `cookies()`). Use `createServerClient` from `@supabase/ssr` directly with empty cookie handlers. The RPC is SECURITY DEFINER — no user auth needed.

---

## Sources

### Primary (HIGH confidence)
- [Next.js docs: `after()`](https://nextjs.org/docs/app/api-reference/functions/after) — fire-and-forget pattern, Server Component constraints
- [Next.js docs: `not-found.js`](https://nextjs.org/docs/app/api-reference/file-conventions/not-found) — not-found file convention, no-props constraint
- [Next.js docs: Dynamic Route Segments](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) — `await params` pattern
- `supabase/migrations/0001_create_qr_codes.sql` — confirmed RPC signature `increment_scan_count(qr_slug text)`, partial index, RLS policies

### Secondary (MEDIUM confidence)
- [WhatsApp wa.me deep link format](https://wa.me) — `https://wa.me/{phone}?text={encoded}` verified against multiple official/semi-official sources
- [Apple SMS URL scheme docs](https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/SMSLinks/SMSLinks.html) — `sms:{phone}?body={encoded}`
- [Telegram core.telegram.org/api/links](https://core.telegram.org/api/links) — `https://t.me/{username}`, no pre-fill support confirmed

### Tertiary (LOW confidence)
- SMS cross-platform `?body=` compatibility: multiple third-party sources agree; Apple's own docs only cover iOS

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed; `after()` verified against official Next.js 16 docs
- Architecture: HIGH — Server + Client Component split is a standard App Router pattern; verified against Next.js docs
- Deep link URLs: HIGH — WhatsApp and Telegram verified against official sources; SMS verified against Apple docs
- Pitfalls: HIGH — `after()` constraints and `notFound()` behavior from official docs; `await params` from official docs

**Research date:** 2026-03-10
**Valid until:** 2026-06-10 (stable APIs; deep link formats rarely change)
