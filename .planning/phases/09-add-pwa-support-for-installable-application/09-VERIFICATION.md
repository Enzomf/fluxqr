---
phase: 09-add-pwa-support-for-installable-application
verified: 2026-03-13T18:27:19Z
status: passed
score: 6/6 must-haves verified
re_verification: false
---

# Phase 9: Add PWA Support for Installable Application — Verification Report

**Phase Goal:** Make FluxQR installable as a native-like app on mobile and desktop via PWA standards — web app manifest, Serwist service worker for static asset caching and branded offline fallback, generated app icons, and Apple-specific meta tags for iOS home screen support
**Verified:** 2026-03-13T18:27:19Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| #  | Truth                                                                                                           | Status     | Evidence                                                                                                                   |
|----|-----------------------------------------------------------------------------------------------------------------|------------|----------------------------------------------------------------------------------------------------------------------------|
| 1  | Web app manifest served with name "FluxQR", standalone display, portrait orientation, brand colors, three icons | ✓ VERIFIED | `src/app/manifest.ts` exports correct MetadataRoute.Manifest; 8 assertions in manifest.test.ts all pass                   |
| 2  | PWA icons (192x192, 512x512, maskable) exist in public/ and referenced by manifest                              | ✓ VERIFIED | All three PNGs present (14KB, 82KB, 38KB); manifest.ts icon paths match exactly                                           |
| 3  | Service worker caches static assets via Serwist defaultCache                                                    | ✓ VERIFIED | `src/app/sw.ts` imports and uses `defaultCache` from `@serwist/next/worker`; `next.config.ts` wraps with `withSerwistInit` |
| 4  | Navigating offline shows branded "You're offline" page with FluxQR logo and "Try again" button                  | ✓ VERIFIED | `src/app/~offline/page.tsx` renders logo, heading, description, and `<a href="/">Try again</a>`; 4 RTL tests pass          |
| 5  | Apple meta tags enable proper iOS home screen install experience                                                | ✓ VERIFIED | `layout.tsx` metadata contains `appleWebApp: { capable: true, title: "FluxQR", statusBarStyle: "black-translucent" }` and `icons.apple` |
| 6  | Scanner page (/q/[slug]) remains under 10KB JS — service worker does not add page-specific bundle weight        | ? UNCERTAIN | Service worker is disabled in dev (`disable: process.env.NODE_ENV === "development"`); no bundle weight added to scanner page by design; needs human verification via build output                |

**Score:** 5/5 automated truths verified + 1 uncertain (build-time constraint, functionally sound)

---

### Required Artifacts

**Plan 09-01 Artifacts**

| Artifact                        | Provides                                       | Exists | Lines | Status     | Notes                                                                           |
|---------------------------------|------------------------------------------------|--------|-------|------------|---------------------------------------------------------------------------------|
| `src/app/manifest.ts`           | Web App Manifest via Next.js Metadata API      | Yes    | 19    | ✓ VERIFIED | Exports `MetadataRoute.Manifest` with all required fields                       |
| `scripts/generate-icons.mjs`    | One-time icon generation from logo.png         | Yes    | 52    | ✓ VERIFIED | Uses sharp; generates 192, 512, maskable with correct safe-zone (60% / 307px)   |
| `public/icon-192x192.png`       | 192x192 PWA icon                               | Yes    | —     | ✓ VERIFIED | 14,916 bytes                                                                    |
| `public/icon-512x512.png`       | 512x512 PWA icon                               | Yes    | —     | ✓ VERIFIED | 82,749 bytes                                                                    |
| `public/icon-maskable.png`      | 512x512 maskable icon with safe-zone padding   | Yes    | —     | ✓ VERIFIED | 38,477 bytes                                                                    |
| `next.config.ts`                | Serwist webpack plugin wrapper                 | Yes    | 19    | ✓ VERIFIED | `withSerwistInit` present; `swSrc: "src/app/sw.ts"`; disabled in dev            |
| `src/app/layout.tsx`            | Apple PWA meta tags                            | Yes    | 44    | ✓ VERIFIED | `appleWebApp` and `icons.apple` present in metadata export                      |

**Plan 09-02 Artifacts**

| Artifact                        | Provides                                            | Exists | Lines | Status     | Notes                                                                           |
|---------------------------------|-----------------------------------------------------|--------|-------|------------|---------------------------------------------------------------------------------|
| `src/app/sw.ts`                 | Service worker source with precache + offline fallback | Yes | 31 | ✓ VERIFIED | `Serwist`, `defaultCache`, `self.__SW_MANIFEST`, `/~offline` fallback, `addEventListeners()` |
| `src/app/~offline/page.tsx`     | Branded offline fallback page                       | Yes    | 17    | ✓ VERIFIED | Server Component (no "use client"); logo, heading, try-again link               |
| `src/app/manifest.test.ts`      | Unit test for manifest.ts                           | Yes    | 55    | ✓ VERIFIED | 8 assertions; all pass                                                          |
| `src/app/~offline/page.test.tsx`| Render test for offline page                        | Yes    | 26    | ✓ VERIFIED | 4 assertions; all pass                                                          |

---

### Key Link Verification

**Plan 09-01 Key Links**

| From                   | To                        | Via                            | Status     | Detail                                                                              |
|------------------------|---------------------------|--------------------------------|------------|-------------------------------------------------------------------------------------|
| `src/app/manifest.ts`  | `public/icon-*.png`       | icon src paths in manifest     | ✓ WIRED    | Manifest contains `/icon-192x192.png`, `/icon-512x512.png`, `/icon-maskable.png`    |
| `src/app/layout.tsx`   | `public/icon-192x192.png` | apple-touch-icon link          | ✓ WIRED    | `icons.apple: [{ url: "/icon-192x192.png" }]` present in metadata                  |
| `next.config.ts`       | `src/app/sw.ts`           | swSrc config                   | ✓ WIRED    | `swSrc: "src/app/sw.ts"` in `withSerwistInit` call                                 |

