# Phase 6: Refactor add/edit QR pages into modals with platform choice UX - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Convert the full-page `/dashboard/new` and `/dashboard/[id]/edit` routes into a centered dialog-based flow within the dashboard. Add a two-card QR type grid (Meu QR / Custom QR — same pattern as the public home page) as the first step of the create flow inside the dialog. Remove the old page routes entirely. Does not include new features, analytics, or changes to the public home flow.

</domain>

<decisions>
## Implementation Decisions

### Modal container
- Centered **shadcn Dialog** (not @base-ui, not Sheet)
- Dialog scrolls internally if content overflows on small screens — header/title and submit button (sticky footer) stay pinned
- QR preview dialog stays on @base-ui Dialog (no change to Phase 3.1)

### QR type grid (create flow)
- **Step 1 inside the dialog:** user sees a two-card grid — "Meu QR Code" (default, no custom message) and "Custom QR" (with message field)
- Same visual pattern as `QrTypeGrid` from the public home (`src/components/public/qr-type-grid.tsx`)
- After selecting, the dialog transitions to **Step 2** (the form) with a back arrow to return to the grid
- "Meu QR Code" → form shows Label + Slug + Platform selector + Phone (read-only). **No message field.**
- "Custom QR" → form shows Label + Slug + Platform selector + Phone (read-only) + Message textarea

### Platform selector
- **Kept as-is** — WhatsApp/SMS dropdown Select remains in the form (Step 2)
- Platform selector is in the form, not in the grid step
- Platform field remains read-only on edit (project rule)

### Trigger & navigation
- **Create:** existing "New QR Code" button on dashboard now opens the dialog instead of navigating to `/dashboard/new`
- **Edit:** existing edit icon on QrListRow opens the same dialog, pre-filled with QR data, directly on Step 2 (form) — no grid step on edit since type is already defined
- Old routes `/dashboard/new` and `/dashboard/[id]/edit` are **removed completely** (pages, actions files, directories)

### Post-action behavior
- **After create:** dialog closes, `router.refresh()` revalidates the list, toast "QR criado com sucesso"
- **After edit:** dialog closes, `router.refresh()` revalidates the list, toast "QR atualizado", row pulse animation (existing behavior preserved)

### Data loading
- **Edit:** QR data passed directly from QrListRow to the dialog — no server fetch, instant open
- After save, `router.refresh()` revalidates from server

### Server Actions refactor
- **Refactor** existing create/update actions to return `{ success: true }` instead of `redirect()` — client handles dialog close + router.refresh() based on result
- Actions move to **`src/app/dashboard/qr-actions.ts`** (new file, separate from `actions.ts` which has signOut)
- Delete action stays as-is (already works from the list via DeleteDialog)

### Carried from prior phases
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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/public/qr-type-grid.tsx`: QrTypeGrid with "My QR Code" / "Custom QR" cards — adapt or reuse for dashboard dialog Step 1
- `src/components/qr-management/qr-form.tsx`: QrForm handling both create/edit modes — refactor for dialog context (no redirect, return result)
- `src/components/qr-management/platform-selector.tsx`: PlatformSelector (WhatsApp/SMS dropdown) — reuse as-is
- `src/components/qr-management/slug-input.tsx`: SlugInput with debounced validation — reuse as-is
- `src/components/dashboard/phone-verify-dialog.tsx`: Phone verification dialog — still used in form if phone not verified
- `src/components/ui/dialog.tsx`: shadcn Dialog already installed — use for form dialog
- `src/hooks/use-slug-check.ts`: Debounced slug availability hook — reuse as-is
- `src/components/ui/sonner.tsx`: Toast notifications — use for success feedback

### Established Patterns
- Server Components for data fetching, Client Components for interactivity
- Server Actions with `'use server'` for mutations
- `useActionState` for form submission state management
- `router.refresh()` for server-side revalidation after mutations
- Tailwind v4 CSS-first config via globals.css @theme inline

### Integration Points
- `src/app/dashboard/page.tsx`: Dashboard page — "New QR Code" button changes from Link to dialog trigger
- `src/components/dashboard/qr-list-row.tsx`: Edit button changes from Link to dialog trigger, passes QR data to dialog
- `src/components/dashboard/qr-list.tsx`: May need to hoist dialog state or render dialog
- `src/app/dashboard/qr-actions.ts`: New file — migrated create/update actions returning result instead of redirect
- **Remove:** `src/app/dashboard/new/` directory (page.tsx + actions.ts)
- **Remove:** `src/app/dashboard/[id]/` directory (edit/page.tsx + edit/actions.ts)

</code_context>

<specifics>
## Specific Ideas

- The QR type grid inside the dialog should feel exactly like the public home's QrTypeGrid — same two-card layout with icons, same visual language
- Step transition within the dialog: grid → form (with back arrow) should feel smooth and intentional
- Edit skips the grid entirely — goes straight to the form since the QR type is already set

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-refactor-add-edit-qr-pages-into-modals-with-platform-choice-ux*
*Context gathered: 2026-03-12*
