# Phase 9: Add PWA Support for Installable Application - Research

**Researched:** 2026-03-12
**Domain:** Progressive Web App (PWA) — Next.js 16, Serwist service worker, Web App Manifest, icon generation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Offline behavior**
- Show a branded "You're offline" page when the user has no connection — FluxQR logo, message, manual "Try again" button
- Cache static assets (JS bundles, CSS, fonts, images) via service worker for faster repeat loads
- Scanner page (`/q/[slug]`) has NO offline capability — always requires server fetch
- No dashboard data caching — offline means offline page, not stale data

**Install experience**
- Browser native install prompts only — no custom install banner or sidebar button
- Whole app is installable (any page can trigger install, manifest covers entire domain)
- App name: "FluxQR" (short_name: "FluxQR")
- Auto-generated splash screen from manifest icon + name + background_color — no custom splash images

**App icons and branding**
- Generate 192x192 and 512x512 PNG icon variants from existing `public/logo.png`
- Add maskable icon variant with safe-zone padding
- `theme_color`: brand indigo `#6366F1` (browser toolbar and task switcher)
- `background_color`: dark canvas `#0F172A` (splash screen, matches app background — no white flash)
- Include Apple-specific meta tags in layout.tsx: `apple-touch-icon`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`

**Scope and navigation**
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

## Summary

This phase adds installable PWA support to a Next.js 16 (App Router) application. The three pillars are: (1) a Web App Manifest describing the app for install, (2) a service worker providing static-asset caching and a branded offline fallback page, and (3) generated PWA icons plus Apple-specific meta tags.

The recommended service worker library is **Serwist** (`@serwist/next`), which Next.js officially endorses for offline support. Serwist is a Workbox fork that replaces the unmaintained `next-pwa`. The key infrastructure decision is that **Next.js 16 uses Turbopack by default but Serwist requires Webpack for its webpack plugin**. The production build must use `next build --webpack`; development can continue using `next dev` (Turbopack). Serwist provides `defaultCache` which handles static asset caching automatically, satisfying the "cache static assets" requirement without custom caching rules.

The manifest is best served as `app/manifest.ts` using the Next.js Metadata API — this is the official, type-safe approach that automatically emits a `<link rel="manifest">` tag. Apple-specific tags (`apple-touch-icon`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`) are added via the existing `metadata` export in `src/app/layout.tsx`. Icons are generated from `public/logo.png` using a one-time `sharp` script producing 192x192, 512x512, and a maskable variant.

**Primary recommendation:** Use `@serwist/next` (webpack mode) for the service worker, `app/manifest.ts` for the manifest, and a `scripts/generate-icons.mjs` file for one-time icon generation from `public/logo.png`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@serwist/next` | ^9.x | Next.js webpack plugin — injects precache manifest, registers SW | Official Next.js recommendation for offline support |
| `serwist` | ^9.x | Service worker runtime — precaching, runtime caching, fallbacks | Workbox fork, actively maintained, peer dep of @serwist/next |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `sharp` | ^0.33.x | Icon resizing — generate 192x192, 512x512, maskable PNGs from logo.png | One-time dev-only build script; already installable via `pnpm add -D sharp` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@serwist/next` | `@ducanh2912/next-pwa` | Both Workbox forks; serwist is newer and has active maintenance. Next.js docs point to serwist. |
| `@serwist/next` | Manual `public/sw.js` | No webpack integration; manual precache manifest maintenance; not worth it given serwist's simplicity |
| `app/manifest.ts` | `public/manifest.json` | Static JSON has no TypeScript types; `manifest.ts` is idiomatic App Router and auto-linked |
| `sharp` script | `pwa-asset-generator` CLI | pwa-asset-generator uses Puppeteer (heavy); sharp is faster and already used by Next.js internally |

**Installation:**
```bash
pnpm add @serwist/next serwist
pnpm add -D sharp
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── manifest.ts          # Web App Manifest (MetadataRoute.Manifest)
│   ├── ~offline/
│   │   └── page.tsx         # Branded offline fallback (Server Component, zero auth)
│   ├── sw.ts                # Service worker source (compiled to public/sw.js)
│   └── layout.tsx           # Add appleWebApp + icons metadata here
public/
├── logo.png                 # Source icon (existing)
├── icon-192x192.png         # Generated by scripts/generate-icons.mjs
├── icon-512x512.png         # Generated by scripts/generate-icons.mjs
├── icon-maskable.png        # Generated — safe-zone padded
└── sw.js                    # Generated by Serwist (gitignored)
scripts/
└── generate-icons.mjs       # One-time sharp script for icon generation
next.config.ts               # Wrapped with withSerwistInit
tsconfig.json                # Add "webworker" to lib, "@serwist/next/typings" to types
```

