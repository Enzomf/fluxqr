# FluxQR — Complete MVP Backlog

**Stack:** Next.js 15 · TypeScript (strict) · Supabase · Tailwind CSS v4 · shadcn/ui · Vercel
**Auth:** Google SSO only · **Platforms:** WhatsApp · SMS · Telegram
**Layouts:** Login: A · Dashboard: B · New QR: A · Edit QR: A · Scanner: A · Empty: A · Error: A

---

## Scope map

| Epic | Tasks | Theme |
|---|---|---|
| 🏗️ Foundation | 00 → 03 | Setup, DB, Auth, App Shell |
| 🔀 Proxy Core | 04 | Scanner redirect + landing |
| 🧩 QR Management | 05 → 08 | Create, Read, Update, Delete |
| 🖼️ QR Generation | 09 | Image output + download |
| 📊 Analytics | 10 | Scan count tracking |
| 🚀 Production | 11 → 12 | Error states + Vercel deploy |
| 📱 Public Access | 13 → 15 | Phone verification, public generation, freemium gate |
| 🛡️ Admin | 16 → 17 | Profiles, admin dashboard, deactivation |

---

## EPIC 1 — Foundation

---

### TASK 00 — Project setup: Tailwind theme + shadcn/ui
**Effort:** ~60 min · **Depends on:** nothing — start here.

**User Story:**
> As a developer, I want the design system configured upfront so that every component I build uses consistent tokens and shadcn primitives from day one.

**Acceptance Criteria:**
- **Given** the project is bootstrapped, **When** I run `npm run dev`, **Then** the app renders with Geist font, `bg-surface` dark background, and `text-brand-500` in brand indigo.
- **Given** I add a shadcn component, **When** it renders, **Then** it inherits the dark surface color scheme without manual overrides.

**Technical Implementation:**

**1. Bootstrap**
```bash
npx create-next-app@latest fluxqr --typescript --tailwind --app --src-dir
cd fluxqr
npx shadcn@latest init
```
shadcn init prompts: style → `Default`, base color → `Slate`, CSS variables → `yes`.

**2. Install shadcn components needed for MVP**
```bash
npx shadcn@latest add button input textarea badge dialog sheet separator tooltip skeleton avatar sonner
```

**3. Install remaining dependencies**
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install geist
npm install qrcode zod
npm install --save-dev @types/qrcode
```

**4. Tailwind theme — extend `tailwind.config.ts`**

Add under `theme.extend`:

```ts
colors: {
  brand:   { 400:"#818CF8", 500:"#6366F1", 600:"#4F46E5", 700:"#4338CA" },
  surface: { DEFAULT:"#0F172A", raised:"#1E293B", overlay:"#334155" },
  success: { DEFAULT:"#10B981", text:"#34D399" },
  danger:  { DEFAULT:"#F43F5E", text:"#FB7185" },
  warning: { DEFAULT:"#F59E0B", text:"#FBBF24" },
},
fontFamily: {
  sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
  mono: ["var(--font-geist-mono)", "monospace"],
},
borderRadius: {
  sm:"4px", md:"6px", lg:"8px", xl:"12px",
},
boxShadow: {
  "brand-glow":   "0 0 20px -5px rgba(99,102,241,0.4)",
  "success-glow": "0 0 12px -3px rgba(16,185,129,0.3)",
  "surface-1":    "0 1px 2px 0 rgba(0,0,0,0.3)",
  "surface-2":    "0 4px 6px -1px rgba(0,0,0,0.4)",
},
keyframes: {
  "qr-pulse": {
    "0%":   { boxShadow: "0 0 0 0px rgba(16,185,129,0.5)" },
    "100%": { boxShadow: "0 0 0 14px rgba(16,185,129,0)" },
  },
  "slide-up": {
    "0%":   { opacity:"0", transform:"translateY(8px)" },
    "100%": { opacity:"1", transform:"translateY(0)" },
  },
},
animation: {
  "qr-pulse": "qr-pulse 0.6s ease-out",
  "slide-up": "slide-up 0.2s ease-out",
},
```

**5. shadcn CSS variables — update `globals.css` dark theme**

Override the shadcn defaults inside `:root` (shadcn uses dark mode as default here since the app is always dark):

```css
:root {
  --background:       15 23 42;    /* surface #0F172A */
  --foreground:       248 250 252; /* slate-50 */
  --card:             30 41 59;    /* surface-raised */
  --card-foreground:  248 250 252;
  --border:           255 255 255 / 0.08;
  --input:            30 41 59;
  --ring:             99 102 241;  /* brand-500 */
  --primary:          99 102 241;
  --primary-foreground: 255 255 255;
  --destructive:      244 63 94;   /* danger */
  --muted:            51 65 85;    /* surface-overlay */
  --muted-foreground: 148 163 184; /* slate-400 */
  --radius:           0.375rem;    /* 6px = rounded-md */
}
```

**6. Root layout — Geist font**

```tsx
// src/app/layout.tsx
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="bg-surface text-slate-200 font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

