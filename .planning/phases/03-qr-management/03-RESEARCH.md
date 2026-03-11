# Phase 3: QR Management - Research

**Researched:** 2026-03-11
**Domain:** Next.js 15 App Router CRUD with Server Actions, QR image generation, Supabase mutations
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- No live QR preview during creation — user sees QR for the first time on the dashboard list
- Dashboard list shows 40px QR thumbnail per row — compact, data-dense layout
- Download button lives on the list row alongside Edit/Delete — one-click PNG download, no extra navigation
- QR image uses brand colors: #0F172A (canvas dark) modules on white background
- High error correction level for reliable scanning
- Download filename: `{slug}-fluxqr.png`
- "Create new" action is a page-level button in dashboard header, not a sidebar link
- Server Actions for all mutations
- Soft delete only — is_active = false, never hard DELETE
- Platform field read-only after creation
- Dark-only theme with canvas/raised/overlay surface tokens

### Claude's Discretion
- Dashboard list row layout and responsive mobile behavior
- Create/edit form field arrangement and visual hierarchy
- Platform selector style (dropdown vs radio cards)
- Page header design and back navigation on create/edit pages
- Slug input live validation UX details (spinner, checkmark, error placement)
- Edit page pulse confirmation animation approach
- Empty state illustration or icon choice
- QR image generation library and implementation details
- Loading states during form submission

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CREATE-01 | User can create QR code via form with label, slug, platform, contact target, message | Server Action + Zod validation pattern; `useActionState` for inline errors |
| CREATE-02 | Slug validates format (lowercase letters, numbers, hyphens only) on blur | Zod `.regex(/^[a-z0-9-]+$/)` on server; HTML5 pattern attribute on client |
| CREATE-03 | Slug availability checked via debounced API call with inline feedback | Route Handler at `/api/slug-check` + custom `useSlugCheck` hook with 300ms debounce |
| CREATE-04 | Duplicate slug (unique constraint violation) handled gracefully | Supabase error code `23505` check in Server Action; return field error |
| CREATE-05 | Successful creation redirects to `/dashboard` | `redirect('/dashboard')` inside Server Action after successful insert |
| LIST-01 | Dashboard shows all user's active QR codes ordered by created_at desc | Server Component fetches `qr_codes WHERE is_active=true AND user_id=auth.uid()` |
| LIST-02 | Each row displays QR image thumbnail, label, slug, platform badge, scan count, edit and delete actions | `qr-list-row.tsx` receives `QrCode` prop; `generateQrDataUrl()` in Server Component |
| LIST-03 | Empty state shows illustration + "Create your first QR" CTA when no codes exist | `empty-state.tsx` component in `components/shared/` |
| EDIT-01 | Edit page pre-fills all fields from existing QR data | Server Component fetches single row by id; passes as defaultValues to Client Component form |
| EDIT-02 | Platform selector is read-only on edit with tooltip explaining why | `disabled` + `title` attribute or Radix Tooltip on platform field |
| EDIT-03 | Successful save triggers green pulse on list row + success toast | `qr-pulse-wrapper` with `--animate-qr-pulse` keyframe (already in globals.css); `sonner` toast |
| EDIT-04 | Duplicate slug on edit handled with inline error | Same `23505` check; return field error from Server Action |
| DEL-01 | Delete opens confirmation dialog naming the specific QR code | `delete-dialog.tsx` using shadcn AlertDialog (needs install); shows QR label |
| DEL-02 | Confirming sets is_active = false (soft delete, never hard DELETE) | Server Action: `UPDATE qr_codes SET is_active=false WHERE id=? AND user_id=auth.uid()` |
| DEL-03 | Deleted code disappears from list, scanner shows inactive page | `revalidatePath('/dashboard')` after soft delete; scanner already handles inactive slugs |
| GEN-01 | QR image points to `{SITE_URL}/q/{slug}` and is scannable | `qrcode` npm package: `QRCode.toDataURL(\`${process.env.NEXT_PUBLIC_SITE_URL}/q/${slug}\`)` |
| GEN-02 | QR uses brand colors (dark #0F172A on white) with high error correction | `{ color: { dark: '#0F172A', light: '#FFFFFF' }, errorCorrectionLevel: 'H' }` |
| GEN-03 | User can download QR as PNG named `{slug}-fluxqr.png` | `downloadQrPng()` in `lib/qr-generator.ts`: fetch data URL, create blob, anchor click |
| ANLYT-01 | Dashboard list rows display current scan_count | Returned from Supabase SELECT; passed to row component |
| ANLYT-02 | Scan counts ≥ 1000 formatted as compact notation (e.g., 1.2k) | `formatScanCount()` already in `src/lib/utils.ts` |
| ANLYT-03 | Concurrent scans produce accurate count (no race conditions) | Already solved: `increment_scan_count(qr_slug)` RPC with SECURITY DEFINER is atomic (Phase 1) |
</phase_requirements>

---

## Summary

Phase 3 implements the full dashboard CRUD loop: create, list, edit, delete, and download QR codes. The stack is already defined — Next.js 15 App Router with Server Actions and Supabase — and the project has established patterns to follow. The main new domains are QR image generation (needs a library install), the Server Action + `useActionState` form pattern (official Next.js 15 pattern), and the slug availability Route Handler with debounced client hook.

Every mutation uses the same pattern: Server Action validates with Zod, queries Supabase with the user's auth context, calls `revalidatePath('/dashboard')`, and either redirects (create) or returns a state object (edit/delete). The QR generation happens server-side in `lib/qr-generator.ts` using the `qrcode` npm package with `toDataURL()`. Download triggers client-side only (blob + anchor programmatic click). No new third-party UI libraries are needed beyond `qrcode` and shadcn AlertDialog/Dialog/Tooltip (via `shadcn add`).

The ANLYT-03 race condition requirement is already solved by the atomic RPC from Phase 1 — no additional work required.

**Primary recommendation:** Use `qrcode` npm package (server-side `toDataURL`) for generation, `useActionState` + Zod for all forms, and `revalidatePath('/dashboard')` after every mutation.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| qrcode | ^1.5.4 | QR code data URL generation | Standard Node.js QR library; supports color options, error correction, server-side PNG; no canvas dependency in Node (uses pure JS encoder) |
| zod | ^4.3.6 (installed) | Schema validation in Server Actions | Already in package.json; official Next.js docs example uses it for Server Action validation |
| sonner | ^2.0.7 (installed) | Toast notifications for save/error feedback | Already installed; Toaster already in app layout (sonner.tsx exists) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/qrcode | ^1.5.5 | TypeScript types for qrcode | Install alongside qrcode — package does not bundle its own types |
| lucide-react | ^0.577.0 (installed) | Icons for empty state, actions, platform badges | Already installed; use QrCode, Pencil, Trash2, Download, Plus icons |

### shadcn Components Needed (via `shadcn add`)
| Component | Purpose | Install Command |
|-----------|---------|-----------------|
| alert-dialog | Delete confirmation dialog (DEL-01) | `npx shadcn add alert-dialog` |
| dialog | Optional for additional modals if needed | `npx shadcn add dialog` |
| tooltip | Platform read-only tooltip on edit (EDIT-02) | `npx shadcn add tooltip` |
| input | Form text inputs | `npx shadcn add input` |
| label | Form field labels | `npx shadcn add label` |
| textarea | Default message field | `npx shadcn add textarea` |
| select | Platform selector dropdown | `npx shadcn add select` |
| badge | Platform badge (LIST-02) | `npx shadcn add badge` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| qrcode (server-side) | qrcode (client-side canvas) | Client-side keeps scanner page bundle small but adds JS to dashboard; server-side generates data URL once at list render, no client JS needed for thumbnail display |
| qrcode | qr-code-styling | qr-code-styling supports logos/gradients but requires browser canvas — not suitable for server-side generation; overkill for MVP |
| useActionState | react-hook-form + Server Action | RHF adds bundle weight; useActionState is built into React 19 and aligns with existing project patterns (signOut uses plain form action) |

**Installation:**
```bash
npm install qrcode
npm install -D @types/qrcode
npx shadcn add alert-dialog tooltip input label textarea select badge
```

---

## Architecture Patterns

### Recommended Project Structure

The CONTEXT.md already specifies exact file locations. Research confirms these are the correct App Router conventions:

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx                    # Server Component: fetch all QR codes + render list
│   │   ├── new/
│   │   │   ├── page.tsx               # Server Component: render create form
│   │   │   └── actions.ts             # 'use server': createQrCode()
│   │   └── [id]/
│   │       └── edit/
│   │           ├── page.tsx           # Server Component: fetch QR + render edit form
│   │           └── actions.ts         # 'use server': updateQrCode(), deleteQrCode()
│   └── api/
│       └── slug-check/
│           └── route.ts               # GET handler: slug availability check
├── components/
│   ├── shared/
│   │   ├── page-header.tsx            # Title + breadcrumb + optional CTA button
│   │   ├── platform-badge.tsx         # Colored badge by platform
│   │   ├── empty-state.tsx            # No QR codes CTA
│   │   └── qr-pulse-wrapper.tsx       # Wrapper that applies qr-pulse animation
│   ├── dashboard/
│   │   ├── qr-list.tsx                # Client Component: list + optimistic delete
│   │   ├── qr-list-row.tsx            # Single row with thumbnail, actions
│   │   └── delete-button.tsx          # Triggers AlertDialog, calls deleteQrCode
│   ├── qr-management/
│   │   ├── qr-form.tsx                # Client Component: useActionState form
│   │   ├── platform-selector.tsx      # Select dropdown (disabled on edit)
│   │   ├── slug-input.tsx             # Input with live availability check
│   │   └── delete-dialog.tsx          # AlertDialog confirmation
│   └── qr-generation/
│       └── qr-image.tsx               # <img src={dataUrl}> — pure display
├── hooks/
│   ├── use-slug-check.ts              # Debounced fetch to /api/slug-check
│   └── use-qr-image.ts               # Client-side: generate/cache data URL
└── lib/
    └── qr-generator.ts                # generateQrDataUrl(), downloadQrPng()
```

### Pattern 1: Server Action with useActionState

**What:** Client Component wraps form; Server Action receives `(prevState, formData)` and returns typed error state. `useActionState` manages loading + errors.

**When to use:** All create/edit forms where inline field errors are needed.

```typescript
// Source: https://nextjs.org/docs/app/guides/forms (verified 2026-03-11)

// actions.ts
'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const CreateQrSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  platform: z.enum(['whatsapp', 'sms', 'telegram']),
  contact_target: z.string().min(1, 'Contact target is required'),
  default_message: z.string().optional(),
})

