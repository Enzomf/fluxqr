---
phase: quick-14
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/dashboard/page.tsx
  - src/components/dashboard/qr-list.tsx
  - src/components/dashboard/qr-list-row.tsx
  - src/components/dashboard/qr-preview-dialog.tsx
autonomous: true
requirements: [QUICK-14]
must_haves:
  truths:
    - "QR preview dialog displays owner name and email above the QR image"
    - "QR preview dialog displays owner phone number below the QR image"
    - "Layout resembles a vCard/business card: name + email above QR, phone below"
  artifacts:
    - path: "src/components/dashboard/qr-preview-dialog.tsx"
      provides: "Updated preview dialog with owner contact info"
      contains: "ownerName"
  key_links:
    - from: "src/app/dashboard/page.tsx"
      to: "src/components/dashboard/qr-list.tsx"
      via: "ownerName, ownerEmail, ownerPhone props"
      pattern: "ownerName"
    - from: "src/components/dashboard/qr-list-row.tsx"
      to: "src/components/dashboard/qr-preview-dialog.tsx"
      via: "ownerName, ownerEmail, ownerPhone props"
      pattern: "ownerName"
---

<objective>
Add owner contact information (name, email, phone) to the QR code preview dialog so it resembles a vCard/business card layout: name and email displayed above the QR image, phone number displayed below.

Purpose: When users open the fullscreen QR preview, it should show the owner's identity alongside the code -- useful for sharing/printing as a self-contained business card.
Output: Updated QR preview dialog with owner contact info passed from the dashboard server component.
</objective>

<execution_context>
@/Users/enzo.figueiredo/.claude/get-shit-done/workflows/execute-plan.md
@/Users/enzo.figueiredo/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md

<interfaces>
<!-- Key types and contracts the executor needs -->

From src/types/index.ts:
```typescript
export type QrCode = {
  id: string
  user_id: string | null
  slug: string
  label: string
  platform: Platform
  contact_target: string
  default_message: string | null
  is_active: boolean
  scan_count: number
  phone_number: string | null
  created_at: string
  updated_at: string
}
```

From src/components/dashboard/qr-list-row.tsx:
```typescript
export type QrCodeWithImage = QrCode & { dataUrl: string }
```

From src/components/dashboard/qr-preview-dialog.tsx:
```typescript
interface QrPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qr: QrCodeWithImage
  thumbnailRect: DOMRect | null
}
```

From src/components/dashboard/qr-list.tsx:
```typescript
interface QrListProps {
  qrCodes: QrCodeWithImage[]
  verifiedPhone: string | null
}
```

From src/app/dashboard/page.tsx (server component):
- `user` from `supabase.auth.getUser()` has `user.user_metadata.full_name` (string) and `user.email` (string)
- `profile` from profiles table has `phone_number` (string | null)
- Already fetches both `user` and `profile` in parallel
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Thread owner info from DashboardPage through QrList and QrListRow to QrPreviewDialog</name>
  <files>src/app/dashboard/page.tsx, src/components/dashboard/qr-list.tsx, src/components/dashboard/qr-list-row.tsx, src/components/dashboard/qr-preview-dialog.tsx</files>
  <action>
**1. `src/app/dashboard/page.tsx`** -- Extract owner info from the already-fetched `user` object and pass it down:
- Derive `ownerName` from `user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? ''` (Google OAuth puts full name in user_metadata.full_name)
- Derive `ownerEmail` from `user.email ?? ''`
- `verifiedPhone` is already computed. Pass all three to QrList:
  ```tsx
  <QrList
    qrCodes={qrsWithImages}
    verifiedPhone={verifiedPhone}
    ownerName={ownerName}
    ownerEmail={ownerEmail}
  />
  ```
- No new DB query needed -- user and profile are already fetched.