### Pattern 1: Serwist Service Worker with Static Asset Caching
**What:** Serwist compiles `src/app/sw.ts` into `public/sw.js` during `next build --webpack`. The SW precaches all Next.js static chunks (JS, CSS, fonts). `defaultCache` provides stale-while-revalidate for image assets and network-first for navigations. Navigation failures fall back to `/~offline`.
**When to use:** Always — this is the only service worker approach in this phase.
**Example:**
```typescript
// Source: https://serwist.pages.dev/docs/next/getting-started
// src/app/sw.ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
```

### Pattern 2: next.config.ts with withSerwistInit
**What:** Wrap the Next.js config with the Serwist plugin. Disable in development (avoids cache pollution). Production build requires `--webpack` flag because Serwist uses a webpack plugin.
**When to use:** Always — required for service worker integration.
**Example:**
```typescript
// Source: https://serwist.pages.dev/docs/next/getting-started
// next.config.ts
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // reloadOnOnline: false — keep false to avoid page reload wiping form state
});

const nextConfig: NextConfig = {};

export default withSerwist(nextConfig);
```

### Pattern 3: App Router manifest.ts
**What:** Next.js App Router natively serves a type-safe manifest via `app/manifest.ts`. No explicit `<link rel="manifest">` needed — Next.js auto-injects it.
**When to use:** Preferred over static `public/manifest.json` — TypeScript types catch errors.
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
// src/app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FluxQR",
    short_name: "FluxQR",
    description: "Create QR codes that open WhatsApp and SMS with pre-filled messages.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0F172A",
    theme_color: "#6366F1",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
```

### Pattern 4: Apple PWA meta tags in layout.tsx
**What:** Add `appleWebApp` and `icons.apple` to the root metadata export. Next.js Metadata API generates the correct `<meta>` and `<link>` tags.
**When to use:** Always for iOS home screen support.
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#applewebapp
// src/app/layout.tsx — extend existing metadata export
export const metadata: Metadata = {
  // ...existing fields...
  manifest: "/manifest.webmanifest",
  icons: {
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "FluxQR",
    statusBarStyle: "black-translucent",
  },
};
```
Note: `appleWebApp.capable: true` generates `<meta name="mobile-web-app-capable" content="yes">`. The older `apple-mobile-web-app-capable` is deprecated as of Chrome DevTools warning, but iOS still requires it for full home-screen app behaviour. The Next.js Metadata API handles the correct tag output automatically via `appleWebApp`.

### Pattern 5: Icon Generation Script
**What:** One-time `sharp` script that reads `public/logo.png` and outputs the three required icon sizes. Run once during development, commit outputs to `public/`.
**When to use:** Before testing PWA installability — without valid icons the install prompt does not appear.
**Example:**
```javascript
// scripts/generate-icons.mjs
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "../public/logo.png");
const out = path.join(__dirname, "../public");

await sharp(src).resize(192, 192).toFile(path.join(out, "icon-192x192.png"));
await sharp(src).resize(512, 512).toFile(path.join(out, "icon-512x512.png"));

// Maskable: add 20% safe-zone padding around icon (40% radius = 20% each side)
const CANVAS = 512;
const ICON_SIZE = Math.round(CANVAS * 0.6); // 307px — icon inside 60% safe zone
const padding = Math.round((CANVAS - ICON_SIZE) / 2);
await sharp({
  create: {
    width: CANVAS,
    height: CANVAS,
    channels: 4,
    background: { r: 15, g: 23, b: 42, alpha: 1 }, // #0F172A
  },
})
  .composite([
    {
      input: await sharp(src).resize(ICON_SIZE, ICON_SIZE).toBuffer(),
      top: padding,
      left: padding,
    },
  ])
  .png()
  .toFile(path.join(out, "icon-maskable.png"));

console.log("Icons generated.");
```

### Pattern 6: Offline Page (app/~offline/page.tsx)
**What:** A server component (no `use client`) that renders a branded offline message. Serwist serves this when a navigation request fails and the network is unavailable.
**When to use:** Required by the `fallbacks.entries` configuration in sw.ts.
**Key considerations:**
- Must be a minimal page with no auth, no sidebar, no heavy client JS
- The `~offline` route is a convention used by Serwist/next-pwa — do not rename it
- Must be precached by Serwist; configure via `additionalPrecacheEntries` in withSerwistInit

