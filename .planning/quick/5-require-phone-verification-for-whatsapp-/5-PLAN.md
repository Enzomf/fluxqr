---
phase: quick-5
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/actions/check-otp.ts
  - src/app/dashboard/new/page.tsx
  - src/app/dashboard/new/actions.ts
  - src/app/dashboard/[id]/edit/page.tsx
  - src/app/dashboard/[id]/edit/actions.ts
  - src/components/qr-management/qr-form.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "When an authenticated user verifies their phone via OTP, the phone number is saved to profiles.phone_number"
    - "Dashboard QR create/edit pages read verified phone from profiles table, not from cookie"
    - "Server actions for create/edit use profiles.phone_number for WhatsApp/SMS enforcement"
    - "Public (unauthenticated) flow still works with cookie only"
    - "WhatsApp/SMS QR codes cannot be created without a verified phone in profiles"
  artifacts:
    - path: "src/app/actions/check-otp.ts"
      provides: "Saves phone to profiles.phone_number when user is authenticated"
    - path: "src/app/dashboard/new/page.tsx"
      provides: "Reads phone from profiles table instead of cookie"
    - path: "src/app/dashboard/new/actions.ts"
      provides: "Server-side guard reads profiles.phone_number"
    - path: "src/app/dashboard/[id]/edit/page.tsx"
      provides: "Reads phone from profiles table instead of cookie"
    - path: "src/app/dashboard/[id]/edit/actions.ts"
      provides: "Server-side guard reads profiles.phone_number"
  key_links:
    - from: "src/app/actions/check-otp.ts"
      to: "profiles.phone_number"
      via: "admin client update after OTP approval"
      pattern: "profiles.*update.*phone_number"
    - from: "src/app/dashboard/new/page.tsx"
      to: "profiles.phone_number"
      via: "supabase select in Server Component"
      pattern: "profiles.*select.*phone_number"
    - from: "src/app/dashboard/new/actions.ts"
      to: "profiles.phone_number"
      via: "supabase select in Server Action"
      pattern: "profiles.*select.*phone_number"
---

<objective>
Persist verified phone numbers in the `profiles` table and use that as the source of truth for dashboard QR creation/editing instead of the `verified_phone` cookie.

Purpose: Phone verification must survive across sessions, devices, and cookie clears. The database is the correct persistence layer for authenticated users. The cookie remains for the unauthenticated public flow only.

Output: Updated check-otp action that writes to profiles, updated dashboard pages and server actions that read from profiles, unchanged public flow.
</objective>

<execution_context>
@/Users/enzo.figueiredo/.claude/get-shit-done/workflows/execute-plan.md
@/Users/enzo.figueiredo/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@src/app/actions/check-otp.ts
@src/app/dashboard/new/page.tsx
@src/app/dashboard/new/actions.ts
@src/app/dashboard/[id]/edit/page.tsx
@src/app/dashboard/[id]/edit/actions.ts
@src/components/qr-management/qr-form.tsx
@src/app/auth/callback/route.ts
@src/lib/supabase/server.ts
@src/lib/supabase/admin.ts

<interfaces>
From src/lib/supabase/server.ts:
```typescript
export async function createClient(): Promise<SupabaseClient>
// Uses cookie-based auth (anon key), respects RLS
```

From src/lib/supabase/admin.ts:
```typescript
export function createAdminClient(): SupabaseClient
// Service-role, bypasses RLS. Use for cross-user writes.
```

From src/app/dashboard/new/actions.ts:
```typescript
export type FormState = {
  errors?: { [field: string]: string[] }
  message?: string | null
}
```

From src/components/qr-management/qr-form.tsx:
```typescript
interface QrFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  defaultValues?: Partial<QrCode>
  mode: 'create' | 'edit'
  verifiedPhone?: string | null
}
```

Database (profiles table, already exists from migration 0002):
```sql
CREATE TABLE public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text,
  phone_number text,  -- EXISTS but never populated
  role         app_role NOT NULL DEFAULT 'user',
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);
-- RLS: users can SELECT their own row
```

