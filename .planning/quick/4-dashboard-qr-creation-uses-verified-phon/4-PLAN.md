---
phase: quick
plan: 4
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/dashboard/new/page.tsx
  - src/app/dashboard/new/actions.ts
  - src/components/qr-management/qr-form.tsx
  - src/components/qr-management/platform-selector.tsx
  - src/app/dashboard/[id]/edit/page.tsx
  - src/app/dashboard/[id]/edit/actions.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "Dashboard 'Create QR' form shows verified phone as read-only chip for WhatsApp/SMS platforms"
    - "Dashboard 'Create QR' form shows editable contact_target field for Telegram platform"
    - "Server Action overrides contact_target with verified phone for WhatsApp/SMS, preventing form tampering"
    - "Edit form shows the existing contact_target as read-only for WhatsApp/SMS (already saved data)"
    - "Switching platform from Telegram to WhatsApp/SMS swaps from editable input to read-only phone chip"
  artifacts:
    - path: "src/app/dashboard/new/page.tsx"
      provides: "Reads verified_phone cookie and passes to QrForm"
    - path: "src/components/qr-management/qr-form.tsx"
      provides: "Conditionally renders read-only phone chip or editable input based on platform + verifiedPhone"
    - path: "src/app/dashboard/new/actions.ts"
      provides: "Server-side override of contact_target for whatsapp/sms platforms"
  key_links:
    - from: "src/app/dashboard/new/page.tsx"
      to: "src/components/qr-management/qr-form.tsx"
      via: "verifiedPhone prop"
      pattern: "verifiedPhone="
    - from: "src/components/qr-management/qr-form.tsx"
      to: "src/components/qr-management/platform-selector.tsx"
      via: "onPlatformChange callback"
      pattern: "onPlatformChange"
---

<objective>
Use the verified phone number (from `verified_phone` cookie) as the pre-filled, read-only contact target in the dashboard QR creation and edit forms for WhatsApp and SMS platforms. Telegram (which uses @username) remains editable.

Purpose: Authenticated users who verified their phone should not need to re-type it. Enforcing this server-side prevents contact_target tampering for phone-based platforms.
Output: Updated QrForm with conditional contact_target rendering, updated Server Actions with server-side phone override, updated Server Components passing verifiedPhone prop.
</objective>

<execution_context>
@/Users/enzo.figueiredo/.claude/get-shit-done/workflows/execute-plan.md
@/Users/enzo.figueiredo/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@src/types/index.ts
@src/components/qr-management/qr-form.tsx
@src/components/qr-management/platform-selector.tsx
@src/app/dashboard/new/page.tsx
@src/app/dashboard/new/actions.ts
@src/app/dashboard/[id]/edit/page.tsx
@src/app/dashboard/[id]/edit/actions.ts

<interfaces>
<!-- Key types and contracts the executor needs -->

From src/types/index.ts:
```typescript
export type Platform = 'whatsapp' | 'sms' | 'telegram'
export type QrCode = {
  id: string; user_id: string | null; slug: string; label: string;
  platform: Platform; contact_target: string; default_message: string | null;
  is_active: boolean; scan_count: number; phone_number: string | null;
  created_at: string; updated_at: string;
}
```

From src/app/dashboard/new/actions.ts:
```typescript
export type FormState = {
  errors?: { [field: string]: string[] }
  message?: string | null
}
```

From src/components/qr-management/platform-selector.tsx:
```typescript
interface PlatformSelectorProps {
  defaultValue?: Platform
  disabled?: boolean
  error?: string[]
}
// Uses <Select name="platform"> -- no onChange callback currently
```

From src/components/qr-management/qr-form.tsx:
```typescript
interface QrFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  defaultValues?: Partial<QrCode>
  mode: 'create' | 'edit'
}
// Currently no verifiedPhone prop, no platform state tracking
```