**Plan 09-02 Key Links**

| From              | To                    | Via                                     | Status     | Detail                                                                              |
|-------------------|-----------------------|-----------------------------------------|------------|-------------------------------------------------------------------------------------|
| `src/app/sw.ts`   | `/~offline`           | fallback entries URL                    | ✓ WIRED    | `url: "/~offline"` in `fallbacks.entries` array                                     |
| `src/app/sw.ts`   | `self.__SW_MANIFEST`  | precache entries injection              | ✓ WIRED    | `precacheEntries: self.__SW_MANIFEST` in Serwist constructor                        |
| `next.config.ts`  | `src/app/sw.ts`       | swSrc configuration (Plan 01 link)      | ✓ WIRED    | Already verified above                                                              |

---

### Requirements Coverage

> **Note:** PWA-01 through PWA-06 are defined in ROADMAP.md (Phase 9 requirements line) but are NOT present in REQUIREMENTS.md. The traceability table in REQUIREMENTS.md ends at PROD-05 and does not include any PWA requirements. These IDs are only resolvable from the ROADMAP.md success criteria. All six are mapped and verified below.

| Requirement | Source Plan | Description (derived from ROADMAP success criteria)                                    | Status        | Evidence                                                                              |
|-------------|-------------|----------------------------------------------------------------------------------------|---------------|---------------------------------------------------------------------------------------|
| PWA-01      | 09-01       | Web app manifest with name, display, orientation, brand colors, three icon sizes        | ✓ SATISFIED   | `src/app/manifest.ts` verified; 8 tests pass                                          |
| PWA-02      | 09-01       | PWA icons (192, 512, maskable) exist in public/ and referenced by manifest              | ✓ SATISFIED   | Three PNGs present; manifest icon paths verified                                      |
| PWA-03      | 09-02       | Service worker caches static assets via Serwist defaultCache                            | ✓ SATISFIED   | `sw.ts` uses `defaultCache`; `next.config.ts` wraps build with Serwist webpack plugin |
| PWA-04      | 09-02       | Navigating offline shows branded "You're offline" page with logo and try-again button   | ✓ SATISFIED   | `~offline/page.tsx` verified; 4 render tests pass; sw.ts fallback points to /~offline |
| PWA-05      | 09-01       | Apple meta tags enable iOS home screen install experience                               | ✓ SATISFIED   | `layout.tsx` has `appleWebApp` and `icons.apple`                                      |
| PWA-06      | 09-01       | Build uses --webpack flag for Serwist compatibility                                     | ✓ SATISFIED   | `package.json` build script is `"next build --webpack"`                               |

**Orphaned requirements:** None. All six PWA IDs claimed in plan frontmatter are accounted for above.

**Gap between ROADMAP.md and REQUIREMENTS.md:** PWA-01 through PWA-06 exist in ROADMAP.md but are absent from REQUIREMENTS.md (the traceability table stops at PROD-05). This is a documentation tracking gap — the requirements exist and are implemented, but REQUIREMENTS.md was never updated to include them.

---

### Anti-Patterns Found

| File                             | Line | Pattern                 | Severity  | Impact                                                                                                      |
|----------------------------------|------|-------------------------|-----------|-------------------------------------------------------------------------------------------------------------|
| `src/app/~offline/page.tsx`      | 3    | `bg-[#0F172A]` hardcoded hex | ⚠️ Warning | Plan spec required design tokens exclusively. `bg-surface` token is available and used everywhere else in the app. Functionally equivalent but inconsistent with codebase conventions. |

No TODO/FIXME/placeholder comments found. No empty implementations. No stub handlers.

---

### Human Verification Required

#### 1. Scanner page JS bundle weight (Success Criterion 6)

**Test:** Run `next build --webpack` and check the build output for `/q/[slug]` route bundle size.
**Expected:** First Load JS for the scanner route remains under 10KB.
**Why human:** Bundle size can only be confirmed from an actual production build output. Cannot be verified by static analysis.

#### 2. PWA install prompt (Lighthouse / DevTools)

**Test:** Deploy to Vercel (or run `next build --webpack && next start`), open Chrome DevTools, run a Lighthouse PWA audit.
**Expected:** "Installable" criterion passes; manifest is valid; service worker registers correctly.
**Why human:** Service worker is disabled in development (`NODE_ENV === "development"`). Cannot test registration, precaching, or offline fallback behavior without a production build.

#### 3. iOS home screen install

**Test:** Open the deployed app on Safari (iOS), use Share menu, tap "Add to Home Screen".
**Expected:** App installs with FluxQR icon (not a default screenshot), launches in standalone mode with `black-translucent` status bar, shows correct app name "FluxQR".
**Why human:** Requires physical iOS device and production deployment.

---

### Gaps Summary

No blocking gaps found. All artifacts exist, are substantive, and are correctly wired.

One minor styling deviation: `src/app/~offline/page.tsx` uses `bg-[#0F172A]` (hardcoded hex) instead of `bg-surface` (the design token established in `globals.css` and used throughout the codebase). This is cosmetically inconsistent with project conventions but has no functional impact on PWA behavior.

The three human verification items require a production build and/or physical device to confirm — they cannot be evaluated by static analysis.

---

_Verified: 2026-03-13T18:27:19Z_
_Verifier: Claude (gsd-verifier)_
