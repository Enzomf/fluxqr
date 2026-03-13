# Phase 9: Add PWA Support for Installable Application - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Make FluxQR installable as a native-like app on mobile and desktop via PWA standards — web app manifest, service worker, app icons, and install experience. No new features or UI changes beyond PWA infrastructure and offline fallback.

</domain>

<decisions>
## Implementation Decisions

### Offline behavior
- Show a branded "You're offline" page when the user has no connection — FluxQR logo, message, manual "Try again" button
- Cache static assets (JS bundles, CSS, fonts, images) via service worker for faster repeat loads
- Scanner page (`/q/[slug]`) has NO offline capability — always requires server fetch
- No dashboard data caching — offline means offline page, not stale data

### Install experience
- Browser native install prompts only — no custom install banner or sidebar button
- Whole app is installable (any page can trigger install, manifest covers entire domain)
- App name: "FluxQR" (short_name: "FluxQR")
- Auto-generated splash screen from manifest icon + name + background_color — no custom splash images

### App icons & branding
- Generate 192x192 and 512x512 PNG icon variants from existing `public/logo.png`
- Add maskable icon variant with safe-zone padding
- `theme_color`: brand indigo `#6366F1` (browser toolbar and task switcher)
- `background_color`: dark canvas `#0F172A` (splash screen, matches app background — no white flash)
- Include Apple-specific meta tags in layout.tsx: `apple-touch-icon`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`

### Scope & navigation
- Display mode: `standalone` (hides browser address bar, native feel)
- `start_url`: `/` (home page — matches current default route after login)
- External links (wa.me, sms: deep links) open in system browser / native app (default standalone behavior)
- Orientation: `portrait` only

### Claude's Discretion
- Service worker implementation approach (next-pwa, serwist, or manual)
- Exact caching strategy details (cache-first vs network-first for different asset types)
- Offline page styling and layout details
- Icon generation tooling
- Manifest file approach (Next.js metadata API `manifest.ts` vs static `manifest.json`)

</decisions>

<specifics>
## Specific Ideas

- Scanner page must stay under 10KB JS — service worker must not add bundle weight to `/q/[slug]`
- App is dark-only — no light mode considerations for theme/splash
- The current default route after login is `/` (not `/dashboard`) — start_url aligns with this

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `public/logo.png`: Existing brand logo — source for PWA icon generation
- `src/app/layout.tsx`: Root layout with metadata configuration — needs manifest link and Apple meta tags
- Design tokens in `globals.css`: brand-500 (#6366F1), canvas (#0F172A) — used for manifest colors

### Established Patterns
- Next.js Metadata API: Already uses `metadataBase`, `title`, `openGraph`, `twitter` in layout.tsx — manifest can follow same pattern
- Tailwind v4 CSS-first config: All design tokens defined in `globals.css` @theme
- No Framer Motion rule: Offline page animations use Tailwind keyframes only

### Integration Points
- `next.config.ts`: Currently empty — may need PWA plugin configuration
- `src/middleware.ts`: Exists for route protection — service worker registration independent
- `public/` directory: Where static PWA assets (icons, offline page, sw.js) will live

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-add-pwa-support-for-installable-application*
*Context gathered: 2026-03-12*
