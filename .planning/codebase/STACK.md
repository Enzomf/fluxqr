# Technology Stack

**Analysis Date:** 2026-03-10

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (`strict: true`, `noEmit: true`)

**Secondary:**
- CSS - Global styles via `app/globals.css`, Tailwind v4 `@import "tailwindcss"`

## Runtime

**Environment:**
- Node.js 20.19.3

**Package Manager:**
- pnpm 10.12.4
- Lockfile: `pnpm-lock.yaml` present (lockfileVersion 9.0)
- Workspace config: `pnpm-workspace.yaml` (ignores `sharp` and `unrs-resolver` built deps)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework, App Router, Server Components/Actions
- React 19.2.3 - UI library
- React DOM 19.2.3 - DOM renderer

**Planned (per BACKLOG.MD — not yet installed):**
- shadcn/ui - Headless accessible component primitives (Button, Input, Textarea, Badge, Dialog, Sheet, Separator, Tooltip, Skeleton, Avatar, Sonner)
- Zod - Runtime schema validation for Server Actions
- qrcode - QR code data URL generation (`lib/qr-generator.ts`)
- Lucide React - Icon library (used by shadcn and custom components)
- clsx + tailwind-merge - Conditional class merging via `cn()` util in `lib/utils.ts`

**Build/Dev:**
- Tailwind CSS 4.2.1 - Utility CSS, loaded via `@tailwindcss/postcss` PostCSS plugin
- PostCSS - CSS processing (`postcss.config.mjs`)
- ESLint 9.39.4 - Linting with `eslint-config-next` (core-web-vitals + typescript rules)
- TypeScript compiler - Type checking (no emit, via `noEmit: true`)

## Key Dependencies

**Currently installed:**
- `next` 16.1.6 - Framework
- `react` 19.2.3 - UI
- `react-dom` 19.2.3 - DOM rendering
- `tailwindcss` 4.2.1 (dev) - Styling
- `@tailwindcss/postcss` 4.2.1 (dev) - PostCSS integration for Tailwind v4
- `typescript` 5.9.3 (dev) - Type system
- `eslint` 9.39.4 (dev) - Linting
- `eslint-config-next` 16.1.6 (dev) - Next.js ESLint ruleset

**Planned critical additions (per BACKLOG.MD Task 00 and Task 01):**
- `@supabase/supabase-js` - Supabase client SDK
- `@supabase/ssr` - Supabase SSR helpers for Next.js cookie-based auth
- `geist` - Geist font package (currently using `next/font/google` fallback)
- `qrcode` + `@types/qrcode` - QR image generation
- `zod` - Form and action schema validation

## Configuration

**TypeScript (`tsconfig.json`):**
- `target: ES2017`
- `strict: true` - Full strict mode enforced
- `moduleResolution: bundler`
- `paths: { "@/*": ["./*"] }` - `@/` alias maps to project root
- `jsx: react-jsx`

**ESLint (`eslint.config.mjs`):**
- Flat config format (ESLint 9)
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignores `.next/`, `out/`, `build/`, `next-env.d.ts`

**PostCSS (`postcss.config.mjs`):**
- Single plugin: `@tailwindcss/postcss` (Tailwind v4 integration)

**Next.js (`next.config.ts`):**
- Minimal config, no custom options set

**Build:**
- `npm run dev` / `pnpm dev` - Development server
- `npm run build` / `pnpm build` - Production build
- `npm run lint` / `pnpm lint` - ESLint
- No test script configured

## Font Configuration

**Current (scaffold):**
- `next/font/google` loading `Geist` and `Geist_Mono` in `app/layout.tsx`
- CSS variables: `--font-geist-sans`, `--font-geist-mono`

**Planned (per BACKLOG.MD):**
- Switch to `geist` npm package: `import { GeistSans } from "geist/font/sans"`

## Design System

**Tailwind v4** — configured via `@import "tailwindcss"` in `app/globals.css`.

**Planned design tokens (per BACKLOG.MD Task 00):**
```
Brand:   #6366F1 (brand-500) · hover #4F46E5 (brand-600)
Surface: #0F172A (canvas) · #1E293B (raised) · #334155 (overlay)
Success: #10B981 · Danger: #F43F5E · Warning: #F59E0B
Radius:  rounded-md (6px) · rounded-lg (8px) · rounded-xl (12px)
Shadows: brand-glow, success-glow, surface-1, surface-2
Animations: qr-pulse (green ring), slide-up (fade-in from below)
```

## Platform Requirements

**Development:**
- Node.js ≥ 20 (currently 20.19.3)
- pnpm ≥ 10 (currently 10.12.4)
- Supabase CLI for local DB development and type generation

**Production:**
- Vercel (deployment target)
- Supabase project (managed PostgreSQL + Auth + RLS)
- Node.js 20 runtime on Vercel

---

*Stack analysis: 2026-03-10*