From src/app/auth/callback/route.ts (already saves phone to profiles on OAuth):
```typescript
// Line 55-57: already updates profiles.phone_number from cookie on OAuth callback
await admin.from('profiles').update({ phone_number: verifiedPhone }).eq('id', user.id)
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Save phone to profiles on OTP verification and read from profiles in dashboard pages</name>
  <files>src/app/actions/check-otp.ts, src/app/dashboard/new/page.tsx, src/app/dashboard/[id]/edit/page.tsx</files>
  <action>
**1. Update src/app/actions/check-otp.ts** to save phone to profiles when authenticated:

After the existing cookie-set block (line 39-45), add a try/catch block that checks if the user is authenticated and, if so, updates their profile:

```typescript
// After setting the cookie (keep cookie for public flow):

// If user is authenticated, persist phone to profiles table
try {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()
    await admin
      .from('profiles')
      .update({ phone_number: phone })
      .eq('id', user.id)
  }
} catch {
  // Non-blocking: cookie is the fallback, profile update is best-effort
  console.error('[checkOtp] Failed to update profile phone_number')
}
```

Use dynamic imports so that check-otp.ts does not import server/admin at the top level (it is also called from the unauthenticated flow). Use admin client for the write because RLS on profiles only allows SELECT for the user, not UPDATE (the auth callback already uses admin client for the same operation -- see line 44-57 of callback/route.ts).

Keep the cookie set -- it is still needed for the unauthenticated public QR creation flow.

**2. Update src/app/dashboard/new/page.tsx** to read from profiles instead of cookie:

Replace the cookie-based phone lookup:
```typescript
// REMOVE:
const cookieStore = await cookies()
const verifiedPhone = cookieStore.get('verified_phone')?.value ?? null

// REPLACE WITH:
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
let verifiedPhone: string | null = null
if (user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('phone_number')
    .eq('id', user.id)
    .single()
  verifiedPhone = profile?.phone_number ?? null
}
```

Add import for `createClient` from `@/lib/supabase/server`. Remove the `cookies` import from `next/headers` (no longer needed).

**3. Update src/app/dashboard/[id]/edit/page.tsx** to read from profiles instead of cookie:

This file already imports and uses `createClient`. Replace the parallel Promise.all that creates both supabase and cookieStore:

```typescript
// REMOVE:
const [supabase, cookieStore] = await Promise.all([createClient(), cookies()])
const verifiedPhone = cookieStore.get('verified_phone')?.value ?? null

