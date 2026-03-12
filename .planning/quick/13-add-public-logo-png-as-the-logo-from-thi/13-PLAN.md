---
phase: quick-13
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/home-client.tsx
  - src/app/login/page.tsx
  - src/components/dashboard/sidebar.tsx
  - src/components/public/freemium-gate.tsx
autonomous: true
requirements: [QUICK-13]
must_haves:
  truths:
    - "Logo image (public/logo.png) appears on the public home page above the tagline"
    - "Logo image appears on the login page above the sign-in card"
    - "Logo image appears in the dashboard sidebar next to the FluxQR wordmark"
    - "Logo image appears on the freemium gate card"
  artifacts:
    - path: "src/app/home-client.tsx"
      provides: "Logo on public home page"
      contains: "logo.png"
    - path: "src/app/login/page.tsx"
      provides: "Logo on login page"
      contains: "logo.png"
    - path: "src/components/dashboard/sidebar.tsx"
      provides: "Logo in sidebar wordmark area"
      contains: "logo.png"
    - path: "src/components/public/freemium-gate.tsx"
      provides: "Logo on freemium gate"
      contains: "logo.png"
  key_links:
    - from: "all modified files"
      to: "public/logo.png"
      via: "next/image or img src"
      pattern: "/logo\\.png"
---

<objective>
Add the FluxQR logo (public/logo.png) to the key brand-facing surfaces of the app: the public home page, login page, dashboard sidebar, and freemium gate.

Purpose: Establish brand identity across all primary user touchpoints.
Output: Logo visible on 4 surfaces -- home, login, sidebar, freemium gate.
</objective>

<execution_context>
@/Users/enzo.figueiredo/.claude/get-shit-done/workflows/execute-plan.md
@/Users/enzo.figueiredo/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@src/app/home-client.tsx
@src/app/login/page.tsx
@src/components/dashboard/sidebar.tsx
@src/components/public/freemium-gate.tsx

<interfaces>
The logo file is at public/logo.png (a square icon with a QR code and upward arrow on a dark rounded-corner background, brand-purple on dark navy). It is roughly square and should be displayed at small sizes alongside the "FluxQR" text wordmark.

Use next/image for optimized loading. Import: `import Image from 'next/image'`
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add logo to public home page and login page</name>
  <files>src/app/home-client.tsx, src/app/login/page.tsx</files>
  <action>
In src/app/home-client.tsx:
- Add `import Image from 'next/image'` at the top.
- Replace the existing `<h1>` wordmark block (lines 41-44, the h1 + p tagline) with a logo + wordmark combo:
  - An `Image` component: `src="/logo.png"`, alt="FluxQR", width={48}, height={48}, className="mb-2" displayed above the existing h1.
  - Keep the existing h1 and p tagline below the image.
  - Wrap all three in a flex-col items-center container if not already in one.

In src/app/login/page.tsx:
- Add `import Image from 'next/image'` at the top.
- Above the existing `<h1>` wordmark ("FluxQR"), add the logo image: `<Image src="/logo.png" alt="FluxQR" width={56} height={56} className="mx-auto mb-3" />`.
- Keep the existing h1 and subtitle text below.
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && npx next lint --file src/app/home-client.tsx --file src/app/login/page.tsx 2>&1 | head -20</automated>
  </verify>
  <done>Logo renders above wordmark on public home page and login page. No lint errors.</done>
</task>

<task type="auto">
  <name>Task 2: Add logo to dashboard sidebar and freemium gate</name>
  <files>src/components/dashboard/sidebar.tsx, src/components/public/freemium-gate.tsx</files>
  <action>
In src/components/dashboard/sidebar.tsx:
- Add `import Image from 'next/image'` at the top.
- In the SidebarNav function, replace the wordmark section (the `<div className="mb-8">` containing the `<span>FluxQR</span>`) with a flex row containing:
  - `<Image src="/logo.png" alt="FluxQR" width={28} height={28} />`
  - The existing `<span>` wordmark text next to it.
  - Container: `<div className="mb-8 flex items-center gap-2">`.

In src/components/public/freemium-gate.tsx:
- Add `import Image from 'next/image'` at the top.
- Replace the `<ShieldAlert>` icon with the logo: `<Image src="/logo.png" alt="FluxQR" width={48} height={48} />`.
- Remove the `ShieldAlert` import from lucide-react (clean up unused import).
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && npx next lint --file src/components/dashboard/sidebar.tsx --file src/components/public/freemium-gate.tsx 2>&1 | head -20</automated>
  </verify>
  <done>Logo renders inline with wordmark in sidebar. Logo replaces shield icon on freemium gate. No lint errors.</done>
</task>

</tasks>

<verification>
Run full lint check to ensure no regressions:
```bash
cd /Users/enzo.figueiredo/www/fluxqr && pnpm lint
```

Visual check: dev server shows logo on `/`, `/login`, `/dashboard` sidebar, and freemium gate when limit reached.
</verification>

<success_criteria>
- public/logo.png referenced in all 4 files via next/image
- Logo visible on: home page (above wordmark), login page (above wordmark), sidebar (inline with wordmark), freemium gate (replacing shield icon)
- No lint errors, no TypeScript errors
- Logo sizes appropriate for context: 48px home, 56px login, 28px sidebar, 48px freemium
</success_criteria>

<output>
After completion, create `.planning/quick/13-add-public-logo-png-as-the-logo-from-thi/13-SUMMARY.md`
</output>
