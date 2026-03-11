# Phase 5: Public QR Generation with Phone Verification, Usage Limits, and Admin Dashboard - Research

**Researched:** 2026-03-11
**Domain:** Twilio Verify SMS OTP, Supabase RBAC/RLS, Next.js 15 cookie sessions, admin data views
**Confidence:** HIGH (core stack), MEDIUM (schema design, freemium linking strategy)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Public generation flow**
- Home page (/) becomes the public QR generation tool — no login required to start
- Two-card selection grid on the home page: "My QR Code" (default messaging QR for verified phone, no custom message) and "Custom QR" (visitor writes a custom message)
- Minimal form: phone number + message textarea only — platform defaults to WhatsApp, slug is auto-generated
- After generation, QR appears in a modal/dialog (reusing Phase 3.1 preview dialog pattern) with download action
- Visitor dismisses dialog to create another QR code
- /login remains available for returning authenticated users

**Phone verification**
- Twilio for SMS OTP delivery (6-digit code) sent to the visitor's phone number
- Verification happens first — before the form/card selection is shown
- Verified phone remembered via cookie/session for future visits (skip re-verification on return)
- Phone is locked: visitor can only create QR codes for the number they verified — no way to enter a different contact_target

**Freemium gate**
- Each QR code created = 1 use toward the 5-use limit
- Usage tracked server-side per verified phone number — reliable, can't be bypassed by clearing cookies
- At limit: form is disabled with hard block — "You've used your 5 free QR codes. Sign up with Google to continue." with Google sign-in button inline
- After signing up with Google, QR codes previously created with their verified phone number are auto-linked to the new account — seamless transition to dashboard

**Admin dashboard**
- Admin access determined by a role column on a user/profiles table (not hardcoded emails)
- Separate /admin route with its own layout — middleware checks admin role
- Admin sidebar link visible only to users with admin role
- Data view: table of all users with email, phone, QR codes created count, total scans, sign-up date
- Click a user row to see their individual QR codes with per-code scan counts
- Admin actions: can deactivate users and deactivate individual QR codes (abuse prevention)
- No edit/delete capabilities — deactivation only

**Carried from prior phases**
- Dark-only theme with canvas/raised/overlay surface tokens (Phase 1)
- Server Actions for all mutations (Phase 1)
- Soft delete only — is_active = false, never hard DELETE (project rule)
- No Framer Motion — Tailwind keyframes only (project rule)
- QR image uses brand colors: #0F172A modules on white background (Phase 3)
- Compact scan count formatting via formatScanCount() (Phase 3)

### Claude's Discretion

- Session/cookie implementation for remembered verification
- Database schema for profiles table and phone-to-user linking
- Auto-generated slug format for public QR codes
- Admin layout design (shared sidebar shell or standalone)
- Responsive behavior of the two-card grid on mobile
- OTP input UX (number of digits, auto-submit, resend timer)
- How to associate phone-created QR codes with Google account on sign-up

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PUB-01 | Any visitor can customize a message and generate a QR tied to their verified phone | Twilio Verify API + Server Actions + qr-generator reuse |
| PUB-02 | Phone number verification ensures users can only create QRs for their own number | Twilio Verify "approved" status gates creation; phone locked in cookie |
| PUB-03 | Unauthenticated users limited to 5 uses before forced sign-up, tracked reliably | Server-side usage_count per phone in DB — cookie bypass-proof |
| PUB-04 | Every QR code has a persistent scan counter visible to its owner | Existing scan_count on qr_codes, already implemented |
| PUB-05 | Admin UI shows per-user QR code counts and per-code scan counts | Service-role admin client + Supabase aggregation queries |
| PUB-06 | Users can choose "My QR Code" vs "Custom QR" via 2-option grid | Two-card UI, card selection drives form state |
</phase_requirements>

---

## Summary

Phase 5 transforms FluxQR from a private owner tool into a public-facing QR generation platform. Three distinct technical tracks must be built in parallel: (1) the phone verification flow using Twilio Verify API called from Server Actions, (2) the freemium gate backed by a `phone_usage` table in Supabase, and (3) a role-based admin dashboard protected via middleware + profiles table role column.

