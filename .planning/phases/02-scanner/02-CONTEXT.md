# Phase 2: Scanner - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

The core product: `/q/[slug]` proxy route that fetches a QR record by slug, atomically increments the scan count, and renders a landing page where scanner users can edit a message and tap a CTA to open WhatsApp, SMS, or Telegram. Telegram uses a copy+open fallback. Missing or inactive slugs show branded error pages. Zero auth, zero sidebar, under 10KB JS.

</domain>

<decisions>
## Implementation Decisions

### Scanner landing layout
- Centered card on dark canvas — consistent with login page pattern
- Card structure: label at top, editable message textarea in middle, platform CTA button at bottom
- No FluxQR branding on the scanner page — clean page focused on the QR owner's label and message
- Platform CTA button shows platform icon + text (e.g., WhatsApp icon + "Abrir WhatsApp")
- CTA button uses platform brand color: WhatsApp green (#25D366), Telegram blue (#0088CC), SMS brand-500 indigo

### Message editing behavior
- Textarea pre-filled with the QR owner's default message, fully editable by the scanner user
- When QR has no default message: empty textarea with placeholder text (e.g., "Digite sua mensagem...")
- CTA button disabled when textarea is empty — must have text to proceed
- Hard character limit at 500 characters on the textarea

### Telegram fallback UX
- Two stacked buttons: "Copiar mensagem" (outline/ghost style) above "Abrir Telegram" (Telegram blue)
- Copy confirmation: button text changes to "Mensagem copiada!" with checkmark for 2 seconds, then reverts
- Short hint text above buttons: "O Telegram não suporta mensagens pré-preenchidas. Copie e cole no chat."
- "Copiar mensagem" uses outline/ghost button style — visually subordinate to the primary "Abrir Telegram" CTA

### Not-found / inactive pages
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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase/server.ts`: createClient() for server-side Supabase queries — scanner page fetches QR data server-side
- `src/lib/utils.ts`: cn() for conditional class merging, formatScanCount() for compact notation
- `src/types/index.ts`: Platform and QrCode types — scanner page uses both
- `src/components/ui/button.tsx`: shadcn Button component — CTA and copy buttons
- `src/components/ui/skeleton.tsx`: Loading skeleton if needed during QR fetch
- `src/components/ui/sonner.tsx`: Toast component available (not needed — using button text change for copy confirmation)

### Established Patterns
- Server Components for data fetching (Supabase queries never in client code)
- Dark-only theme with canvas/raised/overlay surface tokens
- Tailwind v4 CSS-first config via globals.css @theme inline
- No Framer Motion — Tailwind keyframes only for animations

### Integration Points
- `src/app/q/[slug]/page.tsx`: New Server Component — fetches QR by slug, renders landing
- `src/app/q/[slug]/scanner-landing.tsx`: New Client Component — textarea editing, copy-to-clipboard, deep link CTA
- `src/lib/redirect.ts`: New file — buildPlatformUrl() for WhatsApp/SMS/Telegram deep links
- `src/components/scanner/telegram-fallback.tsx`: New Client Component — copy+open two-button flow
- RPC `increment_scan_count(qr_slug)` already exists in database — call from server page

</code_context>

<specifics>
## Specific Ideas

- Scanner landing should feel like the business's own page, not a FluxQR product page (no branding)
- Platform CTA buttons should use the messaging app's brand color for instant recognition and trust
- Telegram fallback is a clear two-step process with visual hierarchy: ghost copy button, then solid blue open button
- Error pages are clean dead ends — scanner users came from a QR code, there's nowhere useful to navigate

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-scanner*
*Context gathered: 2026-03-10*