### Anti-Patterns to Avoid
- **Enabling the service worker in development:** Set `disable: process.env.NODE_ENV === "development"` — otherwise stale cache causes confusing behaviour during development
- **Using `next build` without `--webpack`:** Serwist's webpack plugin does not run under Turbopack; the SW manifest injection is silently skipped, breaking precaching
- **Using `reloadOnOnline: true`:** Forces a page reload when the user comes back online — can destroy form state the user is filling in
- **Hand-rolling a service worker without Serwist:** Workbox precache manifest is injected by the webpack plugin; without it, caching is manual and brittle
- **Keeping `public/sw.js` in git:** It is generated on every build; commit it to `.gitignore`
- **Adding the service worker registration script to the scanner page:** The scanner page must remain under 10KB JS (SCAN-06). Serwist registers the SW globally via a script injected into the root layout — this does not add to page-specific bundles
- **Declaring `lib: ["webworker"]` alone in tsconfig.json:** This breaks DOM types. Use `lib: ["dom", "dom.iterable", "esnext", "webworker"]` — add `webworker` to the existing list, do not replace it

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Precache manifest injection | Custom build script enumerating Next.js chunks | `@serwist/next` webpack plugin | Next.js build output structure changes; manual enumeration breaks with every update |
| Static asset caching strategy | Custom `fetch` event handlers | `defaultCache` from `@serwist/next/worker` | Correct stale-while-revalidate + network-first strategies with proper expiration headers |
| Service worker registration | Manual `<script>` tag in layout | `@serwist/next` auto-registration | Handles update detection, SW lifecycle, and avoids duplicate registration |
| Icon resizing | ImageMagick shell commands | `sharp` | Native Node.js module, no system dependencies, already used by Next.js internally |

**Key insight:** The hardest part of service worker PWA setup is the precache manifest — it must list every JS/CSS chunk by hash. This list changes every build. `@serwist/next` injects it automatically via the webpack build graph; any manual approach requires re-implementing this.

---

## Common Pitfalls

### Pitfall 1: Turbopack vs Webpack
**What goes wrong:** Running `next build` (Turbopack default in Next.js 16) skips the Serwist webpack plugin. The service worker is generated but without `__SW_MANIFEST` injected, so it has no precache entries and caches nothing.
**Why it happens:** Next.js 16 made Turbopack the default for both dev and build. Serwist's webpack plugin only runs in webpack mode.
**How to avoid:** Add `"build": "next build --webpack"` to `package.json` scripts. Keep `"dev": "next dev"` as-is (Turbopack fine for dev since SW is disabled there).
**Warning signs:** `public/sw.js` exists after build but `__SW_MANIFEST` is undefined at runtime; no assets are precached.

### Pitfall 2: TypeScript Compilation Errors in sw.ts
**What goes wrong:** TypeScript reports `Cannot find name 'self'` or type errors in `sw.ts` because `ServiceWorkerGlobalScope` is not in the default `dom` lib.
**Why it happens:** The service worker runs in a different global scope (WorkerGlobalScope, not Window).
**How to avoid:** Add `"webworker"` to `compilerOptions.lib` in `tsconfig.json` AND add `"@serwist/next/typings"` to `compilerOptions.types`. Also add `"public/sw.js"` to `exclude`.
**Warning signs:** TypeScript errors only in `src/app/sw.ts`; rest of app compiles fine.

### Pitfall 3: Offline Page Not Precached
**What goes wrong:** User goes offline, navigates to a new route — blank screen or browser error instead of branded offline page.
**Why it happens:** The `/~offline` route must be precached before the user goes offline. If not listed in `additionalPrecacheEntries`, Serwist won't have it available.
**How to avoid:** Add to `withSerwistInit`:
```typescript
additionalPrecacheEntries: [{ url: "/~offline", revision: "1" }]
```
Or use a `git rev-parse HEAD` revision for cache-busting.
**Warning signs:** Offline page works after first visit (runtime cache) but not on fresh install.

