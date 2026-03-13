---
phase: quick-22
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - CLAUDE.md
  - README.md
autonomous: true
requirements: []
must_haves:
  truths:
    - "CLAUDE.md accurately describes the current stack including PWA (Serwist), testing (Vitest), phone verification (Twilio OTP), and admin dashboard"
    - "CLAUDE.md directory structure matches the actual src/ tree"
    - "CLAUDE.md database section includes phone_usage and profiles tables"
    - "CLAUDE.md env vars include Twilio and admin-related variables"
    - "README.md describes FluxQR as a product with features, setup, and development instructions"
  artifacts:
    - path: "CLAUDE.md"
      provides: "Accurate project context for Claude"
    - path: "README.md"
      provides: "Project overview and setup guide"
  key_links: []
---

<objective>
Update CLAUDE.md and README.md to accurately reflect the current project state.

Purpose: Both files are stale — CLAUDE.md still describes the Phase 1 state (missing PWA, phone verification, admin, public freemium, modals, tests, Telegram removal) and README.md is the default create-next-app boilerplate with zero project-specific content.

Output: Accurate CLAUDE.md and README.md reflecting all implemented features.
</objective>

<execution_context>
@/Users/enzo.figueiredo/.claude/get-shit-done/workflows/execute-plan.md
@/Users/enzo.figueiredo/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@README.md
@src/types/index.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update CLAUDE.md to reflect current project state</name>
  <files>CLAUDE.md</files>
  <action>
Rewrite CLAUDE.md preserving the same section structure but updating every section to match reality. Keep all existing project rules that are still valid. Specific changes:

**Stack section:**
- Framework: Next.js 16 (not 15), React 19, TypeScript strict — correct
- Add: PWA via Serwist (service worker, offline page, manifest)
- Add: Testing via Vitest + Testing Library + jsdom
- Add: Phone verification via Twilio Verify API (raw fetch, no SDK)
- Change Auth line: "Supabase Auth — Google OAuth + phone OTP (Twilio Verify)"
- Add: Package manager: pnpm

**Project rules section:**
- Keep all existing rules (they are still valid)
- Add: Co-located test files (*.test.ts beside source) using Vitest globals
- Add: Telegram platform removed — only whatsapp and sms supported
- Add: Phone verification required before QR creation (both public freemium and dashboard)
- Add: Admin routes protected by middleware + Server Action double guard
- Add: next build --webpack required (Serwist does not run under Turbopack)

**Design tokens section:** Keep as-is (unchanged)

**Directory structure section:** Replace with actual current tree:
```
src/
├── app/
│   ├── ~offline/page.tsx             # PWA offline fallback
│   ├── actions/                      # Server Actions (admin, check-otp, create-public-qr, verify-phone)
│   ├── admin/
│   │   ├── layout.tsx                # admin guard
│   │   ├── page.tsx                  # admin dashboard
│   │   ├── [userId]/page.tsx         # user detail
│   │   └── error.tsx
│   ├── auth/callback/route.ts        # OAuth callback + phone linking
│   ├── dashboard/
│   │   ├── layout.tsx                # sidebar shell
│   │   ├── page.tsx                  # QR list with modal management
│   │   ├── actions.ts                # signOut
│   │   ├── qr-actions.ts            # createQr, updateQr, deleteQr, toggleActive
│   │   └── error.tsx
│   ├── login/
│   │   ├── page.tsx
│   │   └── actions.ts               # signInWithGoogle
│   ├── q/[slug]/
│   │   ├── page.tsx                  # scanner proxy: fetch + increment
│   │   └── not-found.tsx             # 404/410 scanner error
│   ├── api/slug-check/route.ts
│   ├── home-client.tsx               # public freemium flow client component
│   ├── page.tsx                      # public landing / freemium QR generation
│   ├── layout.tsx                    # root layout
│   ├── manifest.ts                   # PWA manifest
│   ├── sw.ts                         # Serwist service worker entry
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── ui/                           # shadcn — do not edit
│   ├── shared/                       # empty-state, page-header, platform-badge, qr-pulse-wrapper
│   ├── auth/                         # google-sign-in-button
│   ├── admin/                        # user-table, user-qr-table
│   ├── dashboard/                    # sidebar, sidebar-link, qr-list, qr-list-row, qr-preview-dialog, phone-verify-dialog
│   ├── public/                       # freemium-gate, phone-verify-form, otp-verify-form, public-qr-form, public-qr-result-dialog, qr-type-grid
│   ├── qr-management/               # qr-form, qr-form-dialog, qr-type-select, platform-selector, slug-input, delete-dialog
│   └── scanner/                      # scanner-error
├── hooks/
│   ├── use-slug-check.ts
│   └── use-copy-to-clipboard.ts
├── lib/
│   ├── supabase/server.ts + client.ts + admin.ts
│   ├── redirect.ts                   # buildPlatformUrl()
│   ├── qr-generator.ts              # generateQrDataUrl(), downloadQrPng()
│   ├── twilio.ts                     # sendOtp(), checkOtp() via Twilio Verify API
│   ├── phone-token.ts               # HMAC-signed phone link tokens
│   └── utils.ts                      # cn(), formatScanCount()
├── test/
│   ├── setup.ts                      # Vitest global setup (mocks for next/*, jsdom fixes)
│   └── utils.tsx                     # Test render utilities
├── types/
│   └── index.ts                      # Platform ('whatsapp'|'sms'), QrCode, AppRole, Profile
└── middleware.ts                     # protects /dashboard/*, /admin/*, redirects logged-in from / and /login
```