**7. `lib/utils.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScanCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
}
```

**8. `types/index.ts`**

```ts
export type Platform = "whatsapp" | "sms" | "telegram";

export type QrCode = {
  id: string;
  slug: string;
  label: string;
  platform: Platform;
  contact_target: string;
  default_message: string | null;
  is_active: boolean;
  scan_count: number;
  created_at: string;
  updated_at: string;
};
```

**UX/Design Insight:**
Setting `class="dark"` on `<html>` permanently locks the app in dark mode — no system preference toggle for MVP. shadcn CSS variables are remapped to the FluxQR design tokens so every shadcn primitive (`Button`, `Input`, `Card`, etc.) inherits the correct surface, border, and ring colors automatically. No per-component color overrides needed.

---

### TASK 01 — Database schema & RLS
**Effort:** ~45 min · **Depends on:** Task 00

**User Story:**
> As a developer, I want a secure Supabase schema so that each user's QR codes are isolated and the proxy can look up any active code by slug efficiently.

**Acceptance Criteria:**
- **Given** the migration runs, **When** a user is authenticated, **Then** they can only SELECT / INSERT / UPDATE / DELETE their own rows.
- **Given** an unauthenticated scanner hits the proxy, **When** queried by slug, **Then** it reads minimum redirect fields for active codes only.

**Technical Implementation:**
- Table `qr_codes`: `id`, `user_id` (FK → `auth.users`), `slug UNIQUE`, `label`, `platform CHECK('whatsapp','sms','telegram')`, `contact_target`, `default_message`, `is_active DEFAULT true`, `scan_count DEFAULT 0`, `created_at`, `updated_at`.
- Partial index on `(slug) WHERE is_active = true` — hot path for proxy lookups.
- Trigger: `update_updated_at()` on every UPDATE.
- RLS: 4 owner policies (SELECT / INSERT / UPDATE / DELETE where `auth.uid() = user_id`) + 1 public SELECT policy `WHERE is_active = true` for the proxy route.
- RPC: `increment_scan_count(qr_slug TEXT)` — atomic UPDATE, `SECURITY DEFINER`.
- After migration: `npx supabase gen types typescript --local > src/types/supabase.ts`.

**UX/Design Insight:**
No UI in this task. Validate locally with `supabase db reset` before pushing to production.

---

### TASK 02 — Google SSO + route protection
**Effort:** ~90 min · **Depends on:** Task 01

**User Story:**
> As a user, I want to sign in with Google so that my QR codes are private and I never manage a password.

**Acceptance Criteria:**
- **Given** any `/dashboard/*` visit without a session, **When** middleware runs, **Then** redirect to `/login`.
- **Given** Google OAuth completes, **When** the callback fires, **Then** land on `/dashboard` with session established.
- **Given** I click "Sign Out", **When** the action completes, **Then** session cleared and land on `/login`.

**Technical Implementation:**
- `lib/supabase/server.ts` — `createClient()` using `@supabase/ssr` with cookie read/write.
- `middleware.ts` — protects `/dashboard/:path*`, redirects unauthenticated users to `/login`.
- `app/auth/callback/route.ts` — exchanges OAuth `code` for session, redirects to `/dashboard`.
- `app/login/actions.ts` — `signInWithGoogle()` server action calling `signInWithOAuth({ provider: 'google' })`. `redirectTo` must use `NEXT_PUBLIC_SITE_URL`.
- Enable Google provider in Supabase Dashboard → Auth → Providers. Set callback URL to `{SITE_URL}/auth/callback` in both Google Cloud Console and Supabase.

**UX/Design Insight — Layout A (Centered Card):**
- `min-h-screen bg-surface flex items-center justify-center` canvas.
- shadcn `Card` with `shadow-brand-glow rounded-xl max-w-sm w-full p-8`.
- Content stack: FluxQR wordmark (`text-brand-500 font-bold text-2xl`) → tagline (`text-slate-400 text-sm`) → `Separator` → `GoogleSignInButton`.
- `GoogleSignInButton` (`components/auth/google-sign-in-button.tsx`): shadcn `Button variant="outline"` + Google `G` SVG, full width. Zero other interactive elements on this page.

---

### TASK 03 — App shell: sidebar layout
**Effort:** ~90 min · **Depends on:** Task 02

**User Story:**
> As an authenticated user, I want a consistent sidebar so I can navigate between my QR codes and create new ones without losing context.

**Acceptance Criteria:**
- **Given** I am on any `/dashboard/*` route, **When** the page renders, **Then** I see the sidebar with logo, nav links, avatar, and sign out.
- **Given** I am on mobile, **When** I tap the menu icon, **Then** the sidebar opens as a `Sheet` drawer.

