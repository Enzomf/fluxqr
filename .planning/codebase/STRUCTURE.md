# Codebase Structure

**Analysis Date:** 2026-03-10

## Current State

The repository is in its initial scaffold stage. Only the `app/` root exists with the default Next.js create-next-app output. The full intended structure is defined in `CLAUDE.MD` and is authoritative — all new code must follow that structure.

## Directory Layout

```
fluxqr/                          # Project root (no src/ yet — see note below)
├── app/                         # Next.js App Router root (currently scaffold only)
│   ├── favicon.ico
│   ├── globals.css              # Tailwind import + CSS custom properties
│   ├── layout.tsx               # Root HTML shell, Geist font setup
│   └── page.tsx                 # Temporary scaffold home page
├── public/                      # Static assets (next.svg, vercel.svg)
├── .planning/                   # GSD planning documents (not committed to prod)
│   └── codebase/                # Codebase analysis docs
├── CLAUDE.MD                    # Project rules and intended structure
├── BACKLOG.MD                   # Full MVP task backlog
├── next.config.ts               # Next.js config (empty)
├── tsconfig.json                # TypeScript strict mode, @/* path alias
├── package.json                 # Dependencies
├── pnpm-lock.yaml               # Lockfile
└── pnpm-workspace.yaml          # Workspace config
```

## Target Directory Layout (from CLAUDE.MD — build toward this)

```
src/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts         # Google OAuth exchange
│   ├── login/
│   │   └── page.tsx             # Login screen
│   ├── dashboard/
│   │   ├── layout.tsx           # Sidebar shell
│   │   ├── page.tsx             # QR code list
│   │   ├── actions.ts           # signOut Server Action
│   │   ├── new/
│   │   │   ├── page.tsx         # Create QR form
│   │   │   └── actions.ts       # createQr Server Action
│   │   └── [id]/
│   │       └── edit/
│   │           ├── page.tsx     # Edit QR form
│   │           └── actions.ts   # updateQr, deleteQr Server Actions
│   ├── q/
│   │   └── [slug]/
│   │       ├── page.tsx         # Scanner proxy: fetch + increment + redirect
│   │       ├── scanner-landing.tsx  # Client Component for Telegram fallback
│   │       └── not-found.tsx    # 404 for unknown slugs
│   └── api/
│       └── slug-check/
│           └── route.ts         # GET: slug availability check
├── components/
│   ├── ui/                      # shadcn primitives — DO NOT EDIT MANUALLY
│   ├── shared/                  # app-button, platform-badge, empty-state,
│   │                            #   page-header, qr-pulse-wrapper, app-toast
│   ├── auth/                    # google-sign-in-button
│   ├── dashboard/               # sidebar, sidebar-link, qr-list,
│   │                            #   qr-list-row, delete-button
│   ├── qr-management/           # qr-form, platform-selector, slug-input,
│   │                            #   delete-dialog
│   ├── qr-generation/           # qr-image
│   └── scanner/                 # telegram-fallback
├── hooks/
│   ├── use-slug-check.ts        # Debounced slug availability via /api/slug-check
│   ├── use-qr-image.ts          # QR PNG data URL generation
│   └── use-copy-to-clipboard.ts # Clipboard API wrapper
├── lib/
│   ├── supabase/
│   │   ├── server.ts            # createServerClient (Server Components + Actions)
│   │   ├── client.ts            # createBrowserClient (hooks only)
│   │   └── middleware.ts        # Session refresh for Next.js middleware
│   ├── redirect.ts              # buildPlatformUrl(platform, target, message)
│   ├── qr-generator.ts          # generateQrDataUrl(), downloadQrPng()
│   └── utils.ts                 # cn(), formatScanCount()
├── types/
│   ├── supabase.ts              # Auto-generated — run: supabase gen types typescript
│   └── index.ts                 # Platform enum, QrCode interface
└── middleware.ts                # Route guard for /dashboard/*
```

## Directory Purposes

**`src/app/`:**
- Purpose: All routes, layouts, Server Actions, and API handlers
- Contains: `page.tsx` (Server Components), `layout.tsx`, `actions.ts`, `route.ts`
- Key files: `src/app/dashboard/layout.tsx` (sidebar), `src/app/q/[slug]/page.tsx` (scanner proxy)

**`src/components/ui/`:**
- Purpose: shadcn/ui primitives installed via CLI
- Contains: Button, Input, Dialog, Sheet, Badge, Sonner, etc.
- Key constraint: Never hand-edit these files. Reinstall via `npx shadcn@latest add`

