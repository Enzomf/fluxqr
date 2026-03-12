# Phase 6: Refactor add/edit QR pages into modals with platform choice UX - Research

**Researched:** 2026-03-12
**Domain:** Next.js App Router modal patterns, React 19 dialog state, Server Action refactor
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Modal container
- Centered **shadcn Dialog** (not @base-ui, not Sheet)
- Dialog scrolls internally if content overflows on small screens — header/title and submit button (sticky footer) stay pinned
- QR preview dialog stays on @base-ui Dialog (no change to Phase 3.1)

#### QR type grid (create flow)
- **Step 1 inside the dialog:** user sees a two-card grid — "Meu QR Code" (default, no custom message) and "Custom QR" (with message field)
- Same visual pattern as `QrTypeGrid` from the public home (`src/components/public/qr-type-grid.tsx`)
- After selecting, the dialog transitions to **Step 2** (the form) with a back arrow to return to the grid
- "Meu QR Code" → form shows Label + Slug + Platform selector + Phone (read-only). **No message field.**
- "Custom QR" → form shows Label + Slug + Platform selector + Phone (read-only) + Message textarea

#### Platform selector
- **Kept as-is** — WhatsApp/SMS dropdown Select remains in the form (Step 2)
- Platform selector is in the form, not in the grid step
- Platform field remains read-only on edit (project rule)

#### Trigger & navigation
- **Create:** existing "New QR Code" button on dashboard now opens the dialog instead of navigating to `/dashboard/new`
- **Edit:** existing edit icon on QrListRow opens the same dialog, pre-filled with QR data, directly on Step 2 (form) — no grid step on edit since type is already defined
- Old routes `/dashboard/new` and `/dashboard/[id]/edit` are **removed completely** (pages, actions files, directories)

#### Post-action behavior
- **After create:** dialog closes, `router.refresh()` revalidates the list, toast "QR criado com sucesso"
- **After edit:** dialog closes, `router.refresh()` revalidates the list, toast "QR atualizado", row pulse animation (existing behavior preserved)

#### Data loading
- **Edit:** QR data passed directly from QrListRow to the dialog — no server fetch, instant open
- After save, `router.refresh()` revalidates from server

#### Server Actions refactor
- **Refactor** existing create/update actions to return `{ success: true }` instead of `redirect()` — client handles dialog close + router.refresh() based on result
- Actions move to **`src/app/dashboard/qr-actions.ts`** (new file, separate from `actions.ts` which has signOut)
- Delete action stays as-is (already works from the list via DeleteDialog)

#### Carried from prior phases
- Server Actions for all mutations (Phase 1)
- Platform field read-only after creation (project rule)
- Soft delete only — is_active = false, never hard DELETE (project rule)
- Dark-only theme with canvas/raised/overlay surface tokens (Phase 1)
- No Framer Motion — Tailwind keyframes only (project rule)
- Phone verification required before QR creation (Phase 5)
- Verified phone displayed as read-only chip in form (Quick task 4, 5)

### Claude's Discretion
- Dialog width and max-height values
- Step transition animation between grid and form (if any — Tailwind keyframes only)
- Back arrow styling in Step 2
- Form field arrangement within the dialog
- How to share the QrForm component between create/edit or whether to split it
- Toast message wording

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

## Summary

Phase 6 converts two full-page routes (`/dashboard/new` and `/dashboard/[id]/edit`) into a single centered dialog-based flow using the existing shadcn `Dialog` component already installed at `src/components/ui/dialog.tsx`. The dialog is built on `@base-ui/react/dialog` primitives (which the project already uses for the QR preview dialog), though the decision is to use the shadcn-wrapped version (not raw @base-ui) for this modal.