// REPLACE WITH:
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
let verifiedPhone: string | null = null
if (user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('phone_number')
    .eq('id', user.id)
    .single()
  verifiedPhone = profile?.phone_number ?? null
}
```

Remove the `cookies` import from `next/headers` (no longer needed in this file).

Note: The `supabase` client uses RLS and the user can SELECT their own profile row, so the authenticated client works for reads.
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>check-otp saves phone to profiles.phone_number when user is authenticated. Dashboard new and edit pages read verifiedPhone from profiles table instead of cookie. TypeScript compiles cleanly.</done>
</task>

<task type="auto">
  <name>Task 2: Update server actions to enforce phone from profiles and add verification gate UI</name>
  <files>src/app/dashboard/new/actions.ts, src/app/dashboard/[id]/edit/actions.ts, src/components/qr-management/qr-form.tsx</files>
  <action>
**1. Update src/app/dashboard/new/actions.ts (createQrCode):**

Replace the cookie-based phone enforcement (lines 49-57). After `const { platform, contact_target, ...rest } = validated.data`, replace the phone block:

```typescript
// Server-side enforcement: WhatsApp/SMS require verified phone from profile
let finalContactTarget = contact_target
if (platform === 'whatsapp' || platform === 'sms') {
  const { data: profile } = await supabase
    .from('profiles')
    .select('phone_number')
    .eq('id', user.id)
    .single()

  if (!profile?.phone_number) {
    return { message: 'Phone verification required for WhatsApp/SMS QR codes. Please verify your phone number first.' }
  }
  finalContactTarget = profile.phone_number
}
```

This reads from the profiles table using the already-created `supabase` client (which has the user's session and respects RLS). Remove the `cookies` import from `next/headers` since it is no longer used in this file.

**2. Update src/app/dashboard/[id]/edit/actions.ts (updateQrCode):**

Replace the cookie-based phone enforcement (lines 55-63). After `const { label, slug, contact_target, default_message } = validated.data`, replace the phone block:

```typescript
// Server-side enforcement: WhatsApp/SMS require verified phone from profile
let finalContactTarget = contact_target
if (existing.platform === 'whatsapp' || existing.platform === 'sms') {
  const { data: profile } = await supabase
    .from('profiles')
    .select('phone_number')
    .eq('id', user.id)
    .single()

  if (!profile?.phone_number) {
    return { message: 'Phone verification required for WhatsApp/SMS QR codes. Please verify your phone number first.' }
  }
  finalContactTarget = profile.phone_number
}
```

Remove the `cookies` import from `next/headers` since it is no longer used in this file.

**3. Update src/components/qr-management/qr-form.tsx** to show verification gate:

Add `import Link from 'next/link'` at the top.

Modify the contact target conditional rendering (lines 84-113) to add a third branch for when platform is WhatsApp/SMS but no verified phone. The three branches should be:

```tsx
{showReadOnlyPhone ? (
  // EXISTING: read-only phone chip -- NO CHANGES
  <div className="space-y-1.5">
    {/* ... existing code unchanged ... */}
  </div>
) : isPhonePlatform && !verifiedPhone && mode === 'create' ? (
  // NEW: verification prompt when no phone on file
  <div className="space-y-1.5">
    <Label className="text-slate-200">Contact Target</Label>
    <div className="flex flex-col gap-2 rounded-lg bg-[#0F172A] border border-[#334155] p-4">
      <div className="flex items-center gap-2">
        <Phone size={16} className="text-slate-500" />
        <span className="text-sm text-slate-300 font-medium">Phone verification required</span>
      </div>
      <p className="text-xs text-slate-500">WhatsApp and SMS QR codes require a verified phone number.</p>
      <Link
        href="/"
        className="text-xs text-[#6366F1] hover:text-[#4F46E5] underline underline-offset-2 transition-colors"
      >
        Verify your phone number
      </Link>
    </div>
  </div>
) : (
  // EXISTING: editable input for Telegram -- NO CHANGES
  <div className="space-y-1.5">
    {/* ... existing code unchanged ... */}
  </div>
)}
```

Also disable the submit button when phone verification is needed. Change the Button's `disabled` prop from `disabled={pending}` to:
```tsx
disabled={pending || (isPhonePlatform && !verifiedPhone && mode === 'create')}
```

Do NOT change any existing branch behavior. The read-only chip and Telegram editable input must remain exactly as they are.
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>Server actions for create and edit read phone from profiles table (not cookie) and reject if missing. QrForm shows verification prompt when phone is missing for WhatsApp/SMS in create mode. Submit button disabled in that state. Edit mode and Telegram are unaffected. TypeScript compiles cleanly.</done>
</task>

</tasks>

<verification>
1. TypeScript compiles without errors: `npx tsc --noEmit`
2. On /dashboard/new, select WhatsApp with no phone in profiles -- form shows verification prompt, submit disabled
3. On /dashboard/new, select Telegram -- editable input works as before
4. Verify phone via OTP while logged in -- profiles.phone_number populated
5. On /dashboard/new, select WhatsApp with phone in profiles -- read-only chip shows profile phone
6. Public flow (unauthenticated) on / still works with cookie-based verification
7. Auth callback (src/app/auth/callback/route.ts) is unchanged -- it already saves phone to profiles
</verification>

<success_criteria>
- Authenticated OTP verification saves phone to profiles.phone_number
- Dashboard pages read verified phone from profiles table, not cookie
- Server actions enforce profiles.phone_number for WhatsApp/SMS (reject if missing, override form value if present)
- Public unauthenticated flow remains cookie-based (no regression)
- Auth callback continues to save phone on Google sign-in (already implemented, unchanged)
- QrForm shows clear verification prompt when phone is missing for WhatsApp/SMS
- TypeScript compiles cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/5-require-phone-verification-for-whatsapp-/5-SUMMARY.md`
</output>