**`src/components/shared/`:**
- Purpose: App-wide reusable components not tied to a specific feature
- Contains: `app-button`, `platform-badge`, `empty-state`, `page-header`, `qr-pulse-wrapper`, `app-toast`

**`src/components/<feature>/`:**
- Purpose: Components scoped to one feature domain
- Contains: Feature-specific Client or Server Components
- Naming pattern: `dashboard/`, `qr-management/`, `qr-generation/`, `scanner/`, `auth/`

**`src/hooks/`:**
- Purpose: Custom React hooks for client-side stateful behavior
- Contains: Only hooks used by Client Components. No Supabase calls here.

**`src/lib/`:**
- Purpose: Shared infrastructure utilities, external SDK wrappers
- Key files: `supabase/server.ts` (must use in all Server Components/Actions), `utils.ts` (cn())

**`src/types/`:**
- Purpose: Central TypeScript types
- Key files: `supabase.ts` (regenerate after DB migrations), `index.ts` (Platform, QrCode)

**`src/middleware.ts`:**
- Purpose: Edge-runtime route guard
- Protects: All routes under `/dashboard/*`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root HTML shell
- `src/middleware.ts`: Auth guard for dashboard
- `src/app/auth/callback/route.ts`: OAuth redirect handler

**Configuration:**
- `tsconfig.json`: TypeScript settings, `@/*` path alias maps to `./`
- `next.config.ts`: Next.js config
- `app/globals.css`: Tailwind import, CSS custom properties, dark mode vars

**Core Logic:**
- `src/lib/supabase/server.ts`: Server-side Supabase client
- `src/lib/redirect.ts`: Platform URL construction logic
- `src/lib/utils.ts`: `cn()` utility — required for all class merging
- `src/app/q/[slug]/page.tsx`: Scanner proxy (the critical public path)

**Mutations:**
- `src/app/dashboard/new/actions.ts`: QR creation
- `src/app/dashboard/[id]/edit/actions.ts`: QR update and soft delete
- `src/app/dashboard/actions.ts`: Sign out

**Testing:**
- Not configured in current scaffold

## Naming Conventions

**Files:**
- Pages and layouts: `page.tsx`, `layout.tsx` (Next.js convention)
- Server Actions: `actions.ts` (co-located with route)
- Components: `kebab-case.tsx` — e.g., `qr-list-row.tsx`, `platform-badge.tsx`
- Hooks: `use-kebab-case.ts` — e.g., `use-slug-check.ts`
- Lib utilities: `kebab-case.ts` — e.g., `qr-generator.ts`

**Directories:**
- Feature component dirs: `kebab-case` matching domain — e.g., `qr-management/`
- Route segments: Next.js conventions — `[slug]/` for dynamic, `(group)/` for layout groups if needed

## Where to Add New Code

**New Page/Route:**
- Create `src/app/<path>/page.tsx` as Server Component
- Co-locate mutations in `src/app/<path>/actions.ts`

**New Feature Component:**
- Belongs to a feature: `src/components/<feature-name>/component-name.tsx`
- Shared across features: `src/components/shared/component-name.tsx`
- Never add to `src/components/ui/` — that is shadcn-managed

**New shadcn Primitive:**
- Run `npx shadcn@latest add <component>` — do not create manually

**New Utility:**
- Pure function, no side effects: `src/lib/utils.ts`
- External SDK wrapper: `src/lib/<service-name>.ts`

**New Hook:**
- Client-side only, stateful: `src/hooks/use-<name>.ts`

**New Type:**
- App-level interface/enum: `src/types/index.ts`
- DB types: regenerate `src/types/supabase.ts` via `supabase gen types typescript`

## Special Directories

**`src/components/ui/`:**
- Purpose: Auto-managed shadcn component primitives
- Generated: Yes (via shadcn CLI)
- Committed: Yes
- Rule: Never manually edit

**`.planning/`:**
- Purpose: GSD planning and analysis documents
- Generated: Yes (by GSD tooling)
- Committed: No (add to .gitignore if not already)

**`.next/`:**
- Purpose: Next.js build output and dev cache
- Generated: Yes
- Committed: No

**`src/types/supabase.ts`:**
- Purpose: Auto-generated Supabase TypeScript types from DB schema
- Generated: Yes (via `supabase gen types typescript --project-id ...`)
- Committed: Yes — regenerate after every DB migration

---

*Structure analysis: 2026-03-10*