Reference pattern -- public form read-only phone chip (src/components/public/public-qr-form.tsx):
```tsx
<div className="flex items-center gap-2 rounded-md bg-[#0F172A] border border-[#334155] px-3 py-2">
  <Phone size={14} className="text-[#6366F1]" />
  <span className="text-sm text-white font-mono">{phone}</span>
</div>
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add platform change callback to PlatformSelector and wire platform-aware contact_target in QrForm</name>
  <files>
    src/components/qr-management/platform-selector.tsx,
    src/components/qr-management/qr-form.tsx
  </files>
  <action>
**PlatformSelector changes (platform-selector.tsx):**

Add an `onValueChange?: (value: Platform) => void` prop to PlatformSelectorProps. Pass it to the `<Select>` component's `onValueChange` prop. This enables the parent QrForm to track which platform is currently selected.

**QrForm changes (qr-form.tsx):**

1. Add `verifiedPhone?: string | null` to `QrFormProps`.

2. Add platform state tracking:
   ```typescript
   const [platform, setPlatform] = useState<Platform | undefined>(defaultValues?.platform)
   ```
   Import `Platform` from `@/types` and `useState` from `react`.

3. Pass `onValueChange={setPlatform}` to PlatformSelector.

4. Derive whether contact_target should be read-only:
   ```typescript
   const isPhonePlatform = platform === 'whatsapp' || platform === 'sms'
   const useVerifiedPhone = isPhonePlatform && !!verifiedPhone
   ```

5. Replace the existing contact_target `<Input>` block (lines 75-96) with conditional rendering:

   **When `useVerifiedPhone` is true:** Show a read-only phone chip (same visual pattern as public form) plus a hidden input to submit the value:
   ```tsx
   <div className="space-y-1.5">
     <Label className="text-slate-200">Contact Target</Label>
     <div className="flex items-center gap-2 rounded-md bg-[#0F172A] border border-[#334155] px-3 py-2">
       <Phone size={14} className="text-[#6366F1]" />
       <span className="text-sm text-white font-mono">{verifiedPhone}</span>
     </div>
     <input type="hidden" name="contact_target" value={verifiedPhone} />
     <p className="text-xs text-slate-500">Your verified phone number</p>
   </div>
   ```
   Import `Phone` from `lucide-react`.

   **When `useVerifiedPhone` is false** (Telegram, or no verified phone): Keep the existing editable Input field exactly as-is, but update the placeholder dynamically based on current `platform` state (not just `defaultValues?.platform`):
   ```tsx
   placeholder={platform === 'telegram' ? '@username' : '+1 555 000 0000'}
   ```

6. For edit mode: if `mode === 'edit'` and `isPhonePlatform`, the contact_target should also appear read-only (using the existing `defaultValues.contact_target`), regardless of `verifiedPhone`. The QR was already created with the correct phone. Show the same chip UI but with `defaultValues.contact_target` as the displayed value.

   Update the logic:
   ```typescript
   const showReadOnlyPhone = isPhonePlatform && (!!verifiedPhone || mode === 'edit')
   const displayPhone = mode === 'edit' ? defaultValues?.contact_target : verifiedPhone
   ```
   Use `showReadOnlyPhone` and `displayPhone` in the conditional rendering.
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>QrForm conditionally renders a read-only phone chip for WhatsApp/SMS (using verifiedPhone in create mode, defaultValues.contact_target in edit mode) and an editable input for Telegram. PlatformSelector exposes onValueChange callback. TypeScript compiles without errors.</done>
</task>

<task type="auto">
  <name>Task 2: Read verified_phone cookie in Server Components and enforce server-side override in Server Actions</name>
  <files>
    src/app/dashboard/new/page.tsx,
    src/app/dashboard/new/actions.ts,
    src/app/dashboard/[id]/edit/page.tsx,
    src/app/dashboard/[id]/edit/actions.ts
  </files>
  <action>
**new/page.tsx changes:**

1. Import `cookies` from `next/headers`.
2. Make the component `async` (it currently is not).
3. Read the cookie:
   ```typescript
   const cookieStore = await cookies()
   const verifiedPhone = cookieStore.get('verified_phone')?.value ?? null
   ```
4. Pass to QrForm: `<QrForm action={createQrCode} mode="create" verifiedPhone={verifiedPhone} />`

**new/actions.ts changes (createQrCode):**

After Zod validation succeeds but before the Supabase insert, read the `verified_phone` cookie and override `contact_target` for phone-based platforms:

```typescript
import { cookies } from 'next/headers'

// ... after const validated = CreateQrSchema.safeParse(...)
// ... after if (!validated.success) return ...

const { platform, contact_target, ...rest } = validated.data

// Server-side enforcement: use verified phone for whatsapp/sms
let finalContactTarget = contact_target
if (platform === 'whatsapp' || platform === 'sms') {
  const cookieStore = await cookies()
  const verifiedPhone = cookieStore.get('verified_phone')?.value
  if (verifiedPhone) {
    finalContactTarget = verifiedPhone
  }
}
```

Update the insert to use `finalContactTarget`:
```typescript
const { error } = await supabase
  .from('qr_codes')
  .insert({ ...rest, platform, contact_target: finalContactTarget, user_id: user.id })
```

**edit/page.tsx changes:**

1. Import `cookies` from `next/headers`.
2. Read the cookie (same pattern as new/page.tsx).
3. Pass to QrForm: `<QrForm action={updateAction} defaultValues={qrCode} mode="edit" verifiedPhone={verifiedPhone} />`

**edit/actions.ts changes (updateQrCode):**

Same server-side override pattern as createQrCode. After validation, for whatsapp/sms platforms, read the verified_phone cookie and override contact_target. To know the platform (not in UpdateQrSchema), query the existing QR code's platform before the update:

```typescript
// After auth check, before the update query
const { data: existing } = await supabase
  .from('qr_codes')
  .select('platform')
  .eq('id', id)
  .eq('user_id', user.id)
  .single()

if (!existing) {
  return { message: 'QR code not found' }
}

let finalContactTarget = validated.data.contact_target
if (existing.platform === 'whatsapp' || existing.platform === 'sms') {
  const cookieStore = await cookies()
  const verifiedPhone = cookieStore.get('verified_phone')?.value
  if (verifiedPhone) {
    finalContactTarget = verifiedPhone
  }
}
```

Update the `.update()` call to use `finalContactTarget` instead of `contact_target`.
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>
    - new/page.tsx reads verified_phone cookie and passes it to QrForm
    - edit/page.tsx reads verified_phone cookie and passes it to QrForm
    - createQrCode server action overrides contact_target with verified phone for whatsapp/sms
    - updateQrCode server action overrides contact_target with verified phone for whatsapp/sms
    - TypeScript compiles without errors
  </done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` -- zero type errors
2. Navigate to `/dashboard/new`, select WhatsApp platform -- contact_target shows as read-only phone chip with the verified phone number
3. Switch to Telegram -- contact_target becomes an editable text input with @username placeholder
4. Switch back to SMS -- contact_target reverts to read-only phone chip
5. Submit a WhatsApp QR -- verify in DB that contact_target equals the verified phone, not whatever was in the hidden input
6. Edit an existing WhatsApp QR -- contact_target shown as read-only chip with the saved value
</verification>

<success_criteria>
- WhatsApp/SMS QR creation uses verified phone as read-only, non-editable contact target
- Telegram QR creation retains free-text editable contact target
- Server Actions enforce verified phone override for WhatsApp/SMS (tampering protection)
- Edit form shows contact_target as read-only for WhatsApp/SMS platforms
- No TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/4-dashboard-qr-creation-uses-verified-phon/4-SUMMARY.md`
</output>