**Technical Implementation:**
- `app/dashboard/layout.tsx` — Server Component: auth check + renders `<Sidebar user={user} />` + `<main className="flex-1 p-6 md:ml-56">`.
- `components/dashboard/sidebar.tsx` — Client Component: desktop `<aside>` (fixed, `w-56`) + mobile shadcn `<Sheet>` sharing the same nav JSX.
- `components/dashboard/sidebar-link.tsx` — uses `usePathname()` for active state: `bg-brand-500/10 text-brand-400 border-l-2 border-brand-500`.
- Bottom of sidebar: shadcn `Avatar` (Google photo + initial fallback) + email + `Separator` + sign-out button.
- `app/dashboard/actions.ts` — `signOut()` server action.

**UX/Design Insight — Layout B (Sidebar + List):**
- Sidebar is always dark (`bg-surface-raised border-r border-white/[0.08]`).
- Mobile hamburger: `Menu` icon from `lucide-react`, top-left, fixed position.
- Single nav JSX shared between desktop and mobile `Sheet` — no duplication.

---

## EPIC 2 — Proxy Core

---

### TASK 04 — Proxy route + scanner landing page
**Effort:** ~90 min · **Depends on:** Task 01
**Priority:** 🔴 Critical path — this IS the product.

**User Story:**
> As a scanner, I want to land on a page where I can edit the pre-filled message and open my messaging app with zero friction.

**Acceptance Criteria:**
- **Given** `/q/enzo-tech` is visited, **When** it loads, **Then** label, editable message, and platform CTA are shown.
- **Given** the scanner taps the CTA, **When** the deep-link fires, **Then** the correct app opens with the message pre-filled.
- **Given** the slug is missing or inactive, **When** the page loads, **Then** `not-found.tsx` renders gracefully.

**Technical Implementation:**
- `lib/redirect.ts` — `buildPlatformUrl(platform, target, message)`: constructs `wa.me`, `sms:`, or `t.me` deep links. URL-encode the message. Strip non-digits for WhatsApp numbers.
- `app/q/[slug]/page.tsx` — Server Component: Supabase lookup by slug + `is_active = true`. If not found → `notFound()`. Fire-and-forget `increment_scan_count` RPC (non-blocking).
- `app/q/[slug]/scanner-landing.tsx` — Client Component: shadcn `Textarea` (auto-select on focus) + platform `Button`. No auth, no sidebar, no heavy imports.
- `components/scanner/telegram-fallback.tsx` — "Copy Message" (`Button variant="outline"`) + "Open Telegram" (`Button`) side by side. Uses `use-copy-to-clipboard` hook.
- ⚠️ Telegram deep link does not support pre-filled messages — always render the copy fallback for Telegram.

**UX/Design Insight — Layout A (Centered Action Card):**
- Same `Card` shell as login for brand consistency. No navbar.
- `Textarea` dark override: `bg-surface border-white/[0.1] focus-visible:ring-brand-500`.
- Platform CTA colors: WhatsApp `bg-emerald-600`, SMS `bg-blue-600`, Telegram `bg-sky-500`.
- "Powered by FluxQR" in `text-xs text-slate-600` at card bottom.
- Target under 10KB JS. No analytics scripts on this route.

---

## EPIC 3 — QR Management

---

### TASK 05 — QR creation form + slug validation
**Effort:** ~90 min · **Depends on:** Tasks 01, 03

**User Story:**
> As an authenticated user, I want to create a QR code via a single form so I can get a scannable link immediately.

**Acceptance Criteria:**
- **Given** valid form submission, **When** the action runs, **Then** a `qr_codes` row is created and I'm redirected to `/dashboard`.
- **Given** a taken slug, **When** I blur the field, **Then** "This URL is already taken" shows inline.
- **Given** an invalid slug, **When** I blur, **Then** "Lowercase letters, numbers, and hyphens only" shows inline.

**Technical Implementation:**
- `app/dashboard/new/actions.ts` — `createQrCode()` server action: Zod validation (`slug: /^[a-z0-9-]+$/`), Supabase insert with `user_id: user.id`. Handle `error.code === "23505"` (unique constraint) as slug-taken error.
- `app/api/slug-check/route.ts` — `GET ?slug=` returns `{ available: boolean }`.
- `hooks/use-slug-check.ts` — debounced (400ms) fetch to `/api/slug-check`, returns `{ available, checking }`.
- `components/qr-management/qr-form.tsx` — shared between `/new` and `/edit`. Accepts initial values prop.
- `components/qr-management/platform-selector.tsx` — 3 shadcn `Button variant="outline"` toggles. Active: `border-brand-500 bg-brand-500/10 text-brand-400`.
- `components/qr-management/slug-input.tsx` — shadcn `Input` + live `fluxqr.io/q/[slug]` preview (`font-mono text-slate-400`) + availability indicator (`Check` / `X` from `lucide-react`).