**2. `src/components/dashboard/qr-list.tsx`** -- Add `ownerName: string` and `ownerEmail: string` to `QrListProps`. Pass all three owner props through to each `QrListRow`:
  ```tsx
  <QrListRow
    key={qr.id}
    qr={qr}
    onDelete={deleteQrCode}
    onEdit={openEdit}
    pulseId={pulseId}
    ownerName={ownerName}
    ownerEmail={ownerEmail}
    ownerPhone={verifiedPhone}
  />
  ```

**3. `src/components/dashboard/qr-list-row.tsx`** -- Add `ownerName: string`, `ownerEmail: string`, `ownerPhone: string | null` to `QrListRowProps`. Pass them through to `QrPreviewDialog`:
  ```tsx
  <QrPreviewDialog
    open={previewOpen}
    onOpenChange={setPreviewOpen}
    qr={qr}
    thumbnailRect={thumbnailRect}
    ownerName={ownerName}
    ownerEmail={ownerEmail}
    ownerPhone={ownerPhone}
  />
  ```

**4. `src/components/dashboard/qr-preview-dialog.tsx`** -- Add `ownerName: string`, `ownerEmail: string`, `ownerPhone: string | null` to `QrPreviewDialogProps`. Update the dialog content layout to a vCard/business-card style:

- **Above the QR image**, add a contact info block with the owner's name and email:
  ```tsx
  {/* Owner info - above QR */}
  <div className="text-center space-y-0.5">
    {ownerName && (
      <p className="text-lg font-semibold">{ownerName}</p>
    )}
    {ownerEmail && (
      <p className="text-sm text-muted-foreground">{ownerEmail}</p>
    )}
  </div>
  ```

- Keep the QR image as-is (280x280 with pop animation).

- **Below the QR image**, show the phone number (formatted with dashes for readability). Place it before the existing metadata block:
  ```tsx
  {/* Phone - below QR */}
  {ownerPhone && (
    <p className="text-base font-mono text-muted-foreground tracking-wide">
      {formatPhoneDisplay(ownerPhone)}
    </p>
  )}
  ```

- Add a local helper `formatPhoneDisplay` at the top of the component file that formats a phone like "415 - 265 - 5830" for US numbers or just returns the raw number for international:
  ```typescript
  function formatPhoneDisplay(phone: string): string {
    // Strip to digits only
    const digits = phone.replace(/\D/g, '')
    // US numbers: format as XXX - XXX - XXXX
    if (digits.length === 10) {
      return `${digits.slice(0, 3)} - ${digits.slice(3, 6)} - ${digits.slice(6)}`
    }
    // US with country code: +1 XXX - XXX - XXXX
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+1 ${digits.slice(1, 4)} - ${digits.slice(4, 7)} - ${digits.slice(7)}`
    }
    // International: return as-is
    return phone
  }
  ```

- Keep the existing metadata block (label, platform badge, scan count) and share actions below the phone number.

- The final content order inside the `flex flex-col items-center gap-4` div should be:
  1. Owner name + email (new)
  2. QR image (existing)
  3. Phone number (new)
  4. Metadata: label, platform badge, scan count (existing)
  5. Share actions (existing)

Use `cn()` from `@/lib/utils` for any conditional class merging (per CLAUDE.md).
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>
    - QR preview dialog renders owner name and email above the QR image
    - QR preview dialog renders owner phone number below the QR image in a formatted style
    - All TypeScript types compile cleanly with no errors
    - Props flow: DashboardPage -> QrList -> QrListRow -> QrPreviewDialog
    - No new database queries needed (reuses existing user + profile data)
  </done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with zero errors
2. Open dashboard, click a QR code thumbnail to open preview dialog
3. Verify name and email appear above the QR image
4. Verify phone number appears below the QR image in formatted style
5. Verify existing functionality (share, copy link, close, pop animation) still works
</verification>

<success_criteria>
- QR preview dialog shows owner name + email above the QR image
- QR preview dialog shows formatted phone number below the QR image
- TypeScript compiles cleanly
- No new database queries introduced
- Layout follows vCard/business card pattern matching the reference design
</success_criteria>

<output>
After completion, create `.planning/quick/14-add-owner-name-email-and-phone-number-to/14-SUMMARY.md`
</output>
