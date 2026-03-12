# Coding Conventions

**Last updated:** 2026-03-12 (Phase 07 code review — updated with patterns from all 7 phases)

---

## Naming Patterns

**Files:**
- All component files: kebab-case (e.g., `qr-list-row.tsx`, `google-sign-in-button.tsx`, `platform-badge.tsx`)
- Page files follow Next.js App Router convention: `page.tsx`, `layout.tsx`, `actions.ts`, `route.ts`, `not-found.tsx`, `error.tsx`
- Hook files: kebab-case prefixed with `use-` (e.g., `use-slug-check.ts`, `use-copy-to-clipboard.ts`)
- Utility files: kebab-case (e.g., `qr-generator.ts`, `redirect.ts`, `utils.ts`)
- Server Action files: named `actions.ts` or descriptively named (e.g., `qr-actions.ts`, `admin-actions.ts`)
- Global Server Actions (not route-specific): `src/app/actions/` directory

**Functions and Components:**
- React components: PascalCase (e.g., `export default function QrListRow()`, `export default function GoogleSignInButton()`)
- Utility functions: camelCase (e.g., `buildPlatformUrl()`, `generateQrDataUrl()`, `downloadQrPng()`, `formatScanCount()`, `cn()`)
- Server Actions: camelCase (e.g., `signOut`, `createQrCode`, `updateQrCode`, `deleteQrCode`, `createPublicQr`)
- Custom hooks: camelCase prefixed with `use` (e.g., `useSlugCheck`, `useCopyToClipboard`)

**Variables:**
- camelCase throughout
- Boolean variables: prefixed with `is` or `has` where appropriate (e.g., `isAdmin`, `isGated`, `isLoading`)
- Database column names: snake_case (matches Supabase/PostgreSQL convention)

**Types and Interfaces:**
- PascalCase (e.g., `Platform`, `QrCode`, `FormState`, `Metadata`)
- Union type members: lowercase string literals (e.g., `'whatsapp' | 'sms'`)
- Types live in `src/types/index.ts`; DB types in `src/types/supabase.ts`

---

## Code Style

**Formatting:**
- No Prettier config — relies on ESLint auto-fix rules from `eslint-config-next`
- Indentation: 2 spaces (TypeScript/TSX files)
- Trailing commas: standard Next.js template style (commas in multi-line objects/arrays)
- Quotes: single quotes in TypeScript/TSX (except JSX props use double quotes)
- Semicolons: absent (TypeScript files use no-semicolon style based on observed code)