**UX/Design Insight — Layout A (Single Page Form):**
- `PageHeader` with `← My QR Codes` breadcrumb.
- Contact `Input` placeholder changes by platform: `+55 11 99999-9999` (WA/SMS) or `@username` (Telegram).
- Cancel (`Button variant="outline"`) and "Create QR Code" (`Button`) side by side at bottom.

---

### TASK 06 — Dashboard QR list
**Effort:** ~90 min · **Depends on:** Tasks 01, 03, 05

**User Story:**
> As an authenticated user, I want to see all my QR codes in a list so I can manage them at a glance.

**Acceptance Criteria:**
- **Given** I have QR codes, **When** I visit `/dashboard`, **Then** I see label, slug, platform, scan count, Edit and Delete per row.
- **Given** I have no QR codes, **When** the page loads, **Then** I see the `EmptyState` with a "Create your first QR" CTA.

**Technical Implementation:**
- `app/dashboard/page.tsx` — Server Component: fetch `qr_codes WHERE user_id = auth.uid() AND is_active = true ORDER BY created_at DESC`.
- `components/dashboard/qr-list.tsx` — renders column headers + maps `QrListRow`. Shows `EmptyState` when empty.
- `components/dashboard/qr-list-row.tsx` — `QrImage` thumbnail + label + monospace slug + `PlatformBadge` + scan count + Edit link + `DeleteButton`.
- `components/shared/platform-badge.tsx` — shadcn `Badge` variants: `bg-emerald-500/10 text-emerald-400` (WA), `bg-blue-500/10 text-blue-400` (SMS), `bg-sky-500/10 text-sky-400` (TG).
- `components/shared/empty-state.tsx` — QR SVG icon + headline + tagline + CTA `Button` linking to `/dashboard/new`.

**UX/Design Insight — Layout B (Sidebar + List):**
- Column headers: `text-xs font-medium text-slate-400 uppercase tracking-wide`.
- `QrImage` shows shadcn `Skeleton` while data URL generates client-side.
- List rows use `hover:border-white/[0.14] transition-colors` for subtle interactivity.

---

### TASK 07 — Edit QR + Pulse Confirmation Loop
**Effort:** ~90 min · **Depends on:** Task 06

**User Story:**
> As an authenticated user, I want to update my QR code's message and contact target so that printed codes stay current without reprinting.

**Acceptance Criteria:**
- **Given** I click "Edit", **When** the edit page loads, **Then** all fields are pre-filled.
- **Given** I save, **When** the action succeeds, **Then** the list row pulses green and a success `Toast` appears.
- **Given** I try a taken slug, **When** I submit, **Then** inline error appears, no navigation.

**Technical Implementation:**
- `app/dashboard/[id]/edit/actions.ts` — `updateQrCode(id, formData)`: same Zod schema as Task 05. Update `WHERE id = ? AND user_id = auth.uid()`. Handle `23505`. Call `revalidatePath('/dashboard')` on success.
- Reuse `QrForm` component from Task 05 with `initialValues` prop.
- Platform selector is **read-only** on edit — render as disabled `Badge` + shadcn `Tooltip`: "Platform cannot be changed after creation."
- `components/shared/qr-pulse-wrapper.tsx` — wraps any element, applies `animate-qr-pulse` class for 2s on trigger, then removes it.
- On success: trigger pulse on the corresponding list row + fire shadcn `toast` via `sonner`: `✓ "{label}" updated — scanners will see the new message instantly.`

**UX/Design Insight — Layout A (Dedicated Edit Page):**
- `PageHeader` with `← My QR Codes` breadcrumb.
- Delete button top-right of form card: `text-danger-text bg-danger/10 hover:bg-danger/20`. Clicking it opens `DeleteDialog` (Task 08).

---

### TASK 08 — Delete QR + confirmation dialog
**Effort:** ~60 min · **Depends on:** Task 06

**User Story:**
> As an authenticated user, I want to delete a QR code with a confirmation step so I don't accidentally deactivate a live code.

**Acceptance Criteria:**
- **Given** I click "Delete", **When** the action fires, **Then** a dialog asks `Delete "[label]"? This will deactivate the QR code permanently.`
- **Given** I confirm, **When** the action completes, **Then** the row disappears and scanner landing shows "inactive."
- **Given** I cancel, **When** it dismisses, **Then** nothing changes.

**Technical Implementation:**
- `app/dashboard/[id]/edit/actions.ts` — `deleteQrCode(id)`: **soft delete** — set `is_active = false WHERE id = ? AND user_id = auth.uid()`. Never hard DELETE. Call `revalidatePath('/dashboard')`.
- `components/qr-management/delete-dialog.tsx` — shadcn `Dialog`. Destructive button: `Button variant="destructive"`. Cancel: `Button variant="outline"`. Dialog title includes the QR label explicitly.
- `components/dashboard/delete-button.tsx` — triggers `DeleteDialog` with `id` and `label` props.