The create flow is a two-step dialog: Step 1 is the QR type grid (reusing `src/components/public/qr-type-grid.tsx`'s visual pattern), Step 2 is the existing `QrForm` adapted for dialog context. Edit skips Step 1 entirely, opening directly on Step 2 pre-filled with QR data passed from `QrListRow`. The key server-side change is removing `redirect()` from both `createQrCode` and `updateQrCode` actions and instead returning `{ success: true }` so the client can close the dialog and call `router.refresh()`.

The most important architectural insight is where to hoist state: because both `QrListRow` (edit trigger) and `DashboardPage` header (create trigger) need to open the same dialog, the dialog state should live in `QrList` (which renders all rows) or be pushed into a new wrapper component that `DashboardPage` renders alongside `QrList`. The `QrListRow` → dialog path requires passing the QR record up from the row to the shared dialog.

**Primary recommendation:** Create a single `QrFormDialog` component in `components/qr-management/` that accepts an optional `qr` prop (for edit pre-fill) and an `open`/`onOpenChange` controlled interface. Hoist dialog open state to `QrList`, which becomes the orchestrator for both create (triggered from `DashboardPage` via a callback prop) and edit (triggered from `QrListRow` via callback). Migrate the Server Actions to `src/app/dashboard/qr-actions.ts` with `{ success: true }` returns before wiring up the client.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @base-ui/react (via shadcn Dialog) | Already installed | Modal container, backdrop, focus trap, accessibility | Project-wide UI primitive, already used for PhoneVerifyDialog and QrPreviewDialog |
| React `useActionState` (React 19) | Built-in | Form state + pending management with Server Actions | Already used in QrForm — no change to pattern |
| `useRouter` / `router.refresh()` | Next.js 15 built-in | Revalidate server data after dialog closes | Already established in QrList and QrForm |
| `sonner` (via `src/components/ui/sonner.tsx`) | Already installed | Toast notifications after create/edit | Already used by QrList for edit success toast |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS v4 keyframes | Already configured | Step transition animation (grid → form) | Only if slide-in/slide-out desired; existing `slide-up` keyframe may suffice |
| `lucide-react` (ArrowLeft) | Already installed | Back arrow icon in Step 2 of create dialog | Reuse same `ArrowLeft` icon from old page routes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn Dialog | @base-ui Dialog directly | Locked decision — shadcn wrapper is the choice |
| Single QrFormDialog component | Separate CreateDialog + EditDialog | Single component avoids duplication but needs mode-aware internal logic |
| State hoisted to QrList | State hoisted to DashboardPage | QrList already owns row state; DashboardPage is a Server Component and cannot own open state directly |

**Installation:** No new packages needed. All dependencies already installed.

---

## Architecture Patterns

### Recommended Project Structure (changes only)

```
src/
├── app/
│   └── dashboard/
│       ├── page.tsx                 # MODIFIED: PageHeader action → button callback, pass openCreate prop
│       ├── actions.ts               # UNCHANGED: signOut only
│       ├── qr-actions.ts            # NEW: createQrCode + updateQrCode returning { success: true }
│       ├── new/                     # DELETED entirely
│       └── [id]/edit/               # DELETED entirely (actions.ts deleteQrCode migrated first)
├── components/
│   ├── qr-management/
│   │   ├── qr-form-dialog.tsx       # NEW: QrFormDialog — Dialog shell + step state
│   │   └── qr-form.tsx              # MODIFIED: remove redirect dependency, adapt for dialog
│   ├── dashboard/
│   │   ├── qr-list.tsx              # MODIFIED: own dialog open state, hoist edit trigger
│   │   └── qr-list-row.tsx          # MODIFIED: edit button → callback, not Link
│   └── shared/
│       └── page-header.tsx          # MODIFIED: action prop extended to support onClick callback
```

### Pattern 1: Controlled Dialog with Step State

**What:** A single Client Component owns the dialog open state and the current step (`'grid' | 'form'`). Create flow starts at `'grid'`; edit flow starts at `'form'` with pre-filled data. Back arrow sets step back to `'grid'`.

**When to use:** Multi-step flows inside a single dialog where each step is rendered conditionally.

**Example:**
```typescript
// src/components/qr-management/qr-form-dialog.tsx
'use client'

type DialogStep = 'grid' | 'form'

interface QrFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qr?: QrCodeWithImage | null     // if provided = edit mode (skip grid)
  verifiedPhone: string | null    // passed from parent Server Component via QrList
}

export function QrFormDialog({ open, onOpenChange, qr, verifiedPhone }: QrFormDialogProps) {
  const isEdit = !!qr
  const [step, setStep] = useState<DialogStep>(isEdit ? 'form' : 'grid')
  const [qrType, setQrType] = useState<'default' | 'custom'>('default')

  // Reset on close
  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      setStep(isEdit ? 'form' : 'grid')
      setQrType('default')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {/* Back arrow only shown on Step 2 of create flow */}
          {step === 'form' && !isEdit && (
            <button onClick={() => setStep('grid')}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <DialogTitle>{isEdit ? `Edit: ${qr.label}` : 'New QR Code'}</DialogTitle>
        </DialogHeader>

        {step === 'grid' && (
          <QrTypeGrid
            onSelect={(type) => {
              setQrType(type)
              setStep('form')
            }}
          />
        )}

        {step === 'form' && (
          <QrForm
            action={isEdit ? updateAction : createAction}
            defaultValues={qr ?? undefined}
            mode={isEdit ? 'edit' : 'create'}
            qrType={qrType}
            verifiedPhone={verifiedPhone}
            onSuccess={() => handleOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
```

### Pattern 2: State Hoisting — QrList as Dialog Orchestrator

**What:** `QrList` (already a Client Component) holds `dialogOpen: boolean` and `editingQr: QrCodeWithImage | null`. Create is triggered by a callback passed down from `DashboardPage`. Edit is triggered by `QrListRow` via an `onEdit` callback.

**When to use:** When a dialog needs to be triggered from multiple sibling/parent locations, hoist state to the nearest common ancestor.

**Key insight:** `DashboardPage` is a Server Component and cannot hold dialog open state. The solution is to pass a callback-based `action` to `PageHeader` so the "New QR" button in the header becomes a `<button onClick={...}>` instead of a `<Link href="...">`. Because `DashboardPage` is a Server Component it cannot pass down an onClick function directly — the `QrList` component must render its own "New QR" button, OR `DashboardPage` renders a new thin Client Component wrapper.

**Recommended approach:** Create a `DashboardClient` wrapper or extend `QrList` to also accept a `verifiedPhone` prop and render the "New QR" button itself, removing the `PageHeader action` prop dependency.

Alternative: Keep `PageHeader` but change its `action` prop to support `onClick` (making PageHeader itself need to become or accept a client-side handler). Since PageHeader is a Server Component with no interactivity today, the cleanest approach is to render the "New QR" trigger button inline inside `QrList` (at the top), eliminating the `PageHeader action` prop entirely for the dashboard.

**Example:**
```typescript
// src/components/dashboard/qr-list.tsx
'use client'

export function QrList({ qrCodes, verifiedPhone }: QrListProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQr, setEditingQr] = useState<QrCodeWithImage | null>(null)

  function openCreate() {
    setEditingQr(null)
    setDialogOpen(true)
  }

  function openEdit(qr: QrCodeWithImage) {
    setEditingQr(qr)
    setDialogOpen(true)
  }

  return (
    <>
      {/* "New QR" button rendered here, not in PageHeader */}
      <button onClick={openCreate}>New QR Code</button>

      <div className="space-y-2">
        {qrCodes.map((qr) => (
          <QrListRow key={qr.id} qr={qr} onDelete={deleteQrCode} onEdit={openEdit} pulseId={pulseId} />
        ))}
      </div>

      <QrFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        qr={editingQr}
        verifiedPhone={verifiedPhone}
      />
    </>
  )
}
```

### Pattern 3: Server Action → Result Pattern (no redirect)

**What:** Server Actions for create/update return `{ success: boolean, errors?: ..., message?: string }` instead of calling `redirect()`. Client detects success and calls `router.refresh()` + closes dialog.

**When to use:** Any dialog-hosted form where redirect would navigate away instead of closing the modal.

**Example:**
```typescript
// src/app/dashboard/qr-actions.ts
'use server'

export type FormState = {
  success?: boolean
  errors?: { [field: string]: string[] }
  message?: string | null
}

export async function createQrCode(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // ... validation + supabase insert unchanged ...

  if (error) { /* handle */ }

  revalidatePath('/dashboard')
  return { success: true }  // no redirect()
}
```

```typescript
// In QrForm (or QrFormDialog), detect success:
const [state, formAction, pending] = useActionState(action, { errors: {} })
const router = useRouter()

useEffect(() => {
  if (state.success) {
    router.refresh()
    onSuccess?.()  // closes dialog
    toast.success(mode === 'create' ? 'QR criado com sucesso' : 'QR atualizado')
  }
}, [state.success])
```

### Pattern 4: Row Pulse Preservation After Edit

**What:** The existing pulse animation (`animate-qr-pulse` on `QrPulseWrapper`) triggers based on `pulseId === qr.id` in `QrListRow`. Currently `pulseId` comes from `?success=edit&id=...` query params. After switching to dialog, the redirect-based mechanism is gone — pulse must be managed via state instead.

**When to use:** Always — the pulse UX is a locked behavior requirement.

**Example:**
```typescript
// In QrList, track pulseId as state:
const [pulseId, setPulseId] = useState<string | null>(null)

// In QrFormDialog onSuccess callback:
onSuccess(editedId?: string) {
  router.refresh()
  if (editedId) setPulseId(editedId)
  toast.success('QR atualizado')
}

// Clear pulse after animation completes:
useEffect(() => {
  if (pulseId) {
    const t = setTimeout(() => setPulseId(null), 700) // qr-pulse is 0.6s
    return () => clearTimeout(t)
  }
}, [pulseId])
```

The QrList currently reads `pulseId` from `useSearchParams()`. After this refactor, that `useSearchParams` usage can be removed entirely (the `?success=edit&id=...` pattern is obsoleted).

### Anti-Patterns to Avoid

- **Calling `redirect()` inside a Server Action invoked from a dialog form:** In App Router, `redirect()` triggers a navigation that closes the dialog by navigating the page away. Return `{ success: true }` instead and let the client handle close + refresh.
- **Fetching QR data server-side when opening edit dialog:** The context decision is to pass QR data from `QrListRow` directly (the row already has the data). Do not add a new server fetch.
- **Placing dialog open state in `DashboardPage` (Server Component):** Server Components cannot hold state or pass event handlers. State must live in a Client Component.
- **Keeping `useSearchParams` for pulse after removing query-param-based navigation:** The `?success=edit&id=...` pattern will no longer exist. Remove the `useSearchParams` usage from `QrList` and replace with local state.
- **Importing `FormState` from the old actions files after deletion:** Update the import in `qr-form.tsx` from `@/app/dashboard/new/actions` to `@/app/dashboard/qr-actions`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Focus trap in dialog | Custom focus management | shadcn Dialog (built on @base-ui) | @base-ui handles ARIA modal, focus lock, and Escape key automatically |
| Dialog backdrop / overlay | Custom fixed-position overlay div | shadcn `DialogOverlay` | Already handles z-index, backdrop blur, and open/close animations |
| Step transition animation | Complex CSS animation system | Tailwind `animate-slide-up` keyframe (already defined in globals.css) | The existing `slide-up` keyframe provides subtle entrance on step change; no new keyframe needed |
| Toast notifications | Custom toast state | `sonner` via `toast.success()` | Already wired in the project |
| Form pending/error state | Custom form state machine | `useActionState` (React 19) | Already used in `QrForm` |

---

## Common Pitfalls

### Pitfall 1: Dialog content re-mounting on open/close resets form state
**What goes wrong:** `useActionState` state (validation errors) survives between open/close cycles if the component is not unmounted. Conversely, if the dialog content is always mounted (not conditional), form state from a previous submission lingers when the dialog re-opens.
**Why it happens:** shadcn Dialog with `@base-ui` root by default keeps content in the DOM when closed (for animation). If the form stays mounted, `useActionState` state does not reset.
**How to avoid:** Either unmount dialog content when closed (render children conditionally based on `open` prop, not inside the Portal), or call `router.refresh()` which does reset some derived state. Alternatively, use a `key={dialogOpen ? 'open' : 'closed'}` prop on the form to force re-mount on each open.
**Warning signs:** Old validation errors visible when re-opening a fresh create dialog.

### Pitfall 2: `redirect()` still called in old actions imported elsewhere
**What goes wrong:** If `deleteQrCode` is imported from `src/app/dashboard/[id]/edit/actions.ts` in `qr-list.tsx`, deleting those old action files breaks the build.
**Why it happens:** `QrList` currently imports `deleteQrCode` from the edit actions file. This import must be migrated to `qr-actions.ts` (or kept in a separate `delete-actions.ts`) before deleting the old directory.
**How to avoid:** Migrate `deleteQrCode` to the new `qr-actions.ts` first, update `QrList`'s import, verify build, then delete old directory.
**Warning signs:** TypeScript build error: "Cannot find module '@/app/dashboard/[id]/edit/actions'".

### Pitfall 3: `verifiedPhone` unavailable in the Client Component dialog
**What goes wrong:** `QrFormDialog` and `QrForm` need `verifiedPhone` to render the read-only phone chip and gate the submit button. This value comes from a Supabase profiles query, which must run in a Server Component.
**Why it happens:** The dialog is a Client Component; it cannot run server queries.
**How to avoid:** `DashboardPage` (Server Component) fetches `verifiedPhone` once during page load and passes it as a prop to `QrList` → `QrFormDialog` → `QrForm`. After an in-dialog phone verification, `router.refresh()` already refreshes the page and re-renders `DashboardPage` with the updated phone.
**Warning signs:** `verifiedPhone` is always `null` inside the dialog even after verification.

### Pitfall 4: `QrTypeGrid` description text mismatch (public vs dashboard)
**What goes wrong:** The existing `QrTypeGrid` in `src/components/public/qr-type-grid.tsx` has descriptions tailored to the public home ("Default WhatsApp QR for your verified number. No custom message."). In the dashboard context, the platform is chosen by the user (it's a selector), so the description "Default WhatsApp QR" is misleading.
**Why it happens:** The public grid assumes WhatsApp as the default platform (public flow creates WhatsApp-only QRs). The dashboard flow allows WhatsApp or SMS choice.
**How to avoid:** Either adapt the dashboard dialog to use a copy of `QrTypeGrid` with dashboard-appropriate descriptions, or pass description text as props. Do NOT hand-edit the source `QrTypeGrid` if the public home still relies on its current copy.
**Warning signs:** Card says "Default WhatsApp QR" but the platform selector below shows SMS as the selected option.

### Pitfall 5: `PageHeader` action prop renders a `<Link>` but dialog needs a `<button onClick>`
**What goes wrong:** The current `PageHeader` action prop only accepts `{ label, href }` and renders a `<Link>`. A dialog trigger needs an `onClick` handler, not navigation.
**Why it happens:** `PageHeader` was designed for page-nav CTAs, not dialog triggers.
**How to avoid:** Either extend `PageHeader` to accept `action.onClick` as an alternative to `action.href`, or move the "New QR" button out of `PageHeader` and into `QrList` (the recommended approach — cleaner separation since `QrList` already owns dialog state).
**Warning signs:** Clicking "New QR" navigates to `/dashboard/new` (404 after route deletion) instead of opening the dialog.

### Pitfall 6: Row pulse animation broken because query params approach is removed
**What goes wrong:** After removing the `redirect('/dashboard?success=edit&id=...')` pattern, `QrList`'s `useSearchParams` returns `null` for `success` and `id`, so the pulse never fires and the "edit success" toast from `useEffect` is never triggered.
**Why it happens:** The pulse was coupled to URL-based navigation signaling.
**How to avoid:** Replace `useSearchParams`-based pulse with local `pulseId` state in `QrList`, set by the `onSuccess` callback from the dialog. Clear it after the animation duration (600ms).
**Warning signs:** No green pulse on the edited row after save; no "QR atualizado" toast.

---

## Code Examples

### shadcn Dialog with internal scroll (sticky header + footer)
```typescript
// Source: component pattern for the project's existing DialogContent in src/components/ui/dialog.tsx
// Use `max-h-[90vh] overflow-y-auto` on DialogContent
// Sticky header: DialogHeader with sticky top-0 and background
// Sticky footer: DialogFooter with sticky bottom-0 and background

<DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh] p-0 gap-0">
  {/* Sticky header */}
  <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4 rounded-t-xl">
    <DialogTitle>New QR Code</DialogTitle>
  </div>

  {/* Scrollable body */}
  <div className="flex-1 overflow-y-auto px-6 py-4">
    {/* Step content here */}
  </div>

  {/* Sticky footer with submit */}
  <div className="sticky bottom-0 z-10 bg-background border-t border-border px-6 py-4 rounded-b-xl">
    <Button type="submit" form="qr-form">Create QR Code</Button>
  </div>
</DialogContent>
```

### useActionState with success detection and dialog close
```typescript
// Pattern used in QrForm, adapted for dialog context
'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function QrForm({ action, mode, onSuccess, ... }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(action, { errors: {} })

  useEffect(() => {
    if (state.success) {
      router.refresh()
      onSuccess?.()
      toast.success(mode === 'create' ? 'QR criado com sucesso' : 'QR atualizado')
    }
  }, [state.success, router, mode, onSuccess])

  return <form id="qr-form" action={formAction}>...</form>
}
```

### Server Action returning success instead of redirect
```typescript
// src/app/dashboard/qr-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type FormState = {
  success?: boolean
  errors?: { [field: string]: string[] }
  message?: string | null
}

export async function createQrCode(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // ... validation + auth + insert (unchanged from current) ...
  if (error) {
    if (error.code === '23505') return { errors: { slug: ['This slug is already taken'] } }
    return { message: 'Failed to create QR code. Please try again.' }
  }
  revalidatePath('/dashboard')
  return { success: true }  // key change: was redirect('/dashboard')
}

export async function updateQrCode(
  id: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // ... validation + auth + update (unchanged) ...
  revalidatePath('/dashboard')
  return { success: true, id }  // key change: was redirect('/dashboard?success=edit&id=...')
}
```

### Passing verifiedPhone from Server Component through the chain
```typescript
// src/app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: qrCodes }, { data: profile }] = await Promise.all([
    supabase.from('qr_codes').select('*').eq('user_id', user!.id).eq('is_active', true).order('created_at', { ascending: false }),
    supabase.from('profiles').select('phone_number').eq('id', user!.id).single(),
  ])
  const verifiedPhone = profile?.phone_number ?? null

  // ... generate images ...

  return (
    <div className="space-y-6">
      <PageHeader title="My QR Codes" />  {/* no action prop — QrList owns the button */}
      <QrList qrCodes={qrsWithImages} verifiedPhone={verifiedPhone} />
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Full-page form routes (`/new`, `/[id]/edit`) | Dialog-hosted forms | Phase 6 | No page navigation for CRUD; stays in dashboard context |
| URL query param signaling (`?success=edit&id=...`) for pulse/toast | Local state in `QrList` | Phase 6 | `useSearchParams` removed from `QrList`; pulse driven by state |
| `redirect()` in Server Actions | Return `{ success: true }` | Phase 6 | Client-side dialog close + `router.refresh()` pattern |
| `FormState` imported from `new/actions.ts` | Imported from `qr-actions.ts` | Phase 6 | Consolidates action types in one place |

**Deprecated/outdated after this phase:**
- `src/app/dashboard/new/` — entire directory removed
- `src/app/dashboard/[id]/edit/` — entire directory removed
- `useSearchParams` usage in `QrList` for `success`/`id` params — replaced by local state
- `PageHeader action.href` prop usage in dashboard — "New QR" button moves into `QrList`

---

## Open Questions

1. **QrTypeGrid copy vs. reuse for dashboard context**
   - What we know: The public `QrTypeGrid` has descriptions specific to the public flow ("Default WhatsApp QR..."). The dashboard grid needs platform-agnostic descriptions since platform is chosen in Step 2.
   - What's unclear: Whether to modify the public component to accept description props, or create a separate `DashboardQrTypeGrid` component.
   - Recommendation: Create a lightweight copy in `components/qr-management/qr-type-select.tsx` with dashboard-appropriate copy ("No custom message" / "With custom message"). Avoids coupling the public and dashboard flows.

2. **Where exactly does the "New QR Code" button live after PageHeader action removal**
   - What we know: `DashboardPage` is a Server Component; it can't own dialog state. `QrList` is already a Client Component.
   - What's unclear: Whether to keep `PageHeader` with an extended `action.onClick` prop (requiring PageHeader to become a Client Component) or move the button entirely into `QrList`.
   - Recommendation: Move the "New QR Code" button into `QrList`'s render (above the list rows). This keeps `PageHeader` a simple Server Component and `QrList` as the single orchestrator of dialog state. `DashboardPage` removes the `action` prop from `PageHeader` entirely.

3. **Form `key` prop strategy for useActionState reset**
   - What we know: `useActionState` does not reset on dialog close unless the component unmounts.
   - What's unclear: Whether the project's `@base-ui` Dialog implementation unmounts content on close or keeps it in the DOM.
   - Recommendation: Pass `key={dialogOpen ? editingQr?.id ?? 'create' : 'closed'}` to `QrFormDialog` or the inner `QrForm` to force re-mount on each dialog open. Alternatively, use a `resetKey` state incremented on open.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — project uses Node.js assert with tsx runner (per STATE.md) |
| Config file | None — ad-hoc per-file |
| Quick run command | `pnpm tsc --noEmit` (type check) |
| Full suite command | `pnpm tsc --noEmit && pnpm lint` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MODAL-01 | Dialog opens when "New QR Code" clicked | manual-only | — | N/A |
| MODAL-02 | Step 1 grid renders two cards; selecting advances to Step 2 | manual-only | — | N/A |
| MODAL-03 | Back arrow returns from Step 2 to Step 1 | manual-only | — | N/A |
| MODAL-04 | Edit click opens dialog on Step 2 pre-filled, skipping grid | manual-only | — | N/A |
| MODAL-05 | Create action returns `{ success: true }`, no redirect | `pnpm tsc --noEmit` (type check ensures signature) | ✅ Wave 0 |
| MODAL-06 | After create: dialog closes, list reloads, toast fires | manual-only | — | N/A |
| MODAL-07 | After edit: dialog closes, row pulses, toast fires | manual-only | — | N/A |
| MODAL-08 | Old routes `/dashboard/new` and `/dashboard/[id]/edit` 404 | manual-only | — | N/A |

Note: This phase is a UI refactor with no new business logic beyond the Server Action signature change. All correctness verification is manual (visual + interaction) or caught by TypeScript compilation.

### Sampling Rate
- **Per task commit:** `pnpm tsc --noEmit`
- **Per wave merge:** `pnpm tsc --noEmit && pnpm lint`
- **Phase gate:** Full type check + lint green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No test infrastructure gaps — existing type-check + lint covers the machine-verifiable surface. Manual verification checklist to be defined in VERIFICATION.md.

---

## Sources

### Primary (HIGH confidence)
- Source code audit: `src/components/ui/dialog.tsx` — confirmed shadcn Dialog is built on `@base-ui/react/dialog`, already installed with full `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle` API
- Source code audit: `src/components/public/qr-type-grid.tsx` — confirmed component exists, uses `QrCode` + `MessageSquare` icons, two-button grid pattern
- Source code audit: `src/app/dashboard/new/actions.ts` + `src/app/dashboard/[id]/edit/actions.ts` — confirmed both use `redirect()` today; change required
- Source code audit: `src/components/dashboard/qr-list.tsx` — confirmed imports `deleteQrCode` from old edit actions; migration needed before old directory deletion
- Source code audit: `src/app/globals.css` — confirmed existing `slide-up` keyframe available for step transitions; no new keyframe needed
- Source code audit: `src/components/shared/page-header.tsx` — confirmed current `action` prop is `{ label, href }` Link only; needs extension or removal for dialog trigger

### Secondary (MEDIUM confidence)
- React 19 `useActionState` docs pattern: success detection via `useEffect` watching `state.success` — standard pattern used throughout codebase
- Next.js App Router docs: `router.refresh()` triggers Server Component re-render without full navigation — confirmed by existing usage in `QrForm` and `PhoneVerifyDialog`

### Tertiary (LOW confidence)
- shadcn Dialog `max-h` + internal scroll sticky header/footer pattern: recommended approach based on general Tailwind/CSS knowledge; exact class combination should be verified during implementation.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project, confirmed by source audit
- Architecture patterns: HIGH — patterns derived directly from existing code; no speculation
- Pitfalls: HIGH — identified by direct code analysis (import chains, state patterns, existing behavior)
- Discretionary recommendations: MEDIUM — dialog width/animation are judgment calls within locked constraints

**Research date:** 2026-03-12
**Valid until:** Stable — all dependencies are already installed and project-specific