**Linting:**
- ESLint with `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- Config: `eslint.config.mjs`
- Run: `pnpm lint` (maps to `eslint`)
- TypeScript strict mode enabled (`"strict": true` in `tsconfig.json`)
- `isolatedModules: true` — each file must be independently compilable

---

## Import Organization

**Order (follow Next.js convention):**
1. Framework imports — `import type { Metadata } from 'next'`, `import { ... } from 'react'`
2. Next.js internals — `import Image from 'next/image'`, `import Link from 'next/link'`
3. External packages — `import { createClient } from '@supabase/ssr'`
4. Internal absolute imports via alias — `import { cn } from '@/lib/utils'`
5. Relative imports — `import './globals.css'`

**Path Aliases:**
- `@/*` maps to `./src/` (e.g., `@/lib/utils`, `@/components/shared/page-header`, `@/types`)
- Always prefer `@/` alias over relative paths for cross-directory imports

---

## Server Actions

**Pattern: `useActionState` for form mutations:**
```tsx
// Client Component
const [state, action, isPending] = useActionState(createQrCode, initialState)
// Form: <form action={action}>
```

**FormState type** (from `src/app/dashboard/qr-actions.ts`):
```ts
export type FormState = {
  success?: boolean
  errors?: { [field: string]: string[] }
  message?: string | null
  id?: string  // populated on update to identify which record changed
}
```

**Rules:**
- Server Actions always return `FormState` — never throw unhandled exceptions to the client
- Validate with Zod before any database operation
- Call `getUser()` inside action for auth (not just `getSession()`)
- Call `revalidatePath('/dashboard')` after mutations to invalidate cache
- Platform field excluded from UpdateQrSchema entirely — enforces read-only-after-creation at server boundary

**Actions with extra params (bind pattern):**
```ts
// For actions that need an ID beyond FormData:
const boundAction = updateQrCode.bind(null, qr.id)
// Form: <form action={boundAction}>
```

---

## Supabase Client Usage

**Server Components and Server Actions:** Use `createClient()` from `@/lib/supabase/server.ts`:
```ts
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

**Admin operations (service role):** Use `createAdminClient()` from `@/lib/supabase/admin.ts`:
```ts
const admin = createAdminClient()
const { data } = await admin.from('profiles').select('*')
```
Never use `createAdminClient()` in Client Components. Never use `createAdminClient()` where RLS-filtered data is expected.

**Middleware:** Create client inline (cannot use server.ts — needs direct request/response cookie access):
```ts
const supabase = createServerClient(URL, KEY, { cookies: { getAll, setAll } })
```

**No Client Components calling Supabase directly.** All queries go through Server Components or Server Actions.

---

## Defense-in-Depth Auth Pattern

Route protection uses two layers:

1. **Middleware layer:** `src/middleware.ts` (or future `proxy.ts`) — runs on every matched request before the route renders. Redirects unauthenticated users.
2. **Layout layer:** `app/dashboard/layout.tsx` and `app/admin/layout.tsx` call `getUser()` again. Redirects if middleware was somehow bypassed.
3. **Server Action layer:** `verifyAdmin()` helper called in admin Server Actions as third layer for sensitive mutations.

```ts
// Pattern in layouts:
const { data: { user } } = await supabase.auth.getUser()
// Defense-in-depth: middleware is first layer, layout is second
if (!user) redirect('/login')
```

---

## Design Token System

**No hardcoded hex values in `.tsx`/`.ts` files outside `globals.css` and `components/ui/`.**

Tokens defined in `src/app/globals.css` via `@theme inline`. Use semantic token classes:

| Purpose | Class |
|---------|-------|
| Page background | `bg-surface` |
| Card/raised surface | `bg-surface-raised` |
| Overlay/popover | `bg-surface-overlay` |
| Primary brand fill | `bg-brand-500` |
| Primary brand hover | `hover:bg-brand-600` |
| Brand text | `text-brand-500` / `text-brand-600` / `text-brand-400` |
| Error fill | `bg-danger` |
| Error text/border | `text-danger` / `border-danger` |
| Warning text | `text-warning` |
| Muted text | `text-slate-400` / `text-slate-500` |

Conditional class merging: always use `cn()` from `@/lib/utils`:
```ts
import { cn } from '@/lib/utils'
className={cn('base-class', condition && 'conditional-class')}
```

---

## React and Next.js Conventions

**Server vs Client Components:**
- Default to Server Components; add `'use client'` only when browser APIs, hooks, or event handlers are required
- React 19 ESLint rule: no component definitions inside render body — extract to module scope

**State management:**
- No global state manager (no Redux, Zustand, etc.)
- Server Components own data; URL params drive navigation state
- Client Components use local `useState`/`useReducer` and custom hooks
- After mutation: call `router.refresh()` to re-fetch Server Component data

**Revalidation pattern:**
```ts
// Server Action: invalidate cached data
revalidatePath('/dashboard')
// Client Component after dialog close:
router.refresh()
```

**Props and separation:**
- Server Components compute derived state (e.g., `isAdmin`, `isGated`) and pass as props to Client Components — prevents flash of wrong state on initial render
- Client Components receive minimal typed props, no raw Supabase data

---

## Styling

- Tailwind utility classes exclusively — no CSS modules, no inline `style` props (except rare dynamic values like platform colors that can't be determined at build time)
- `cn()` from `@/lib/utils` for all conditional class merging
- shadcn/ui components live in `components/ui/` — do not hand-edit these files (exception: `sonner.tsx` was edited to remove `next-themes` dependency, hardcoded `theme="dark"`)
- Shared app components: `components/shared/`
- Feature-specific components: `components/<feature>/`
- Animations: Tailwind keyframes only — no Framer Motion

---

## Scanner Route Constraints (CLAUDE.md hard rules)

The scanner route (`/q/[slug]`) has strict constraints:
1. **Zero auth** — no `getUser()`, no session checks
2. **Zero sidebar** — no layout components, no navigation
3. **Under 10KB page-specific JS** — currently zero page-specific client JS (Server Component only)
4. **No `next/image` in scanner-path components** — use plain `<img>` to avoid client JS

Violation of these constraints breaks the QR scan user experience on mobile devices.

---

## Data Mutations: Platform Field

**Platform is read-only after QR creation:**
- UI: `PlatformSelector` is disabled on edit forms
- Server: `UpdateQrSchema` excludes `platform` field entirely — enforced at server boundary

## Soft Delete

**Never hard DELETE on `qr_codes`:**
```ts
// Correct:
await supabase.from('qr_codes').update({ is_active: false }).eq('id', id)
// Incorrect:
await supabase.from('qr_codes').delete().eq('id', id)
```

---

## Module Design

**Exports:**
- Pages and layouts: `export default` (required by Next.js App Router)
- Utilities and components: named `export` preferred
- Server Actions: `'use server'` directive at top of file

**No barrel files** — import directly from source (e.g., `@/lib/utils` not `@/lib`)
- Exception: `src/types/index.ts` exports all app-level types

**Utility modules without directive:**
- `lib/twilio.ts`, `lib/qr-generator.ts`, `lib/supabase/admin.ts` — no `'use server'` or `'use client'`
- Tree-shaking separates server/client usage at build time
- Safe as long as server-only env vars (e.g., `SUPABASE_SERVICE_ROLE_KEY`) are not used in client code paths

---

## Logging

**Framework:** `console` (no external logging library)

**Patterns:**
- Error boundaries: `console.error(error)` via `useEffect` to log to browser console
- Server-side unexpected failures: `console.error()` (logs to Vercel function logs)
- No debug logging committed to production code

---

*Convention analysis: 2026-03-12 (updated — reflects patterns from all 7 implementation phases)*