The biggest integration challenge is the freemium-to-account upgrade path: when a phone-verified anonymous user signs up with Google, their previously created QR codes (stored with `phone_number` and `user_id = NULL`) must be back-filled with the new `user_id`. This must happen atomically in the OAuth callback, using the service-role Supabase client to bypass RLS.

The admin dashboard is the simplest track — it follows existing dashboard patterns (Server Component data fetching + sidebar layout) but uses a service-role client to read across all users' data. The admin role check in middleware reads the `role` column from the `profiles` table via a short-lived server-side lookup.

**Primary recommendation:** Use Twilio Verify API (not Supabase Auth SMS — it's for passwordless login, not standalone OTP). Track usage per phone in a dedicated `phone_usage` table. Store verified phone in an httpOnly cookie with a 30-day max-age. Use service-role client for admin reads and for the account-linking migration.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `twilio` | ^5.x | Send SMS OTP via Twilio Verify API | Only official SDK; Verify V2 is current API |
| `@supabase/supabase-js` | ^2.99.0 (already installed) | Service-role admin client for bypass-RLS operations | Required for cross-user data, already in project |
| `@supabase/ssr` | ^0.9.0 (already installed) | Standard Supabase SSR client | Already used across all server components |
| `next/headers` cookies | Next.js 16.1.6 (already installed) | Set/read httpOnly cookie for verified phone session | Official Next.js 15 async cookie API |
| `zod` | ^4.3.6 (already installed) | Validate phone numbers and form inputs in Server Actions | Already used in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn InputOTP | (add via CLI) | 6-digit OTP input with auto-focus and auto-submit | OTP entry step after phone submission |
| `input-otp` | peer dep of shadcn InputOTP | Underlying headless OTP library | Installed automatically with shadcn CLI |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Twilio Verify API | Supabase Auth SMS OTP | Supabase SMS OTP creates a Supabase Auth session — not what we want here; we need standalone phone verification without creating a Supabase user |
| httpOnly cookie for phone session | localStorage / sessionStorage | httpOnly cookie is not accessible to JS (XSS-safe), persists across browser sessions, readable by server middleware |
| Dedicated `phone_usage` table | Increment a counter on `qr_codes` | Dedicated table allows a single authoritative count per phone, supports linking to user_id on upgrade, and is easier to query for the freemium gate |

**Installation:**
```bash
pnpm add twilio
pnpm dlx shadcn@latest add input-otp
```

New env vars needed:
```
TWILIO_ACCOUNT_SID      # server only
TWILIO_AUTH_TOKEN       # server only
TWILIO_VERIFY_SERVICE_SID  # server only — created in Twilio Console > Verify > Services
```

---

## Architecture Patterns

### Recommended Project Structure (new files only)
```
src/
├── app/
│   ├── page.tsx                     # PUBLIC: replaces redirect-to-login; becomes QR generator
│   ├── admin/
│   │   ├── layout.tsx               # Admin layout — middleware + role check
│   │   ├── page.tsx                 # User table (all users, QR counts, scan totals)
│   │   └── [userId]/page.tsx        # Per-user QR code list with scan counts
│   └── auth/callback/route.ts       # MODIFY: back-fill phone QRs to user_id on Google sign-up
├── components/
│   ├── public/                      # New feature folder
│   │   ├── phone-verify-form.tsx    # Step 1: phone input + send OTP (client)
│   │   ├── otp-verify-form.tsx      # Step 2: 6-digit OTP entry (client)
│   │   ├── qr-type-grid.tsx         # Two-card selection grid (client)
│   │   ├── public-qr-form.tsx       # Message textarea + generate button (client)
│   │   └── freemium-gate.tsx        # Hard block UI with Google sign-in CTA
│   └── admin/
│       ├── admin-sidebar.tsx        # Admin navigation
│       ├── user-table.tsx           # All-users data table
│       └── user-qr-table.tsx        # Per-user QR code table
├── lib/
│   ├── twilio.ts                    # Twilio client factory (server only)
│   └── supabase/
│       └── admin.ts                 # Service-role client factory (server only)
└── app/
    ├── actions/
    │   ├── verify-phone.ts          # Server Action: send OTP via Twilio
    │   ├── check-otp.ts             # Server Action: verify OTP, set cookie
    │   ├── create-public-qr.ts      # Server Action: create QR (checks usage limit)
    │   └── admin-actions.ts         # Server Action: deactivate user/QR
    └── middleware.ts                # MODIFY: add /admin/* role check
```

### Pattern 1: Phone Verification Session (httpOnly Cookie)

**What:** After Twilio confirms OTP is "approved", store the verified phone number in an httpOnly cookie with a 30-day maxAge. On all subsequent visits, read this cookie server-side to skip the verification step.

**When to use:** Any time the home page or create-public-qr action needs to identify the phone owner without re-sending SMS.

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/cookies
// src/app/actions/check-otp.ts
'use server'
import { cookies } from 'next/headers'

export async function checkOtp(phone: string, code: string) {
  // 1. Call Twilio Verify check endpoint
  const verification = await twilioClient.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
    .verificationChecks.create({ to: phone, code })

  if (verification.status !== 'approved') {
    return { error: 'Invalid or expired code' }
  }

  // 2. Set httpOnly cookie — 30 days
  const cookieStore = await cookies()
  cookieStore.set('verified_phone', phone, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  return { success: true }
}
```

### Pattern 2: Twilio Verify Send + Check

**What:** Two Server Actions — one to send the OTP, one to check it. The Twilio SDK is initialized once in a shared `lib/twilio.ts`.

**Example:**
```typescript
// Source: https://www.twilio.com/docs/verify/api/verification
// src/lib/twilio.ts
import twilio from 'twilio'

let client: ReturnType<typeof twilio> | null = null

export function getTwilioClient() {
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )
  }
  return client
}

