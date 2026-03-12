---
phase: quick-8
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/dashboard/phone-verify-dialog.tsx
  - src/components/qr-management/qr-form.tsx
  - BACKLOG.MD
  - package.json
  - pnpm-lock.yaml
autonomous: true
requirements: [CR-01, CR-02, CR-03]
must_haves:
  truths:
    - "No hardcoded hex colors in phone-verify-dialog.tsx — uses Tailwind design tokens"
    - "phone-verify-dialog.tsx lives in the correct directory per project conventions"
    - "twilio npm package is removed from dependencies since raw fetch replaced the SDK"
    - "BACKLOG.MD env var references reflect the actual implementation"
  artifacts:
    - path: "src/components/dashboard/phone-verify-dialog.tsx"
      provides: "Phone verify dialog with token-based classes"
      contains: "bg-background"
    - path: "BACKLOG.MD"
      provides: "Updated documentation with correct env var names"
      contains: "TWILIO_API_KEY_SID"
    - path: "package.json"
      provides: "Clean dependencies without unused twilio SDK"
  key_links:
    - from: "src/components/qr-management/qr-form.tsx"
      to: "phone-verify-dialog"
      via: "import path"
      pattern: "from '@/components/"
---

<objective>
Fix three code review issues: replace hardcoded hex colors with Tailwind design tokens in phone-verify-dialog.tsx, evaluate its directory placement, remove unused twilio npm package, and update BACKLOG.MD env var documentation.

Purpose: Clean up code review findings to maintain project conventions and remove dead dependencies.
Output: Fixed component, updated documentation, leaner package.json.
</objective>

<execution_context>
@/Users/enzo.figueiredo/.claude/get-shit-done/workflows/execute-plan.md
@/Users/enzo.figueiredo/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@src/app/globals.css
@src/components/dashboard/phone-verify-dialog.tsx
@src/components/qr-management/qr-form.tsx
@src/lib/twilio.ts
@BACKLOG.MD

<interfaces>
<!-- Tailwind design tokens from globals.css @theme inline -->
- `--color-background: var(--background)` => `bg-background` = `hsl(215 28% 9%)` = `#0F172A` (canvas)
- `--color-surface-overlay: #334155` => `bg-surface-overlay` / `border-surface-overlay`
- `--color-border: hsl(0 0% 100% / 0.08)` => `border-border` (default shadcn border)
- `--color-secondary: hsl(215 20% 27%)` => `bg-secondary` / `border-secondary`

<!-- phone-verify-dialog.tsx is imported from: -->
From src/components/qr-management/qr-form.tsx:
```typescript
import { PhoneVerifyDialog } from '@/components/dashboard/phone-verify-dialog'
```

<!-- twilio.ts current env vars (raw fetch, NOT SDK): -->
```typescript
const sid = process.env.TWILIO_API_KEY_SID!
const secret = process.env.TWILIO_API_KEY_SECRET!
// Also uses: process.env.TWILIO_VERIFY_SERVICE_SID!
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace hardcoded hex colors with design tokens and evaluate directory placement</name>
  <files>src/components/dashboard/phone-verify-dialog.tsx, src/components/qr-management/qr-form.tsx</files>
  <action>
In `src/components/dashboard/phone-verify-dialog.tsx` line 44, replace:
- `bg-[#0F172A]` with `bg-background` (this maps to the same `#0F172A` canvas color via `--color-background` in globals.css)
- `border-[#334155]` with `border-surface-overlay` (this maps to the same `#334155` overlay color via `--color-surface-overlay` in globals.css)

The resulting className should be: `sm:max-w-md bg-background border-surface-overlay p-0`

Regarding directory placement: The component IS used by `qr-form.tsx` (in `components/qr-management/`), and it wraps `PhoneVerifyForm` and `OtpVerifyForm` (from `components/public/`). It bridges dashboard and public features. However, it is a dialog triggered specifically during QR management (the form context). The most pragmatic action is to KEEP it in `components/dashboard/` since that is where it was placed and it is used in a dashboard context (creating/editing QR codes). No file move needed — the import path from qr-form.tsx already works. Moving it would be churn for no real benefit since it is genuinely used within the dashboard flow.

No changes to qr-form.tsx import path needed.
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && grep -c 'bg-\[#' src/components/dashboard/phone-verify-dialog.tsx | grep -q '^0$' && echo "PASS: No hardcoded hex colors" || echo "FAIL: Hardcoded hex colors remain"</automated>
  </verify>
  <done>phone-verify-dialog.tsx uses `bg-background` and `border-surface-overlay` instead of hardcoded hex values. Zero arbitrary color values in the file.</done>
</task>

<task type="auto">
  <name>Task 2: Remove unused twilio npm package and update BACKLOG.MD env var documentation</name>
  <files>package.json, pnpm-lock.yaml, BACKLOG.MD</files>
  <action>
1. Remove the `twilio` npm package. Run `pnpm remove twilio` from the project root. The `twilio` SDK (v5.12.2) is listed in package.json dependencies but nothing imports from it — `src/lib/twilio.ts` was rewritten to use raw `fetch` with the Twilio Verify REST API directly.

2. In `BACKLOG.MD`, update TASK 13 (Phone verification via Twilio SMS OTP) to reflect the actual implementation:
   - In the "Technical Implementation" section (~line 534-535), replace:
     `Install twilio npm package.` with `Uses raw fetch against Twilio Verify REST API (no SDK).`
   - Replace: `lib/twilio.ts — Twilio client init using TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID env vars (server only).`
     with: `lib/twilio.ts — Raw fetch wrapper for Twilio Verify REST API using TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, TWILIO_VERIFY_SERVICE_SID env vars (server only).`
   - In the env vars block (~lines 542-545), replace:
     ```
     TWILIO_ACCOUNT_SID
     TWILIO_AUTH_TOKEN
     TWILIO_VERIFY_SERVICE_SID
     ```
     with:
     ```
     TWILIO_API_KEY_SID
     TWILIO_API_KEY_SECRET
     TWILIO_VERIFY_SERVICE_SID
     ```

Do NOT update files in `.planning/phases/` — those are historical records and should not be retroactively modified.
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && ! grep -q '"twilio"' package.json && echo "PASS: twilio removed from package.json" || echo "FAIL: twilio still in package.json"</automated>
  </verify>
  <done>The `twilio` npm package is removed from dependencies. BACKLOG.MD references `TWILIO_API_KEY_SID` and `TWILIO_API_KEY_SECRET` instead of the old `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`. The env var documentation matches the actual `src/lib/twilio.ts` implementation.</done>
</task>

</tasks>

<verification>
- `pnpm run lint` passes with zero errors
- `pnpm run build` completes successfully (no type errors, no broken imports)
- No hardcoded hex color values (`#0F172A`, `#334155`) in phone-verify-dialog.tsx
- No `"twilio"` entry in package.json dependencies
- BACKLOG.MD contains `TWILIO_API_KEY_SID` and `TWILIO_API_KEY_SECRET` (not `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`)
</verification>

<success_criteria>
1. phone-verify-dialog.tsx uses Tailwind design token classes (`bg-background`, `border-surface-overlay`) — zero arbitrary hex colors
2. `twilio` npm package is uninstalled and absent from package.json
3. BACKLOG.MD env var section for Task 13 reflects the current API key-based implementation
4. Project builds and lints cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/8-fix-all-issues-found-on-this-code-review/8-SUMMARY.md`
</output>