type FormState = {
  errors?: { [field: string]: string[] }
  message?: string | null
}

export async function createQrCode(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = CreateQrSchema.safeParse(Object.fromEntries(formData))
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('qr_codes').insert({
    ...validated.data,
    user_id: user.id,
  })

  if (error?.code === '23505') {
    return { errors: { slug: ['This slug is already taken'] } }
  }
  if (error) return { message: 'Failed to create QR code' }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// qr-form.tsx (Client Component)
'use client'
import { useActionState } from 'react'

export function QrForm({ action }: { action: typeof createQrCode }) {
  const [state, formAction, pending] = useActionState(action, {})
  return (
    <form action={formAction}>
      {/* fields */}
      {state.errors?.slug && (
        <p className="text-sm text-danger mt-1">{state.errors.slug[0]}</p>
      )}
      <button disabled={pending} type="submit">
        {pending ? 'Saving...' : 'Create'}
      </button>
    </form>
  )
}
```

### Pattern 2: QR Image Generation (Server-Side)

**What:** `generateQrDataUrl()` in `lib/qr-generator.ts` runs server-side to produce a `data:image/png;base64,...` string. List renders it as `<img>`. Download triggers client-side blob.

**When to use:** List thumbnail (server) and download button (client).

```typescript
// Source: qrcode npm README + verified color option format

// lib/qr-generator.ts
import QRCode from 'qrcode'

export async function generateQrDataUrl(slug: string): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/q/${slug}`
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    width: 400,
    margin: 2,
    color: {
      dark: '#0F172A',   // brand surface — canvas dark modules
      light: '#FFFFFF',  // white background
    },
  })
}

// Client-side download — runs only on button click (no server needed)
export function downloadQrPng(dataUrl: string, slug: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `${slug}-fluxqr.png`
  link.click()
}
```

### Pattern 3: Slug Availability Route Handler + Debounced Hook

**What:** GET route at `/api/slug-check?slug=foo` returns `{ available: boolean }`. Client hook debounces 300ms before calling.

**When to use:** Slug input field on create form (and edit form if slug is editable).

```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/route

// app/api/slug-check/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')
  if (!slug) return Response.json({ available: false })

  const supabase = await createClient()
  const { data } = await supabase
    .from('qr_codes')
    .select('id')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  return Response.json({ available: !data })
}

// hooks/use-slug-check.ts
'use client'
import { useState, useEffect, useRef } from 'react'

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

export function useSlugCheck(slug: string) {
  const [status, setStatus] = useState<SlugStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!slug) { setStatus('idle'); return }
    const valid = /^[a-z0-9-]+$/.test(slug)
    if (!valid) { setStatus('invalid'); return }

    setStatus('checking')
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      const res = await fetch(`/api/slug-check?slug=${slug}`)
      const { available } = await res.json()
      setStatus(available ? 'available' : 'taken')
    }, 300)

    return () => clearTimeout(timerRef.current)
  }, [slug])

  return status
}
```

### Pattern 4: Soft Delete with revalidatePath

**What:** Server Action sets `is_active = false`, then calls `revalidatePath('/dashboard')`. Dashboard re-fetches fresh data on next render. No client-side state removal needed (Server Component re-renders with updated data).

**When to use:** All delete operations.

```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/revalidatePath

'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function deleteQrCode(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  await supabase
    .from('qr_codes')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', user.id)   // RLS double-check — never trust client-provided id alone

  revalidatePath('/dashboard')
}
```

### Pattern 5: Edit with Pulse Confirmation

**What:** After successful save, Server Action returns `{ success: true }`. Client Component detects the success state and briefly applies the `animate-qr-pulse` class from globals.css to the row wrapper.

**When to use:** Edit form (EDIT-03).

```typescript
// globals.css already defines:
// --animate-qr-pulse: qr-pulse 0.6s ease-out;
// @keyframes qr-pulse { 0% { box-shadow: 0 0 0 0px rgba(16,185,129,0.5) } 100% { box-shadow: 0 0 0 14px rgba(16,185,129,0) } }

// qr-pulse-wrapper.tsx
'use client'
import { useEffect, useState } from 'react'

export function QrPulseWrapper({
  children,
  trigger,
}: {
  children: React.ReactNode
  trigger: boolean
}) {
  const [pulsing, setPulsing] = useState(false)

  useEffect(() => {
    if (trigger) {
      setPulsing(true)
      const t = setTimeout(() => setPulsing(false), 700)
      return () => clearTimeout(t)
    }
  }, [trigger])

  return (
    <div className={pulsing ? 'animate-qr-pulse rounded-md' : ''}>
      {children}
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Supabase in Client Components:** All queries must stay in Server Components or Server Actions per project rules. The slug-check Route Handler is the only client-facing query endpoint, and it uses the server Supabase client.
- **Hard DELETE:** Never. Always `UPDATE SET is_active = false`.
- **Skipping user_id check:** Every mutation must filter `WHERE user_id = auth.uid()`. The Supabase RLS policies enforce this, but Server Actions should also verify the authenticated user to fail fast before the DB round-trip.
- **Throwing exceptions from Server Actions:** Return error objects instead of throwing. Throwing causes the Next.js error boundary to trigger, not inline form errors.
- **Calling revalidatePath from Client Components:** It only works on the server. Call from Server Action, not from client-side event handlers.
- **Platform edit on update:** Never allow `platform` to change after creation. Exclude it from the update schema entirely.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| QR code matrix generation | Custom QR encoder | `qrcode` npm | Reed-Solomon error correction, masking, format info are complex specs; battle-tested library handles all versions |
| Form pending state | Manual `useState(loading)` + disable | `useActionState` third return value (`pending`) | Built into React 19; already the project's Server Action pattern |
| Debounce utility | `setTimeout`/`clearTimeout` in component | Inline `useRef` + `setTimeout` (shown above) OR `use-debounce` package | Simple enough to inline for a single hook; don't add `lodash.debounce` for one use case |
| Slug uniqueness check | DB constraint + optimistic assume-unique | Route Handler + inline feedback | User experience requirement (CREATE-03) explicitly requires live feedback |
| Compact number formatting | Custom formatter | `formatScanCount()` in `lib/utils.ts` | Already exists and tested |
| Toast notifications | Custom toast component | `sonner` (already installed) | Already wired up via `components/ui/sonner.tsx` |

**Key insight:** The project already has the hard infrastructure (RLS, atomic RPC, Supabase clients, design tokens, animation keyframes). Phase 3 is primarily composition of existing parts with one new library (`qrcode`).

---

## Common Pitfalls

### Pitfall 1: qrcode `toDataURL` in Server Component vs Client Component

**What goes wrong:** Calling `generateQrDataUrl()` inside a Client Component or React render path at route load time. The function is async and uses Node.js internals not available in the browser bundle.
**Why it happens:** `lib/qr-generator.ts` imports `qrcode` which is a Node.js module. Importing it in a Client Component will cause a build error.
**How to avoid:** Call `generateQrDataUrl()` only in Server Components (dashboard `page.tsx`) or Server Actions. Pass the resulting `dataUrl` string as a prop to Client Components. The `downloadQrPng()` function is the exception — it runs client-side on button click using a `dataUrl` prop passed down.
**Warning signs:** Build error "Module not found: Can't resolve 'qrcode'" or "canvas is not defined" at runtime.

### Pitfall 2: redirect() inside try/catch in Server Actions

**What goes wrong:** Calling `redirect('/dashboard')` inside a `try/catch` block causes the redirect to be caught as a thrown error, preventing navigation.
**Why it happens:** Next.js `redirect()` works by throwing a special error internally. Wrapping in try/catch intercepts it.
**How to avoid:** Call `redirect()` outside of try/catch blocks. Validate and handle errors first, then redirect at the end of the happy path.

```typescript
// WRONG
try {
  const { error } = await supabase.from('qr_codes').insert(data)
  if (error) throw error
  redirect('/dashboard')  // caught by catch block!
} catch (e) { ... }

// CORRECT
const { error } = await supabase.from('qr_codes').insert(data)
if (error?.code === '23505') return { errors: { slug: ['Slug taken'] } }
if (error) return { message: 'Insert failed' }
redirect('/dashboard')  // outside try/catch
```

### Pitfall 3: useActionState requires action signature change

**What goes wrong:** Passing a standard Server Action `(formData: FormData) => ...` to `useActionState` — it will not receive the prevState argument correctly.
**Why it happens:** `useActionState` wraps the action and injects `prevState` as the first argument. The action signature must match `(prevState: State, formData: FormData) => State`.
**How to avoid:** Always define Server Actions that will be used with `useActionState` with the `(prevState, formData)` signature. Separate actions that are used directly (like `deleteQrCode(id)`) can keep simpler signatures.

### Pitfall 4: Supabase anon client for slug-check Route Handler

**What goes wrong:** Using the service role key in the slug-check API route, or not using the user session context.
**Why it happens:** RLS on `qr_codes` — the anon key can only `SELECT WHERE is_active = true` (scanner proxy policy). The slug-check route only needs to check active slugs, so the anon client is correct.
**How to avoid:** Use `createClient()` (anon key) in the slug-check route. Active slug = taken. This correctly prevents users from claiming slugs that are soft-deleted but not yet purged. Verify this is intentional (per project rules: soft delete, never hard delete, so "taken" slugs that are inactive are still logically available for re-use? — see Open Questions).

### Pitfall 5: Missing `revalidatePath` after mutations

**What goes wrong:** After create/edit/delete, the dashboard list shows stale data even though the DB was updated.
**Why it happens:** Next.js 15 aggressively caches Server Component renders. Without `revalidatePath('/dashboard')`, the old cached page is served.
**How to avoid:** Call `revalidatePath('/dashboard')` at the end of every mutation Server Action before redirecting or returning success state.

### Pitfall 6: 40px thumbnail performance — generate once, not per request

**What goes wrong:** Calling `generateQrDataUrl()` for each row on every dashboard page visit causes N QR generation operations per render.
**Why it happens:** QR generation is CPU-bound. For a user with 50 QR codes, this is 50 synchronous canvas operations on every page load.
**How to avoid:** For Phase 3 scope, generate at render time in the Server Component (acceptable for MVP with typical user QR counts under 20). The data URLs can be stored in DB or cached as a future optimization. Do NOT block on this for MVP.

---

## Code Examples

### Creating the qr-list Server Component (dashboard/page.tsx)

```typescript
// Source: established project pattern (scanner page reference)
import { createClient } from '@/lib/supabase/server'
import { generateQrDataUrl } from '@/lib/qr-generator'
import { QrList } from '@/components/dashboard/qr-list'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Generate thumbnails server-side
  const qrsWithImages = await Promise.all(
    (qrCodes ?? []).map(async (qr) => ({
      ...qr,
      dataUrl: await generateQrDataUrl(qr.slug),
    }))
  )

  return (
    <div>
      <PageHeader title="My QR Codes" action={{ label: 'New QR', href: '/dashboard/new' }} />
      {qrsWithImages.length === 0 ? (
        <EmptyState />
      ) : (
        <QrList qrCodes={qrsWithImages} />
      )}
    </div>
  )
}
```

### Soft Delete Action

```typescript
// Source: revalidatePath docs pattern + Supabase RLS requirement
'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function deleteQrCode(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('qr_codes')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
}
```

### AlertDialog Delete Pattern (needs `shadcn add alert-dialog`)

```typescript
// Source: shadcn.io/ui/alert-dialog pattern reference
'use client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteQrCode } from '@/app/dashboard/[id]/edit/actions'