// Send OTP
export async function sendOtp(phone: string) {
  const client = getTwilioClient()
  return client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
    .verifications.create({ to: phone, channel: 'sms' })
}

// Check OTP
export async function checkOtp(phone: string, code: string) {
  const client = getTwilioClient()
  return client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
    .verificationChecks.create({ to: phone, code })
}
```

Phone must be in E.164 format: `+15551234567`. Validate with zod before calling:
```typescript
const phoneSchema = z.string().regex(/^\+[1-9]\d{1,14}$/, 'Must be E.164 format')
```

### Pattern 3: Freemium Gate — Server-Side Usage Tracking

**What:** A `phone_usage` table stores how many QR codes each phone number has generated. The `create-public-qr` Server Action reads this count before inserting. If count >= 5 and user is not authenticated, it returns a gate error. RLS is disabled on this table — it is only written to via service-role client.

**Database schema:**
```sql
-- phone_usage: tracks per-phone QR creation count for freemium gate
create table public.phone_usage (
  phone_number text primary key,
  usage_count  integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- No RLS — only accessed via service-role server client
-- DO NOT enable RLS on this table (anon cannot read/write it)
```

**Usage check pattern:**
```typescript
// src/app/actions/create-public-qr.ts
'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

const FREE_LIMIT = 5

export async function createPublicQr(formData: FormData) {
  const cookieStore = await cookies()
  const phone = cookieStore.get('verified_phone')?.value
  if (!phone) return { error: 'Phone not verified' }

  const admin = createAdminClient()

  // Check usage
  const { data: usage } = await admin
    .from('phone_usage')
    .select('usage_count')
    .eq('phone_number', phone)
    .single()

  if (usage && usage.usage_count >= FREE_LIMIT) {
    return { gate: true, message: 'Free limit reached' }
  }

  // Insert QR code (user_id = null for unregistered visitors)
  // ... insert logic ...

  // Increment usage count (upsert)
  await admin.from('phone_usage').upsert(
    { phone_number: phone, usage_count: (usage?.usage_count ?? 0) + 1, updated_at: new Date().toISOString() },
    { onConflict: 'phone_number' }
  )

  return { success: true, qrData: { /* ... */ } }
}
```

### Pattern 4: Admin Client Factory (Service Role)

**What:** A second Supabase client initialized with the service role key. Used exclusively in server-side code (Server Actions, Route Handlers, layout.tsx) to bypass RLS for cross-user reads and admin writes.

```typescript
// Source: https://adrianmurage.com/posts/supabase-service-role-secret-key/
// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}
```

Never call `createAdminClient()` from a Client Component. The `SUPABASE_SERVICE_ROLE_KEY` must never be prefixed with `NEXT_PUBLIC_`.

### Pattern 5: Admin Role Check in Middleware

**What:** The middleware reads the active Supabase session, then queries `profiles` for the user's role. If `role !== 'admin'`, redirect to `/dashboard`.

**Key insight:** Middleware runs on every request matching the pattern — keep it lightweight. Fetch only the `role` column.

```typescript
// src/middleware.ts (extended)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // ... existing session refresh logic for /dashboard/* ...

  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Get user from session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    // Check admin role in profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
```

### Pattern 6: Account Linking — Phone QRs to Google User

**What:** When a previously phone-verified anonymous visitor signs up with Google OAuth, the auth callback detects their verified phone cookie and updates all `qr_codes` rows where `phone_number = <cookie_value>` to set `user_id = <new_user_id>`. This runs in the existing `/auth/callback/route.ts` using the service-role client.

```typescript
// Extend src/app/auth/callback/route.ts
// After exchangeCodeForSession succeeds and user is available:
const verifiedPhone = cookieStore.get('verified_phone')?.value
if (verifiedPhone && user) {
  const admin = createAdminClient()
  // Link all phone-created QR codes to the new user_id
  await admin
    .from('qr_codes')
    .update({ user_id: user.id })
    .eq('phone_number', verifiedPhone)
    .is('user_id', null)

  // Clear the phone cookie — user is now fully authenticated
  cookieStore.delete('verified_phone')
}
```

### Pattern 7: shadcn InputOTP — Auto-Submit on Complete

**What:** The 6-digit OTP input auto-submits when all 6 digits are entered. Uses shadcn `InputOTP` component with controlled `value` + `onChange`.

```typescript
// Source: https://ui.shadcn.com/docs/components/radix/input-otp
// Install: pnpm dlx shadcn@latest add input-otp
import {
  InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot,
} from '@/components/ui/input-otp'

const [value, setValue] = useState('')

const handleChange = (newValue: string) => {
  setValue(newValue)
  if (newValue.length === 6) {
    // Call Server Action to check OTP
    startTransition(() => checkOtpAction(phone, newValue))
  }
}

<InputOTP maxLength={6} value={value} onChange={handleChange}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>
```

### Anti-Patterns to Avoid

- **Tracking usage by cookie count:** Cookies are client-side and can be cleared or manipulated. Track usage server-side per phone in the DB.
- **Using Supabase Auth SMS for OTP:** This creates a Supabase session — it conflates phone authentication with phone verification. Twilio Verify is standalone and does not create auth users.
- **Hardcoding admin emails in middleware:** If the email changes or more admins are needed, a code deploy is required. Use a `role` column in the `profiles` table instead.
- **Calling service-role client from Client Components:** Any `SUPABASE_SERVICE_ROLE_KEY` exposed to the browser is a critical security vulnerability. Strictly server-only.
- **Using `auth.uid()` in RLS for phone-created QRs:** Phone-created QRs have `user_id = NULL` — any RLS policy using `auth.uid() = user_id` would exclude them. These rows must be managed via service-role server code.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SMS OTP delivery | Custom SMS sender | Twilio Verify API | Rate limiting, code expiry, attempt tracking, carrier compliance all handled |
| OTP digit input | Custom multi-input refs | shadcn InputOTP | Focus management, paste detection, keyboard nav, accessibility handled |
| Phone number formatting | Custom regex | E.164 validation via zod regex + let Twilio normalize | Twilio rejects non-E.164; zod ensures we don't even send invalid numbers |
| Admin data table | Custom HTML table | Server Component + shadcn Table primitive | Type-safe, accessible, sortable without a JS bundle |
| Session management for verified phone | Custom JWT/token | Next.js httpOnly cookie via `cookies()` | Built-in, secure, server-readable, no extra library needed |

**Key insight:** Twilio Verify handles all the hard parts of OTP — code generation, expiry (10 minutes by default), attempt limiting (5 attempts per 10 minutes), and delivery retries. Do not reimplement any of this.

---

## Common Pitfalls

### Pitfall 1: Twilio Phone Number Format
**What goes wrong:** Twilio Verify rejects phone numbers not in E.164 format (e.g. `5551234567` instead of `+15551234567`).
**Why it happens:** Users enter local formats; US numbers without country code are common.
**How to avoid:** Validate with `z.string().regex(/^\+[1-9]\d{1,14}$/)` in the Server Action before calling Twilio. Show inline error: "Include country code, e.g. +1 555 123 4567".
**Warning signs:** Twilio returns error code 60200 (Invalid parameter).

### Pitfall 2: Cookie Set After Streaming Starts
**What goes wrong:** `cookies().set()` throws "Cookies can only be modified in a Server Action or Route Handler" when called from a Server Component render.
**Why it happens:** HTTP doesn't allow headers after streaming begins.
**How to avoid:** Only call `cookieStore.set()` inside Server Actions or Route Handlers — never during Server Component render. The `checkOtpAction` Server Action is where the cookie gets set.
**Warning signs:** Next.js runtime error during render.

### Pitfall 3: RLS Blocks Service-Role Writes
**What goes wrong:** Despite using service-role client, insert fails because the table does not have RLS enabled but a restrictive policy blocks service role (rare misconfig).
**Why it happens:** Service role ALWAYS bypasses RLS — but developers sometimes confuse this and add a `RESTRICT` policy with `to service_role`.
**How to avoid:** Service role ignores all RLS policies by design. Never add explicit policies `for service_role` — they are redundant and potentially confusing. Leave `phone_usage` table with RLS disabled (simpler).
**Warning signs:** Service-role inserts return 403 or empty data unexpectedly.

### Pitfall 4: Account Linking Race Condition
**What goes wrong:** If the user signs up with Google while a QR creation is in flight, the `user_id` update in the callback might miss the just-inserted row.
**Why it happens:** Non-atomic sequence: create QR code → separately update user_id.
**How to avoid:** In the callback, run the update AFTER a small delay or simply accept that any QR created in the same millisecond as sign-up may need a manual re-link. For MVP scale this is acceptable. The update uses `WHERE phone_number = X AND user_id IS NULL` so it's idempotent.
**Warning signs:** Logged-in user sees dashboard missing 1 QR code that they created moments before sign-up.

### Pitfall 5: Admin Middleware Query Adds Latency
**What goes wrong:** The admin middleware queries `profiles` on every `/admin/*` request, adding a DB round-trip per page load.
**Why it happens:** Supabase RLS requires a session — middleware can't cache across requests in the standard setup.
**How to avoid:** Store `role` in the Supabase session JWT using the Custom Access Token Hook (auth hook). This is a one-time setup in `supabase/config.toml`. For MVP, the per-request profiles query is acceptable latency.
**Warning signs:** Admin page load feels slow even for simple views.

### Pitfall 6: Twilio Rate Limits Hit in Development
**What goes wrong:** Developers spam the "Send OTP" button during testing and hit Twilio's 5-attempt / 10-minute limit.
**Why it happens:** No cooldown UI in development; no test phone bypass.
**How to avoid:** Use Twilio's test credentials (magic numbers) for development: `+15005550006` always succeeds. Add a 60-second resend timer in the OTP UI. Twilio docs: https://www.twilio.com/en-us/blog/test-verify-no-rate-limits.
**Warning signs:** Twilio returns error 60203 (Max send attempts reached).

### Pitfall 7: Nullable user_id Breaks Existing RLS Policies
**What goes wrong:** After adding `phone_number` and making `user_id` nullable in `qr_codes`, existing RLS policies that use `auth.uid() = user_id` will silently exclude phone-created QRs from all anon reads.
**Why it happens:** `NULL = auth.uid()` evaluates to NULL (not true) in SQL — the existing SELECT policy for active QRs needs to handle NULL user_id.
**How to avoid:** The scanner proxy SELECT policy already uses `is_active = true` without a user_id check — this is fine. The dashboard SELECT policy uses `auth.uid() = user_id` — this correctly excludes phone-only QRs from the dashboard until linked. Admin reads use service-role (bypasses RLS). No change needed to existing policies for this phase's MVP behavior.
**Warning signs:** Dashboard shows 0 QRs after account linking because user_id update didn't fire.

---

## Code Examples

### Twilio Client Initialization (Server Only)
```typescript
// Source: https://www.twilio.com/docs/verify/quickstarts/node-express
// src/lib/twilio.ts
import twilio from 'twilio'

export function getTwilioClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  )
}

export async function sendVerification(phone: string) {
  const client = getTwilioClient()
  return client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
    .verifications.create({ to: phone, channel: 'sms' })
}

export async function checkVerification(phone: string, code: string) {
  const client = getTwilioClient()
  return client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
    .verificationChecks.create({ to: phone, code })
  // Returns: { status: 'approved' | 'pending' | 'canceled' | 'failed' | 'expired' }
}
```

### Auto-Generated Slug for Public QRs
```typescript
// Slug format: {phone-last-4}-{nanoid-6} e.g. "7890-k3r9xm"
// Keeps slugs short and phone-correlated without exposing full number
function generatePublicSlug(phone: string): string {
  const last4 = phone.slice(-4)
  const random = Math.random().toString(36).slice(2, 8)
  return `${last4}-${random}`
}
```

### Profiles Table SQL (with role column + auto-create trigger)
```sql
-- Source: https://supabase.com/docs/guides/auth/managing-user-data

create type public.app_role as enum ('admin', 'user');

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  phone_number text,        -- verified phone number (from cookie at sign-up)
  role         app_role not null default 'user',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Trigger: auto-create profile on Google sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### qr_codes Table Changes
```sql
-- Add phone_number column and make user_id nullable
-- (user_id is already uuid — just need to ensure nullable + add phone_number)
alter table public.qr_codes
  alter column user_id drop not null,
  add column phone_number text;

-- Update existing rows: user_id stays, phone_number stays null (pre-existing QRs)
-- New public QRs: user_id = null, phone_number = verified phone

-- Index for account-linking query
create index on public.qr_codes (phone_number) where user_id is null;
```

### Admin Data Query (Users Table)
```typescript
// src/app/admin/page.tsx — Server Component, uses admin client
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminPage() {
  const admin = createAdminClient()

  // Join profiles + qr_codes aggregation
  const { data: users } = await admin
    .from('profiles')
    .select(`
      id,
      email,
      phone_number,
      role,
      is_active,
      created_at,
      qr_codes(count, scan_count)
    `)
    .order('created_at', { ascending: false })

  // Note: Supabase select with count aggregation:
  // qr_codes!inner(count) for inner join or use RPC for complex aggregations
  return <UserTable users={users} />
}
```

---

## Database Schema Overview

Complete set of DB changes for Phase 5:

```
NEW tables:
  public.profiles    — user metadata + role + phone + is_active
  public.phone_usage — phone_number (PK), usage_count, timestamps

MODIFIED tables:
  public.qr_codes
    - user_id: make nullable (was NOT NULL)
    - phone_number: add text column
    - index on (phone_number) WHERE user_id IS NULL

NEW type:
  public.app_role AS ENUM ('admin', 'user')

NEW RLS policies:
  profiles: SELECT for authenticated users (own row only)
  phone_usage: NO RLS — service-role only

MODIFIED middleware:
  src/middleware.ts: add /admin/* matcher + profiles role check

NEW env vars:
  TWILIO_ACCOUNT_SID
  TWILIO_AUTH_TOKEN
  TWILIO_VERIFY_SERVICE_SID
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `cookies()` synchronous | `await cookies()` async | Next.js 15 (RC) | Must use async/await — sync still works but deprecated |
| Supabase anon sign-in for unauth tracking | Dedicated phone verification flow (Twilio) | Design decision for this phase | Cleaner UX; no dangling anon Supabase users |
| Admin roles via hardcoded email list | `app_role` enum in profiles table | Industry best practice | Scalable, DB-managed, no deployments needed to add admins |

**Deprecated/outdated:**
- `cookies()` called synchronously: still works in Next.js 16.x but will be removed in future — always use `await cookies()`.
- Supabase `getSession()`: returns cached data — use `getUser()` for auth checks (already established in this project, confirmed in STATE.md).

---

## Open Questions

1. **Admin DB aggregation queries**
   - What we know: Supabase JS client supports `.select('related_table(count)')` for count aggregates and can join profiles to qr_codes
   - What's unclear: Whether a direct JS client query or a Postgres RPC is better for the admin user-table query (email + QR count + total scans in one query)
   - Recommendation: Start with a direct Supabase query using select with count/sum aggregation; if it proves clunky, write a simple RPC function `get_admin_user_stats()`

2. **Twilio cost management for MVP**
   - What we know: Twilio charges $0.05 per successful verification + $0.0083/SMS (US). 5 free uses per phone means a user who loses their phone cookie will re-verify and incur cost.
   - What's unclear: Expected verification volume — is there a risk of cost blowup?
   - Recommendation: Implement the 60-second resend cooldown timer in the OTP UI. For MVP, no additional rate limiting is needed beyond what Twilio provides (5 attempts / 10 min per phone).

3. **Phone number normalization UX**
   - What we know: Twilio requires E.164 format; users are accustomed to entering local formats
   - What's unclear: Whether to auto-format (prepend +1 for US) or require users to enter full E.164
   - Recommendation: Claude's discretion — add a country code prefix selector (defaulting to +1) alongside the phone number input field to normalize automatically

---

## Sources

### Primary (HIGH confidence)
- [Twilio Verify API Documentation](https://www.twilio.com/docs/verify/api/verification) — endpoint parameters, status values
- [Twilio Verify Quickstart Node.js](https://www.twilio.com/docs/verify/quickstarts/node-express) — SDK initialization, send/check flow
- [Twilio Verify Best Practices](https://www.twilio.com/docs/verify/developer-best-practices) — rate limiting, E.164 format, PII masking
- [Next.js cookies() API Reference](https://nextjs.org/docs/app/api-reference/functions/cookies) — async cookie API, set/get/delete options
- [Supabase Managing User Data](https://supabase.com/docs/guides/auth/managing-user-data) — profiles table pattern, auto-create trigger
- [Supabase Custom RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) — app_role enum, user_roles table, Auth Hook JWT claims
- [Supabase Anonymous Sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous) — `linkIdentity()` for OAuth linking
- [shadcn InputOTP component](https://ui.shadcn.com/docs/components/radix/input-otp) — installation, controlled usage, auto-submit pattern

### Secondary (MEDIUM confidence)
- [Supabase Service Role in Next.js](https://adrianmurage.com/posts/supabase-service-role-secret-key/) — admin client factory pattern, security rules
- [Next.js RBAC Middleware](https://www.jigz.dev/blogs/how-to-use-middleware-for-role-based-access-control-in-next-js-15-app-router) — middleware matcher pattern, role check flow

### Tertiary (LOW confidence)
- Admin aggregation query pattern — inferred from Supabase JS select API; specific syntax for count+sum join needs validation during implementation

---

## Metadata

**Confidence breakdown:**
- Standard stack (Twilio Verify, shadcn InputOTP): HIGH — official Twilio docs + shadcn docs verified
- Phone verification flow: HIGH — Twilio API is stable, Next.js cookie API verified against official docs
- Freemium gate (phone_usage table): HIGH — straightforward Supabase table + service-role pattern
- Admin role pattern (profiles + middleware): HIGH — Supabase official RBAC docs verified
- Account linking (phone QRs to Google user): MEDIUM — `linkIdentity()` exists, but the specific callback-based back-fill pattern is inferred from the API; test edge cases during implementation
- Admin aggregation queries: MEDIUM — pattern is correct but exact Supabase JS syntax for multi-table aggregation needs implementation validation

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (Twilio Verify API is stable; Next.js 15 cookie API is stable)
