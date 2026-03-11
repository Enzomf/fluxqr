---
phase: quick-2
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/home-client.tsx
  - src/components/public/public-qr-form.tsx
autonomous: true
requirements: [QUICK-2]
must_haves:
  truths:
    - "User sees their verified phone number displayed in the QR generation form"
    - "Generate button text includes the verified phone number for confirmation"
    - "Phone number is read-only (not editable) in the form"
  artifacts:
    - path: "src/components/public/public-qr-form.tsx"
      provides: "Phone number display and confirmation in generate button"
    - path: "src/app/home-client.tsx"
      provides: "Passes phone prop to PublicQrForm"
  key_links:
    - from: "src/app/home-client.tsx"
      to: "src/components/public/public-qr-form.tsx"
      via: "phone prop"
      pattern: "phone=\\{phone\\}"
---

<objective>
Display the verified phone number in the public QR generation form so users can see which number will be used as the contact target. Currently the backend already uses the verified_phone cookie as contact_target, but the form UI gives no visual indication of which number is being used.

Purpose: Match the BACKLOG spec (Task 14) which calls for "Phone displayed as read-only chip" and "Generate button shows phone number as confirmation."
Output: Updated PublicQrForm showing the phone number and a contextual generate button.
</objective>

<execution_context>
@/Users/enzo.figueiredo/.claude/get-shit-done/workflows/execute-plan.md
@/Users/enzo.figueiredo/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/app/home-client.tsx
@src/components/public/public-qr-form.tsx
@src/app/actions/create-public-qr.ts
@CLAUDE.md
</context>

<interfaces>
<!-- Key contracts the executor needs -->

From src/app/home-client.tsx:
```typescript
// phone state is already tracked:
const [phone, setPhone] = useState(verifiedPhone ?? '')

// PublicQrForm is rendered at the 'form' step but currently receives no phone prop:
<PublicQrForm
  qrType={qrType}
  onResult={(data) => { setQrData(data); setStep('result') }}
  onGateHit={() => setStep('gated')}
  onBack={() => setStep('grid')}
/>
```

From src/components/public/public-qr-form.tsx:
```typescript
interface PublicQrFormProps {
  qrType: 'default' | 'custom'
  onResult: (qrData: { slug: string; dataUrl: string; label: string }) => void
  onGateHit: () => void
  onBack: () => void
}
```

From src/lib/utils.ts:
```typescript
export function cn(...inputs: ClassValue[]): string
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add phone prop to PublicQrForm and display verified number in form UI</name>
  <files>src/components/public/public-qr-form.tsx, src/app/home-client.tsx</files>
  <action>
1. In `src/components/public/public-qr-form.tsx`:
   - Add `phone: string` to `PublicQrFormProps` interface.
   - Above the message textarea (or above the generate button for 'default' qrType), render a read-only phone chip showing the verified number. Style it as a small pill/badge:
     ```
     <div className="flex items-center gap-2 rounded-md bg-[#0F172A] border border-[#334155] px-3 py-2">
       <Phone size={14} className="text-[#6366F1]" />
       <span className="text-sm text-white font-mono">{phone}</span>
     </div>
     ```
     Import `Phone` from `lucide-react`.
   - Add a label above the chip: `<label className="text-sm font-medium text-white">Your number</label>` wrapped in a `flex flex-col gap-1.5` container (same pattern as the message label).
   - Update the generate button text to include the phone number:
     - When not pending: `Generate QR for {phone}` (use template literal)
     - When pending: `Generating...` (unchanged)
   - The phone chip is purely display — no input, no onChange. The backend reads from the cookie, not from the form.

2. In `src/app/home-client.tsx`:
   - Pass `phone={phone}` prop to the `<PublicQrForm>` component where it is rendered in the `step === 'form'` block.
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>
    - PublicQrForm accepts and displays the phone prop as a read-only styled chip
    - Generate button reads "Generate QR for +XX XXXX..." with the actual verified number
    - HomeClient passes the phone state to PublicQrForm
    - TypeScript compiles with no errors
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with no type errors
- Visual check: form step shows phone number chip and contextual generate button text
</verification>

<success_criteria>
- Verified phone number is visible in the public QR generation form as a read-only chip
- Generate button text includes the phone number for user confirmation
- No TypeScript errors
- No changes to backend logic (contact_target already uses cookie)
</success_criteria>

<output>
After completion, create `.planning/quick/2-use-verified-phone-number-as-contact-tar/2-SUMMARY.md`
</output>
