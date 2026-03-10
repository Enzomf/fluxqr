# Coding Conventions

**Analysis Date:** 2026-03-10

## Naming Patterns

**Files:**
- All component files: kebab-case (e.g., `qr-list-row.tsx`, `google-sign-in-button.tsx`, `platform-badge.tsx`)
- Page files follow Next.js App Router convention: `page.tsx`, `layout.tsx`, `actions.ts`, `route.ts`, `not-found.tsx`
- Hook files: kebab-case prefixed with `use-` (e.g., `use-slug-check.ts`, `use-qr-image.ts`, `use-copy-to-clipboard.ts`)
- Utility files: kebab-case (e.g., `qr-generator.ts`, `redirect.ts`, `utils.ts`)
- Server Action files: named `actions.ts`, co-located with the page they serve

**Functions and Components:**
- React components: PascalCase (e.g., `export default function QrListRow()`, `export default function GoogleSignInButton()`)
- Utility functions: camelCase (e.g., `buildPlatformUrl()`, `generateQrDataUrl()`, `downloadQrPng()`, `formatScanCount()`, `cn()`)
- Server Actions: camelCase (e.g., `signOut`, `createQrCode`, `updateQrCode`, `deleteQrCode`)
- Custom hooks: camelCase prefixed with `use` (e.g., `useSlugCheck`, `useQrImage`, `useCopyToClipboard`)

**Variables:**
- camelCase throughout
- Boolean variables: prefixed with `is` or `has` where appropriate (e.g., `is_active`, `isLoading`)
- Database column names: snake_case (matches Supabase/PostgreSQL convention)

**Types and Interfaces:**
- PascalCase (e.g., `Platform`, `QrCode`, `Metadata`)
- Enums and union type members: typically string literals in lowercase (e.g., `'whatsapp' | 'sms' | 'telegram'`)
- Types live in `src/types/index.ts`; auto-generated Supabase types live in `src/types/supabase.ts`

## Code Style

**Formatting:**
- No Prettier config detected — relies on ESLint auto-fix rules from `eslint-config-next`
- Indentation: 2 spaces (TypeScript/TSX files per observed code)
- Trailing commas: standard Next.js template style (commas in multi-line objects/arrays)
- Quotes: double quotes for JSX attributes, double quotes for string values (Next.js default)
- Semicolons: present (TypeScript strict mode convention)

**Linting:**
- ESLint with `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- Config: `eslint.config.mjs`
- Run: `pnpm lint` (maps to `eslint`)
- TypeScript strict mode enabled (`"strict": true` in `tsconfig.json`)
- `isolatedModules: true` — each file must be independently compilable

## Import Organization

**Order (follow Next.js convention):**
1. Framework imports — `import type { Metadata } from "next"`, `import { ... } from "react"`
2. Next.js internals — `import Image from "next/image"`, `import Link from "next/link"`
3. External packages — `import { createClient } from "@supabase/ssr"`
4. Internal absolute imports via alias — `import { cn } from "@/lib/utils"`
5. Relative imports — `import "./globals.css"`

**Path Aliases:**
- `@/*` maps to the project root (e.g., `@/lib/utils`, `@/components/shared/app-button`, `@/types`)
- Defined in `tsconfig.json` paths: `"@/*": ["./*"]`
- Always prefer `@/` alias over relative paths for cross-directory imports

## Error Handling

**Server Actions:**
- Server Actions must return structured responses (success/error objects) — never throw unhandled exceptions to the client
- Validate with Zod before any database operation
- Always verify `auth.uid() = user_id` via RLS; do not rely solely on client-provided user IDs

**API Routes:**
- Return appropriate HTTP status codes with JSON error bodies
- `/api/slug-check/route.ts` returns availability status

**Client Components:**
- Use `app-toast` (Sonner) from `components/shared/` for user-facing error/success feedback
- Never expose raw Supabase error messages to end users

## Logging

**Framework:** `console` (no external logging library in MVP)

**Patterns:**
- Server-side errors: `console.error()` for unexpected failures
- No debug logging committed to production code

## Comments

**When to Comment:**
- Complex business logic or non-obvious decisions warrant inline comments
- CLAUDE.MD rules are enforced by convention, not by inline comments
- No JSDoc required for internal utility functions in MVP phase

**JSDoc/TSDoc:**
- Not currently enforced — keep function signatures and TypeScript types self-documenting

## Function Design

**Size:** Keep functions focused on a single responsibility; Server Actions are one action per file section or one file per feature route

**Parameters:**
- Prefer destructured objects for functions with 3+ parameters
- Server Actions receive `FormData` or typed argument objects
- React components receive typed props interfaces (inline or named)

**Return Values:**
- Server Actions: return `{ error: string } | { data: ... }` or redirect via `redirect()`
- Utility functions: typed return values; never `any`
- Never use `return null` as a meaningful error signal — use typed error objects or throw

## Module Design

**Exports:**
- Pages and layouts: `export default` (required by Next.js App Router)
- Utilities and components: named `export` preferred (e.g., `export function cn()`, `export function buildPlatformUrl()`)
- Server Actions: marked with `"use server"` directive at top of file or inline

**Barrel Files:**
- Not used — import directly from source files (e.g., `@/lib/utils` not `@/lib`)
- Exception: `src/types/index.ts` exports all app-level types

## React and Next.js Conventions

**Server vs Client Components:**
- Default to Server Components; add `"use client"` only when browser APIs, hooks, or event handlers are required
- All Supabase queries must remain in Server Components or Server Actions — never in Client Components
- The scanner page (`/q/[slug]/page.tsx`) must be lean: zero auth checks, zero sidebar, under 10KB JS budget

**Styling:**
- Use Tailwind utility classes exclusively — no CSS modules, no inline `style` props
- Conditional class merging: always use `cn()` from `@/lib/utils` (wraps `clsx` + `tailwind-merge`)
- shadcn/ui components live in `components/ui/` — do not hand-edit these files
- Shared app components live in `components/shared/`
- Feature-specific components live in `components/<feature>/`
- Animations: Tailwind keyframes only — no Framer Motion in MVP

**Data Mutations:**
- Platform field is read-only after QR creation — enforce in both UI and Server Action
- Deletions: use soft delete (`is_active = false`), never hard `DELETE` on `qr_codes`

---

*Convention analysis: 2026-03-10*