### Pitfall 4: Scanner Page Bundle Budget
**What goes wrong:** Adding PWA infrastructure inadvertently increases the scanner page `/q/[slug]` bundle above 10KB.
**Why it happens:** If SW registration script is injected globally into every page including the scanner, or if the offline page imports shared components with large client JS.
**How to avoid:** The `@serwist/next` plugin injects a small SW registration script via `next/script` Strategy `afterInteractive` into the root layout. This is shared infrastructure, not page-specific JS — it does not count against the scanner's page-specific JS budget per the existing SCAN-06 audit pattern.
**Warning signs:** `next build` analyzer shows scanner page chunk size increase.

### Pitfall 5: No White Flash on PWA Launch
**What goes wrong:** PWA splash screen shows white background briefly before the app renders, inconsistent with dark-only design.
**Why it happens:** `background_color` in manifest defaults to white. The splash screen renders the `background_color` while the app loads.
**How to avoid:** Set `background_color: "#0F172A"` in `manifest.ts` — matches `bg-surface` canvas color from design tokens.
**Warning signs:** Testing on Android Chrome or iOS home screen install shows white flash on launch.

### Pitfall 6: Maskable Icon Safe Zone
**What goes wrong:** On Android adaptive icons, the OS crops the icon into a circle/squircle. If the logo is not centered with padding, the edges get cut off.
**Why it happens:** Android adaptive icons expect key content within the inner 60% "safe zone" (80% per MDN — use 80% for more conservative safety).
**How to avoid:** The maskable icon must be logo-on-branded-background with 20%+ padding on each side. Do not simply copy the 512x512 icon and declare it maskable.
**Warning signs:** Icon looks fine on Chrome DevTools PWA tab but is clipped on Android home screen.

---

## Code Examples

Verified patterns from official sources:

### package.json scripts update
```json
// Required for Serwist + Next.js 16 Turbopack coexistence
{
  "scripts": {
    "dev": "next dev",
    "build": "next build --webpack",
    "start": "next start",
    "generate-icons": "node scripts/generate-icons.mjs"
  }
}
```

### tsconfig.json changes (additive)
```json
// Source: https://serwist.pages.dev/docs/next/getting-started
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext", "webworker"],
    "types": ["vitest/globals", "@serwist/next/typings"]
  },
  "exclude": ["node_modules", "public/sw.js"]
}
```

### withSerwistInit configuration with offline fallback
```typescript
// Source: https://serwist.pages.dev/docs/next/getting-started + offline pattern
import { spawnSync } from "node:child_process";
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout.trim() ??
  crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: false,
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
});

const nextConfig: NextConfig = {};

export default withSerwist(nextConfig);
```

### Offline page — branded, minimal (Server Component)
```tsx
// src/app/~offline/page.tsx
// No 'use client' — pure Server Component
import Image from "next/image";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6 p-8 text-center">
      <Image src="/logo.png" alt="FluxQR" width={64} height={64} priority />
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-100">You&apos;re offline</h1>
        <p className="text-sm text-slate-400 max-w-xs">
          Check your connection and try again.
        </p>
      </div>
      <a
        href="/"
        className="px-4 py-2 rounded-md bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
      >
        Try again
      </a>
    </div>
  );
}
```

### .gitignore additions
```
# PWA generated files
public/sw.js
public/sw.js.map
public/swe-worker*
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next-pwa` (shadowwalker) | `@serwist/next` | 2023 (next-pwa unmaintained) | Serwist is actively maintained, same API surface |
| Service worker required for Chrome install | Manifest + HTTPS sufficient for install prompt | Chrome 108/112 | Can show install prompt without offline support |
| `themeColor` in Metadata object | `generateViewport` export in layout | Next.js 14+ | `metadata.themeColor` is deprecated — use viewport export |
| Static `public/manifest.json` | `app/manifest.ts` (App Router) | Next.js 13.3+ | TypeScript types, auto-linked, idiomatic |
| `experimental.turbo` config | Top-level `turbopack` config | Next.js 16 | Renamed out of experimental |

**Deprecated/outdated:**
- `metadata.themeColor`: deprecated in Next.js 14 — use `export const viewport: Viewport = { themeColor: '...' }` from `"next"` instead. However, for this phase `theme_color` is in the manifest (the primary place for browsers to read it) and `generateViewport` covers the meta tag. Both can coexist.
- `apple-mobile-web-app-capable` meta tag: deprecated per Chrome/MDN; Next.js Metadata API's `appleWebApp.capable: true` now outputs `mobile-web-app-capable` which is the correct non-vendor-prefixed version. iOS still honours it.

---

## Open Questions