**Database section:** Update to include all current tables:
```sql
qr_codes (
  id, user_id, slug UNIQUE, label,
  platform CHECK('whatsapp','sms'),
  contact_target, default_message,
  phone_number,
  is_active DEFAULT true, scan_count DEFAULT 0,
  created_at, updated_at
)

profiles (
  id, email, phone_number,
  role CHECK('admin','user') DEFAULT 'user',
  is_active DEFAULT true,
  created_at
)

phone_usage (
  id, phone_number, created_count DEFAULT 0,
  last_created_at, created_at
)
```
RLS: owners have full CRUD on qr_codes. Unauthenticated can SELECT qr_codes where is_active=true (proxy only). profiles accessed via auth.uid(). phone_usage has NO RLS (service-role only).
RPC: increment_scan_count(qr_slug) — atomic, SECURITY DEFINER.

**Env vars section:** Update to include all current vars:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY       # server only
NEXT_PUBLIC_SITE_URL            # OAuth redirectTo + QR image URL generation
TWILIO_ACCOUNT_SID              # server only
TWILIO_API_KEY_SID              # server only
TWILIO_API_KEY_SECRET           # server only
TWILIO_VERIFY_SERVICE_SID       # server only
ADMIN_EMAILS                    # comma-separated, server only
```

Remove the stray characters at end of file (the `≈x` on line 106).
  </action>
  <verify>
    <automated>grep -q "Serwist" CLAUDE.md && grep -q "Twilio" CLAUDE.md && grep -q "Vitest" CLAUDE.md && grep -q "phone_usage" CLAUDE.md && grep -q "profiles" CLAUDE.md && grep -q "TWILIO_ACCOUNT_SID" CLAUDE.md && grep -q "admin" CLAUDE.md && echo "PASS" || echo "FAIL"</automated>
  </verify>
  <done>CLAUDE.md accurately describes: Next.js 16 + PWA (Serwist) + Vitest + Twilio OTP in stack; updated project rules; complete directory structure matching actual src/ tree; all 3 database tables; all env vars including Twilio and ADMIN_EMAILS</done>
</task>

<task type="auto">
  <name>Task 2: Replace boilerplate README.md with project-specific content</name>
  <files>README.md</files>
  <action>
Replace the entire default create-next-app README with a proper project README. Structure:

**FluxQR** heading with one-line description: "Create QR codes that open WhatsApp and SMS with pre-filled messages — zero friction, zero accounts for scanners."

**Features** section (bullet list):
- QR code generation for WhatsApp and SMS with pre-filled messages
- Public freemium QR generation (phone-verified, usage-limited)
- Dashboard for managing QR codes (create, edit, deactivate, preview)
- Modal-based QR management with live slug availability check
- Real-time scan count tracking
- Phone verification via Twilio OTP (required for QR creation)
- Admin dashboard for user and QR management
- PWA support — installable, offline fallback page
- Scanner proxy page — zero auth, zero sidebar, minimal JS
- Google OAuth authentication
- Dark-only theme with Tailwind CSS v4

**Tech Stack** section (concise table or bullet list):
- Next.js 16 (App Router) + React 19 + TypeScript
- Supabase (PostgreSQL + RLS + Auth)
- Tailwind CSS v4 + shadcn/ui
- Serwist (PWA service worker)
- Vitest + Testing Library (unit tests)
- Twilio Verify API (phone OTP)
- Deployed on Vercel

**Getting Started** section:
1. Clone repo
2. `pnpm install`
3. Copy `.env.example` or list required env vars (reference CLAUDE.md)
4. `pnpm dev` for development
5. `pnpm build` for production (uses webpack, required by Serwist)
6. `pnpm test` for unit tests

**Project Structure** — brief note pointing to CLAUDE.md for detailed directory structure and conventions.

**Scripts** section:
- `pnpm dev` — development server (Turbopack)
- `pnpm build` — production build (webpack, required for Serwist)
- `pnpm test` — run unit tests
- `pnpm lint` — ESLint

Keep it concise — no walls of text. No emojis.
  </action>
  <verify>
    <automated>grep -q "FluxQR" README.md && grep -q "WhatsApp" README.md && grep -q "pnpm" README.md && grep -q "Serwist" README.md && grep -q "Vitest" README.md && ! grep -q "create-next-app" README.md && echo "PASS" || echo "FAIL"</automated>
  </verify>
  <done>README.md is a proper project README describing FluxQR features, tech stack, setup instructions, and scripts. No boilerplate content remains.</done>
</task>

</tasks>

<verification>
- CLAUDE.md contains all current features (PWA, Twilio, Vitest, admin, public freemium, modals)
- CLAUDE.md directory structure matches actual `find src -type f` output
- CLAUDE.md database section has all 3 tables (qr_codes, profiles, phone_usage)
- CLAUDE.md env vars list all required variables
- README.md describes FluxQR as a product, not a boilerplate
- No stale references to Telegram, Next.js 15, or npm (should be pnpm)
</verification>

<success_criteria>
Both CLAUDE.md and README.md accurately reflect the current project: Next.js 16 + React 19 + Supabase + PWA (Serwist) + Vitest + Twilio OTP + admin dashboard + public freemium + modal-based QR management. No stale information remains.
</success_criteria>

<output>
After completion, create `.planning/quick/22-update-readme-and-claude-md-to-reflect-c/22-SUMMARY.md`
</output>