export function DeleteDialog({ id, label }: { id: string; label: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="text-danger hover:text-danger/80">Delete</button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{label}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This QR code will be deactivated. Any printed codes will stop working.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteQrCode(id)}
            className="bg-danger hover:bg-danger/90 text-white"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### qrcode toDataURL with Brand Colors

```typescript
// Source: qrcode npm README (soldair/node-qrcode)
import QRCode from 'qrcode'

const dataUrl = await QRCode.toDataURL('https://fluxqr.app/q/my-slug', {
  errorCorrectionLevel: 'H',
  width: 400,
  margin: 2,
  color: {
    dark: '#0F172A',  // dark module color (RGBA hex — 6-char also works)
    light: '#FFFFFF', // light background color
  },
})
// dataUrl = "data:image/png;base64,iVBORw0KGgo..."
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useFormState` (React 18 / Next 14) | `useActionState` (React 19 / Next 15) | React 19 release | Import from `react`, not `react-dom`. Third return value `pending` replaces need for `useFormStatus` in most cases |
| `params` synchronous in Next.js 14 route handlers | `params` is a Promise in Next.js 15 | Next.js 15 | Must `await params` in dynamic route handlers: `const { id } = await params` |
| `revalidatePath` with no type | `revalidatePath(path)` for specific URLs, `revalidatePath(path, 'page')` for patterns | Next.js 14.2+ | Use specific URL `/dashboard` (no type needed) for the dashboard page |

**Deprecated/outdated:**
- `useFormState`: Renamed to `useActionState` in React 19. The old name may still work but will be removed. This project uses React 19.2.3 — use `useActionState` from `'react'`.
- `formAction` as second return value: In `useActionState`, the order is `[state, formAction, pending]`.

---

## Open Questions

1. **Soft-deleted slugs: available or permanently reserved?**
   - What we know: Project rule says "soft delete only — never hard DELETE". The slug-check Route Handler using the anon client will see `is_active=true` records only. If a slug is soft-deleted, the anon SELECT won't find it, returning `available: true`.
   - What's unclear: Should soft-deleted slugs be re-claimable? The scanner correctly shows an "inactive" page for soft-deleted slugs (Phase 2 handles this via service-role check). If a new user claims the same slug, the old inactive record would coexist with the new active one — the scanner would show the new active one (partial index on `WHERE is_active=true`).
   - Recommendation: Allow re-use of soft-deleted slugs (slug column is not globally unique; partial index on active rows). The slug-check route using anon client naturally implements this. No extra work needed, but the planner should be aware of this behavior.

2. **Where to call `generateQrDataUrl` for large lists?**
   - What we know: Generating server-side is the correct approach (no browser canvas needed). For users with many QR codes, N async calls in `Promise.all` could add latency.
   - What's unclear: No data on expected QR count per user for MVP.
   - Recommendation: `Promise.all` in server component is fine for MVP. Flag for future: store `data_url` or `qr_image_url` in the database to avoid regeneration. Out of scope for Phase 3.

3. **Edit page: is slug editable?**
   - What we know: CONTEXT.md says "platform field is read-only after creation". Requirements say EDIT-01 pre-fills all fields. EDIT-02 only specifically calls out platform as read-only.
   - What's unclear: Whether slug is also read-only on edit (not explicitly mentioned).
   - Recommendation: Treat slug as editable on the edit page (it's not listed as read-only). The update action should include a duplicate-slug check (EDIT-04 confirms this).

---

## Sources

### Primary (HIGH confidence)
- Next.js 16.1.6 official docs (nextjs.org) — verified 2026-03-11
  - Forms guide: `useActionState`, Zod validation, pending state, `redirect()`
  - `revalidatePath` API reference: exact parameter signatures and behavior
  - Route Handler conventions: dynamic params as Promise in Next.js 15
- qrcode npm README (github.com/soldair/node-qrcode) — verified API: `toDataURL`, color.dark/light, errorCorrectionLevel
- Project source files: globals.css (animation keyframes), types/index.ts, lib/utils.ts, components/dashboard/sidebar.tsx (pattern reference)

### Secondary (MEDIUM confidence)
- Supabase PostgreSQL error code `23505` — standard PostgreSQL error code for unique_violation; cross-referenced with Supabase community discussions
- shadcn AlertDialog pattern — shadcn.io/ui/alert-dialog official docs (component not yet installed but follows same pattern as sheet.tsx already in project)

### Tertiary (LOW confidence)
- QR generation performance for large lists — estimated based on general Node.js async patterns; no benchmarks for specific user scale

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — qrcode is the dominant Node.js QR library; all other libs already installed
- Architecture: HIGH — verified against Next.js 15 official docs and existing project patterns
- Pitfalls: HIGH — redirect-in-try-catch and useActionState signature are documented gotchas in Next.js discussions

**Research date:** 2026-03-11
**Valid until:** 2026-06-11 (stable: Next.js, Supabase, qrcode APIs are stable)