**UX/Design Insight:**
Soft delete preserves scan history and renders a graceful inactive page for anyone scanning an old printed code. The dialog title must name the code explicitly — never generic "Are you sure?".

---

## EPIC 4 — QR Generation

---

### TASK 09 — QR image generation + PNG download
**Effort:** ~90 min · **Depends on:** Task 05

**User Story:**
> As an authenticated user, I want to see a real QR code image and download it as PNG so I can print or share it.

**Acceptance Criteria:**
- **Given** a QR code exists, **When** its row renders, **Then** a real scannable QR image is shown pointing to `{SITE_URL}/q/{slug}`.
- **Given** I click "Download PNG", **When** the action fires, **Then** a high-res PNG named `{slug}-fluxqr.png` downloads.

**Technical Implementation:**
- `lib/qr-generator.ts` — `generateQrDataUrl(slug)`: uses `qrcode` npm package. URL = `NEXT_PUBLIC_SITE_URL/q/{slug}`. Config: `width: 400, margin: 2, color.dark: '#0F172A', errorCorrectionLevel: 'H'`.
- `lib/qr-generator.ts` — `downloadQrPng(slug)`: creates a temporary `<a>` with `download` attribute from the data URL.
- `hooks/use-qr-image.ts` — Client hook: calls `generateQrDataUrl` on mount, returns `{ src, isLoading }`.
- `components/qr-generation/qr-image.tsx` — Client Component: uses `useQrImage` hook, renders `<img>` or shadcn `Skeleton` while loading.

**UX/Design Insight:**
`errorCorrectionLevel: 'H'` (30% damage tolerance) ensures QR codes survive minor print damage or dirt. QR uses `dark: '#0F172A'` (brand Deep Slate) on white — fully scannable and on-brand. Reserve space below each QR image in the list row for the "Download PNG" link (v1 can be on the edit page only).

---

## EPIC 5 — Analytics

---

### TASK 10 — Scan count display + increment
**Effort:** ~60 min · **Depends on:** Tasks 04, 06

**User Story:**
> As an authenticated user, I want to see how many times each QR code has been scanned so I can measure engagement.

**Acceptance Criteria:**
- **Given** a scanner visits `/q/{slug}`, **When** the page loads, **Then** `scan_count` increments by 1 atomically.
- **Given** I view the dashboard, **When** it renders, **Then** each row shows the current `scan_count`.
- **Given** two concurrent scans, **When** both run, **Then** the final count is accurate (no race condition).

**Technical Implementation:**
- Increment is already wired in Task 04 via `supabase.rpc('increment_scan_count', { qr_slug })` — fire-and-forget, non-blocking.
- Atomicity is guaranteed by the `SECURITY DEFINER` RPC doing a single `UPDATE ... SET scan_count = scan_count + 1`.
- Dashboard list row displays `scan_count` from the server-fetched data. Use `formatScanCount()` from `lib/utils.ts` for values ≥ 1000 (e.g. `1.2k`).

**UX/Design Insight:**
Design the list row to have a reserved 48px-tall area below the scan count for a future sparkline chart (v1.1 `scan_events` table). Prevents a layout-breaking refactor later.

---

## EPIC 6 — Production

---

### TASK 11 — Error + empty states
**Effort:** ~60 min · **Depends on:** Tasks 03, 04

**User Story:**
> As a scanner or user, I want clear, branded error pages so I never see a blank screen or raw Next.js error.

**Acceptance Criteria:**
- **Given** a scanner visits a missing slug, **When** the page loads, **Then** they see "This QR code wasn't found."
- **Given** a scanner visits an inactive slug, **When** the page loads, **Then** they see "This QR code is no longer active."
- **Given** a dashboard user has no QR codes, **When** the dashboard loads, **Then** they see `EmptyState` with a CTA.

**Technical Implementation:**
- `app/q/[slug]/not-found.tsx` — renders for missing slugs (triggered by `notFound()` in page.tsx).
- Inactive codes: handle in `app/q/[slug]/page.tsx` — if `qr` is null after the `is_active = true` query, call `notFound()` which renders the same `not-found.tsx` with the "no longer active" message. Pass a `reason` search param if you want two distinct messages.
- `components/shared/empty-state.tsx` — already wired in Task 06.

**UX/Design Insight — Layout A (Branded Minimal) for error pages:**
- No sidebar, no navbar. Centered on `bg-surface` — same canvas as scanner landing.
- FluxQR wordmark + warning icon (`text-danger`) + headline + one-line explanation + optional `← Go back` ghost link.
- Keep page under 5KB — event scanners may have poor signal.