1. **`next build --webpack` on Vercel CI**
   - What we know: `package.json` `"build"` script is what Vercel runs
   - What's unclear: Whether Vercel's Next.js 16 build system intercepts `--webpack` or ignores it
   - Recommendation: Test locally first; if Vercel build fails, add `"build": "next build --webpack"` and redeploy. This is the documented workaround per multiple sources.

2. **`sharp` as dev dependency on Vercel**
   - What we know: `sharp` only runs during the one-time `generate-icons` script, not the build
   - What's unclear: Whether to commit generated icons to git or regenerate them in CI
   - Recommendation: Commit the three generated PNG files to `public/` — they are static assets, not build artifacts. No CI dependency on `sharp`.

3. **iOS install prompt visibility**
   - What we know: iOS Safari does not fire `beforeinstallprompt`; users must manually use "Add to Home Screen" via Share menu
   - What's unclear: Whether the current CONTEXT.md decision ("browser native install prompts only") is acceptable for iOS where no prompt appears automatically
   - Recommendation: No action needed — this is standard iOS PWA limitation. The manifest and Apple meta tags are still required to make the installed icon and title look correct.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test:run` |
| Full suite command | `pnpm test:coverage` |

### Phase Requirements — Test Map

This phase has no explicit requirement IDs from REQUIREMENTS.md. The deliverables are infrastructure (manifest, SW, icons) and one new page (offline page). Testing approach:

| Deliverable | Behavior | Test Type | Automated Command | File Exists? |
|-------------|----------|-----------|-------------------|-------------|
| `app/manifest.ts` | Returns correct manifest shape (name, icons, colors, display) | Unit | `pnpm test:run src/app/manifest.test.ts` | No — Wave 0 |
| `app/~offline/page.tsx` | Renders logo, heading, "Try again" link | Unit (RTL) | `pnpm test:run src/app/~offline/page.test.tsx` | No — Wave 0 |
| Icon files | 192x192, 512x512, maskable PNG exist in public/ | Manual verify | `ls public/icon-*.png` | No — Wave 0 |
| SW installability | Browser DevTools PWA tab shows "installable" | Manual | DevTools > Application > Manifest | N/A |
| Offline fallback | Navigate offline, get branded page | Manual | Chrome DevTools > Network > Offline | N/A |

### Sampling Rate
- **Per task commit:** `pnpm test:run` (full run, fast — no coverage)
- **Per wave merge:** `pnpm test:run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/app/manifest.test.ts` — unit test for manifest() return value shape
- [ ] `src/app/~offline/page.test.tsx` — renders offline page, checks for logo + text + link

*(Existing test infrastructure fully covers the phase — no framework install needed)*

---

## Sources

### Primary (HIGH confidence)
- [Next.js PWA Guide (official)](https://nextjs.org/docs/app/guides/progressive-web-apps) — manifest.ts pattern, service worker approach, Apple install prompt
- [Next.js generateMetadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — appleWebApp and icons.apple exact usage
- [Next.js manifest.json API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest) — manifest.ts file convention
- [Serwist @serwist/next Getting Started](https://serwist.pages.dev/docs/next/getting-started) — sw.ts template, tsconfig changes, next.config.ts pattern

### Secondary (MEDIUM confidence)
- [LogRocket: Next.js 16 PWA with Serwist](https://blog.logrocket.com/nextjs-16-pwa-offline-support/) — Turbopack/webpack split, `next build --webpack`, `reloadOnOnline`
- [Aurora Scharff: Next.js 16 + Serwist icons](https://aurorascharff.no/posts/dynamically-generating-pwa-app-icons-nextjs-16-serwist/) — icon generation approach, `src/app/sw.ts` path
- [Chrome install criteria update](https://developer.chrome.com/blog/update-install-criteria) — service worker no longer required for install prompt in Chrome 108+
- [Serwist offline fallback pattern](https://github.com/serwist/serwist/discussions/205) — `~offline` route convention, `additionalPrecacheEntries`

### Tertiary (LOW confidence)
- Various Medium/DEV.to articles — corroborating details only; not used as primary sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified via official Next.js docs and Serwist documentation
- Architecture patterns: HIGH — all code examples verified against official sources
- Pitfalls: HIGH for Turbopack/webpack split (multiple sources confirm); MEDIUM for Safari/iOS specifics (documented but platform-specific)
- Caching strategies: MEDIUM — `defaultCache` behaviour documented but exact cache strategy composition not exhaustively verified

**Research date:** 2026-03-12
**Valid until:** 2026-06-12 (stable APIs — manifest, Serwist major version)
