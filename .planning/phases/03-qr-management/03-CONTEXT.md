# Phase 3: QR Management - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Dashboard CRUD for creating, editing, deleting, and downloading QR codes. Owners manage their QR codes from `/dashboard` with routes at `/dashboard/new` (create) and `/dashboard/[id]/edit` (edit). Includes QR image generation, PNG download, scan count display, and empty state. Does not include analytics charts, scan history, or production deployment.

</domain>

<decisions>
## Implementation Decisions

### QR preview & download
- No live QR preview during creation — user sees QR for the first time on the dashboard list
- Dashboard list shows 40px QR thumbnail per row — compact, data-dense layout
- Download button lives on the list row alongside Edit/Delete — one-click PNG download, no extra navigation
- QR image uses brand colors: #0F172A (canvas dark) modules on white background
- High error correction level for reliable scanning
- Download filename: `{slug}-fluxqr.png` (per GEN-03)

### Carried from prior phases
- "Create new" action is a page-level button in dashboard header, not a sidebar link (Phase 1)
- Server Actions for all mutations (Phase 1)
- Soft delete only — is_active = false, never hard DELETE (project rule)
- Platform field read-only after creation (project rule)
- Dark-only theme with canvas/raised/overlay surface tokens (Phase 1)

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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/utils.ts`: `cn()` for class merging, `formatScanCount()` for compact notation (1.2k)
- `src/types/index.ts`: `Platform` and `QrCode` types — used across all CRUD operations
- `src/lib/supabase/server.ts`: `createClient()` for server-side Supabase queries
- `src/components/ui/button.tsx`: shadcn Button — CTAs, icon buttons, form submit
- `src/components/ui/skeleton.tsx`: Loading skeletons for list and form states
- `src/components/ui/sonner.tsx`: Toast notifications for success/error feedback
- `src/components/ui/sheet.tsx`: Slide-out panel (used in sidebar, available for other uses)
- `src/components/ui/separator.tsx`: Visual dividers
- `src/app/dashboard/actions.ts`: `signOut()` Server Action — pattern reference for new actions

### Established Patterns
- Server Components for data fetching, Client Components only for interactivity
- Server Actions with `'use server'` for mutations (signOut as reference)
- Tailwind v4 CSS-first config via globals.css @theme inline
- No Framer Motion — Tailwind keyframes only for animations (pulse, transitions)
- `@/*` path alias for imports

### Integration Points
- `src/app/dashboard/page.tsx`: Stub page — needs QR list with data fetching
- `src/app/dashboard/new/page.tsx`: New create form page
- `src/app/dashboard/new/actions.ts`: New Server Action for QR creation
- `src/app/dashboard/[id]/edit/page.tsx`: New edit form page
- `src/app/dashboard/[id]/edit/actions.ts`: New Server Actions for update and soft delete
- `src/app/api/slug-check/route.ts`: New API route for debounced slug availability check
- `src/components/qr-management/`: New directory for form, slug input, platform selector, delete dialog
- `src/components/qr-generation/`: New directory for QR image component
- `src/components/shared/`: New directory for page-header, platform-badge, empty-state, app-button
- `src/hooks/use-slug-check.ts`: New hook for debounced slug validation
- `src/hooks/use-qr-image.ts`: New hook for QR image data URL generation
- `src/lib/qr-generator.ts`: New file for QR generation logic (generateQrDataUrl, downloadQrPng)

</code_context>

<specifics>
## Specific Ideas

- List rows should be compact and data-dense — 40px thumbnail, all key info at a glance
- Download is a fast action from the list — no need to navigate to a detail/edit page just to download
- QR colors match brand identity on printed materials — dark slate on white, not generic black

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-qr-management*
*Context gathered: 2026-03-11*