---

### TASK 12 — Vercel deploy + production checklist
**Effort:** ~60 min · **Depends on:** all previous tasks

**User Story:**
> As a developer, I want the app deployed on Vercel with all env vars set correctly so the end-to-end flow works in production.

**Acceptance Criteria:**
- **Given** the Vercel deployment exists, **When** I visit the production URL, **Then** login, QR creation, scanning, and redirect all work end-to-end.
- **Given** a scanner visits `/q/{slug}` in production, **When** the QR image is generated, **Then** it points to the production domain, not localhost.

**Technical Implementation:**

Set in Vercel → Project → Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     # server only — never NEXT_PUBLIC_
NEXT_PUBLIC_SITE_URL          # production domain — critical for QR image URLs + OAuth
```

**Pre-deploy checklist:**
```
Schema
  [ ] Migration applied to production Supabase project
  [ ] All 5 RLS policies active
  [ ] increment_scan_count RPC deployed
  [ ] Partial index on slug confirmed

Auth
  [ ] Google OAuth callback URL updated to production domain in Google Cloud Console
  [ ] Same callback URL set in Supabase Auth → Providers → Google
  [ ] NEXT_PUBLIC_SITE_URL matches production domain exactly

Build
  [ ] next build passes with 0 TypeScript errors
  [ ] No secrets in NEXT_PUBLIC_ vars

QR Redirect
  [ ] /q/[slug] tested on iOS Safari + Android Chrome
  [ ] WhatsApp deep link tested on real device
  [ ] SMS deep link tested on real device
  [ ] Telegram copy + open flow tested
  [ ] not-found page renders for invalid slugs

Performance
  [ ] Scanner landing page Lighthouse mobile score ≥ 90
```

**UX/Design Insight:**
Add `og:title` and `og:description` meta to the scanner landing page — when the link previews in iMessage or WhatsApp before being opened, it shows the QR label and FluxQR branding instead of a blank card.

---

## EPIC 7 — Public Access (Phase 5)

---

### TASK 13 — Phone verification via Twilio SMS OTP
**Effort:** ~120 min · **Depends on:** Task 12 (production deploy)

**User Story:**
> As a visitor, I want to verify my phone number so I can create QR codes tied to my identity without needing a Google account.

**Acceptance Criteria:**
- **Given** I visit the home page, **When** it loads, **Then** I see a phone number input and a "Send Code" button.
- **Given** I enter my phone number and tap "Send Code", **When** Twilio sends the OTP, **Then** I see a 6-digit code input field.
- **Given** I enter the correct code, **When** it validates, **Then** I'm shown the QR generation form and my phone is remembered for future visits.
- **Given** I return later with a valid session cookie, **When** the page loads, **Then** I skip verification and go straight to the QR generation form.

**Technical Implementation:**
- Uses raw fetch against Twilio Verify REST API (no SDK).
- `lib/twilio.ts` — Raw fetch wrapper for Twilio Verify REST API using `TWILIO_API_KEY_SID`, `TWILIO_API_KEY_SECRET`, `TWILIO_VERIFY_SERVICE_SID` env vars (server only).
- `app/actions/verify-phone.ts` — Two Server Actions: `sendOtp(phone)` calls Twilio Verify API to send code, `checkOtp(phone, code)` verifies code. On success, set a signed HTTP-only cookie with the verified phone number.
- `components/public/phone-verification.tsx` — Client Component: phone input with country code prefix, "Send Code" button, OTP input (6 digits), resend timer (60s cooldown).
- Session: HTTP-only signed cookie stores verified phone number. Expires after 30 days (configurable).
- Database: No new table needed for verification — Twilio handles OTP state.

**Env vars (server only):**
```
TWILIO_API_KEY_SID
TWILIO_API_KEY_SECRET
TWILIO_VERIFY_SERVICE_SID
```

**UX/Design Insight:**
- Phone input uses `tel` input type for mobile keyboard optimization.
- OTP input auto-focuses first digit, auto-advances on each keystroke.
- Resend button disabled for 60s with countdown timer.
- Same centered card layout as login page for consistency.

---

### TASK 14 — Public QR generation flow
**Effort:** ~120 min · **Depends on:** Task 13

**User Story:**
> As a verified visitor, I want to generate QR codes from the home page so I can get a scannable link for my phone number without signing up.

**Acceptance Criteria:**
- **Given** my phone is verified, **When** the form loads, **Then** I see two cards: "My QR Code" (default) and "Custom QR".
- **Given** I pick "My QR Code", **When** I tap generate, **Then** a QR code is created for my verified phone with WhatsApp as default platform and no custom message.
- **Given** I pick "Custom QR", **When** I fill the message textarea and tap generate, **Then** a QR code is created with my custom message.
- **Given** the QR is generated, **When** it appears, **Then** I see it in a modal/dialog with a download PNG button.
- **Given** I dismiss the dialog, **When** I return to the form, **Then** I can create another QR code.

**Technical Implementation:**
- `app/page.tsx` — Server Component: check for verified phone cookie. If not verified → render phone verification form (Task 13). If verified → render QR generation form with phone pre-filled and locked.
- `app/actions/create-public-qr.ts` — Server Action: validates phone from cookie (not user input), generates auto-slug (`nanoid(8)` or similar), inserts into `qr_codes` with `phone_number` column set and `user_id = null`. Platform defaults to WhatsApp.
- `components/public/qr-type-grid.tsx` — Client Component: two-card selection grid. "My QR Code" card (icon + description) and "Custom QR" card (icon + description). Selected card has `border-brand-500 bg-brand-500/10`.
- `components/public/public-qr-form.tsx` — Client Component: message textarea (shown only for "Custom QR"), generate button. Phone displayed as read-only chip.
- `components/public/qr-result-dialog.tsx` — Reuses dialog pattern from Phase 3.1 preview. Shows generated QR at ~280px with download PNG button.
- Database: Add `phone_number TEXT` column to `qr_codes` table. Public QR codes have `user_id = null` and `phone_number` set. Slug auto-generated using `nanoid`.

**UX/Design Insight:**
- Two-card grid is horizontally side-by-side on desktop, stacked on mobile.
- "My QR Code" card is the left/top option — default, lower friction.
- Generate button shows phone number as confirmation: "Generate QR for +55 11 99999-9999".
- After generation, dialog opens with QR code + "Download PNG" + "Create Another" buttons.

---

### TASK 15 — Freemium gate (5-use limit)
**Effort:** ~90 min · **Depends on:** Task 14

**User Story:**
> As a product owner, I want to limit free QR generation to 5 codes per phone number so that heavy users are funneled into signing up with Google.

**Acceptance Criteria:**
- **Given** a visitor has created fewer than 5 QR codes, **When** they access the form, **Then** they can generate normally with a counter showing "X of 5 free QR codes used".
- **Given** a visitor has created 5 QR codes, **When** they access the form, **Then** the form is disabled with "You've used your 5 free QR codes. Sign up with Google to continue." and a Google sign-in button.
- **Given** a visitor signs up with Google, **When** their account is created, **Then** all QR codes previously created with their verified phone are auto-linked to the new account.
- **Given** a signed-up user, **When** they visit the dashboard, **Then** they see all their QR codes (both pre- and post-signup).

**Technical Implementation:**
- `app/actions/create-public-qr.ts` — Before insert, count existing `qr_codes WHERE phone_number = ? AND is_active = true`. If >= 5, reject with error.
- `app/page.tsx` — Server Component: query usage count for verified phone. Pass `usageCount` and `limit` (5) to form component.
- `components/public/usage-counter.tsx` — Shows "X of 5 free QR codes used" as a subtle progress indicator above the form.
- `components/public/freemium-block.tsx` — Replaces the form when limit is hit. Message + `GoogleSignInButton` component (reused from `components/auth/`).
- `app/auth/callback/route.ts` — After OAuth callback, check if the new user's Google email matches any phone verification session. Run `UPDATE qr_codes SET user_id = ? WHERE phone_number = ? AND user_id IS NULL` to link orphaned QR codes.
- Linking strategy: On sign-up, read the verified phone from cookie and associate QR codes. The phone cookie is then cleared since the user now has a full account.

**UX/Design Insight:**
- Usage counter is subtle — `text-xs text-slate-400` below the form header.
- At limit, the form area is replaced entirely — no disabled fields, just a clean block message with the sign-up CTA.
- Google sign-in button uses the same style as the login page for consistency.

---

## EPIC 8 — Admin (Phase 5)

---

### TASK 16 — User profiles table + admin role
**Effort:** ~60 min · **Depends on:** Task 12

**User Story:**
> As a developer, I want a profiles table with a role column so that admin access can be determined from the database.

**Acceptance Criteria:**
- **Given** a user signs up via Google OAuth, **When** the callback completes, **Then** a profile row is created with `role = 'user'` by default.
- **Given** a profile exists with `role = 'admin'`, **When** the user accesses `/admin`, **Then** they see the admin dashboard.
- **Given** a non-admin user visits `/admin`, **When** middleware checks, **Then** they are redirected to `/dashboard`.

**Technical Implementation:**
- Database: Create `profiles` table: `id (FK → auth.users)`, `email`, `phone_number`, `role DEFAULT 'user' CHECK('user','admin')`, `created_at`, `updated_at`.
- Trigger: `on_auth_user_created` — auto-insert profile row when a new auth user is created (Supabase trigger on `auth.users`).
- RLS: Users can SELECT their own profile. Admins can SELECT all profiles.
- `src/middleware.ts` — Create middleware: protect `/dashboard/*` (auth required) and `/admin/*` (admin role required). Query profile role for admin routes.
- Initial admin: Set first admin via direct SQL `UPDATE profiles SET role = 'admin' WHERE email = '...'`.

---

### TASK 17 — Admin dashboard
**Effort:** ~120 min · **Depends on:** Task 16

**User Story:**
> As an admin, I want to see all users and their QR codes so I can monitor usage and deactivate abusive accounts.

**Acceptance Criteria:**
- **Given** I am an admin, **When** I visit `/admin`, **Then** I see a table of all users with email, phone, QR code count, total scans, and sign-up date.
- **Given** I click a user row, **When** the detail loads, **Then** I see their individual QR codes with per-code scan counts.
- **Given** I click "Deactivate" on a user, **When** the action completes, **Then** all their QR codes are set to `is_active = false`.
- **Given** I click "Deactivate" on a specific QR code, **When** the action completes, **Then** that code is set to `is_active = false`.

**Technical Implementation:**
- `app/admin/layout.tsx` — Server Component: check user profile role. If not admin, redirect to `/dashboard`. Render admin sidebar with "Users" nav link.
- `app/admin/page.tsx` — Server Component: fetch all profiles with aggregated QR counts and scan totals via Supabase query with joins.
- `app/admin/users/[id]/page.tsx` — Server Component: fetch user profile + all their QR codes with scan counts.
- `app/admin/actions.ts` — Server Actions: `deactivateUser(userId)` sets all user's QR codes to `is_active = false`. `deactivateQrCode(qrId)` sets single code to `is_active = false`. Both require admin role verification.
- `components/admin/user-table.tsx` — Table with sortable columns: email, phone, QR count, total scans, joined date. Each row links to user detail.
- `components/admin/user-detail.tsx` — User info card + QR codes table with deactivate buttons per code.
- `components/admin/deactivate-button.tsx` — Confirmation dialog before deactivation (reuses pattern from `delete-dialog.tsx`).
- Admin sidebar: "Users" link visible. Link to regular `/dashboard` also available so admins can manage their own QR codes.

**UX/Design Insight:**
- Admin layout shares the same sidebar shell pattern as the dashboard but with different nav links.
- Deactivate buttons use `text-danger` styling with confirmation dialog — same pattern as delete flow.
- User table uses `text-xs` column headers matching the dashboard list style.
- No edit capabilities — deactivation only. Keep it simple for abuse prevention.

---

## Full MVP summary

| # | Task | Epic | Est. | Priority |
|---|---|---|---|---|
| 00 | Tailwind theme + shadcn setup | Foundation | 60 min | 🔴 Critical |
| 01 | Database schema + RLS | Foundation | 45 min | 🔴 Critical |
| 02 | Google SSO + route protection | Foundation | 90 min | 🔴 Critical |
| 03 | App shell + sidebar layout | Foundation | 90 min | 🟠 High |
| 04 | Proxy route + scanner landing | Proxy Core | 90 min | 🔴 Critical |
| 05 | QR creation form + slug validation | QR Management | 90 min | 🔴 Critical |
| 06 | Dashboard QR list | QR Management | 90 min | 🔴 Critical |
| 07 | Edit QR + Pulse Confirmation Loop | QR Management | 90 min | 🔴 Critical |
| 08 | Delete QR + confirmation dialog | QR Management | 60 min | 🟠 High |
| 09 | QR image generation + download | QR Generation | 90 min | 🔴 Critical |
| 10 | Scan count display + increment | Analytics | 60 min | 🟠 High |
| 11 | Error + empty states | Production | 60 min | 🟠 High |
| 12 | Vercel deploy + checklist | Production | 60 min | 🔴 Critical |
| 13 | Phone verification via Twilio SMS OTP | Public Access | 120 min | 🔴 Critical |
| 14 | Public QR generation flow | Public Access | 120 min | 🔴 Critical |
| 15 | Freemium gate (5-use limit) | Public Access | 90 min | 🔴 Critical |
| 16 | User profiles table + admin role | Admin | 60 min | 🟠 High |
| 17 | Admin dashboard | Admin | 120 min | 🟠 High |

**Total estimated effort:** ~25.5 hours

**Recommended execution order:**
- **MVP (Phase 1–4):** 00 → 01 → 04 → 02 → 03 → 05 → 09 → 06 → 07 → 10 → 08 → 11 → 12
- **Phase 5:** 16 → 13 → 14 → 15 → 17

> Start 00 + 01 + 04 in your first two sessions. After those three tasks you'll have: a fully configured design system, a live database, and a working end-to-end QR scan → WhatsApp flow. Phase 5 builds on top of the production deployment with public access, phone verification, freemium limits, and admin tooling.
