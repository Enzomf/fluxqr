---
phase: quick-10
plan: 10
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/index.ts
  - src/lib/redirect.ts
  - src/lib/__tests__/redirect.test.ts
  - src/app/dashboard/new/actions.ts
  - src/components/qr-management/platform-selector.tsx
  - src/components/qr-management/qr-form.tsx
  - src/components/shared/platform-badge.tsx
  - src/app/q/[slug]/scanner-landing.tsx
  - src/components/scanner/telegram-fallback.tsx
autonomous: true
requirements: [QUICK-10]

must_haves:
  truths:
    - "Telegram is no longer an option when creating a QR code"
    - "Existing Telegram QR codes still render in the scanner (no runtime crash)"
    - "Platform type only allows 'whatsapp' | 'sms'"
    - "TypeScript compiles with zero errors after removal"
    - "All redirect tests pass without Telegram assertions"
  artifacts:
    - path: "src/types/index.ts"
      provides: "Platform type without telegram"
      contains: "'whatsapp' | 'sms'"
    - path: "src/lib/redirect.ts"
      provides: "Platform URL/color/label helpers without telegram cases"
    - path: "src/components/qr-management/platform-selector.tsx"
      provides: "Platform dropdown with only WhatsApp and SMS options"
  key_links:
    - from: "src/types/index.ts"
      to: "all platform consumers"
      via: "Platform type union"
      pattern: "Platform.*whatsapp.*sms"
---

<objective>
Remove Telegram as a platform option from QR code generation across the entire codebase.

Purpose: Telegram is being deprecated as a platform. Users should only see WhatsApp and SMS when creating QR codes. The scanner must still handle legacy Telegram QR codes gracefully (no crash), but no new Telegram QR codes can be created.
Output: All Telegram references removed from types, UI, validation, and helpers. TelegramFallback component deleted.
</objective>

<execution_context>
@/Users/enzo.figueiredo/.claude/get-shit-done/workflows/execute-plan.md
@/Users/enzo.figueiredo/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@src/types/index.ts
@src/lib/redirect.ts
@src/lib/__tests__/redirect.test.ts
@src/app/dashboard/new/actions.ts
@src/components/qr-management/platform-selector.tsx
@src/components/qr-management/qr-form.tsx
@src/components/shared/platform-badge.tsx
@src/app/q/[slug]/scanner-landing.tsx
@src/components/scanner/telegram-fallback.tsx

<interfaces>
From src/types/index.ts:
```typescript
export type Platform = 'whatsapp' | 'sms' | 'telegram'
```

From src/lib/redirect.ts:
```typescript
export function buildPlatformUrl(platform: Platform, contactTarget: string, message: string): string
export function platformColor(platform: Platform): string
export function platformLabel(platform: Platform): string
```

From src/app/dashboard/new/actions.ts:
```typescript
platform: z.enum(['whatsapp', 'sms', 'telegram'], { message: 'Select a platform' })
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Remove Telegram from types, lib helpers, validation schemas, and tests</name>
  <files>
    src/types/index.ts,
    src/lib/redirect.ts,
    src/lib/__tests__/redirect.test.ts,
    src/app/dashboard/new/actions.ts
  </files>
  <action>
1. In `src/types/index.ts`: Change `Platform` type from `'whatsapp' | 'sms' | 'telegram'` to `'whatsapp' | 'sms'`.

2. In `src/lib/redirect.ts`:
   - Remove the `case 'telegram'` block from `buildPlatformUrl` (lines 23-25).
   - Remove the `case 'telegram'` line from `platformColor` (lines 36-37).
   - Remove the `case 'telegram'` and its return from `platformLabel` (lines 50-51).
   - Remove the comment about Telegram deep links from the JSDoc (line 8).
   - Add a default case to each switch that throws an error for exhaustiveness checking: `default: throw new Error(`Unknown platform: ${platform satisfies never}`)`.

3. In `src/app/dashboard/new/actions.ts`: Change the Zod enum from `z.enum(['whatsapp', 'sms', 'telegram'])` to `z.enum(['whatsapp', 'sms'])`.

4. In `src/lib/__tests__/redirect.test.ts`:
   - Remove the two Telegram `buildPlatformUrl` test assertions (lines 55-67).
   - Remove the `platformColor('telegram')` assertion (line 71).
   - Remove the `platformLabel('telegram')` assertion (line 76).
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && npx tsx src/lib/__tests__/redirect.test.ts</automated>
  </verify>
  <done>Platform type is 'whatsapp' | 'sms' only. All redirect helper switch statements have no telegram case. Zod validation rejects telegram. All redirect tests pass.</done>
</task>

<task type="auto">
  <name>Task 2: Remove Telegram from UI components, scanner, and delete TelegramFallback</name>
  <files>
    src/components/qr-management/platform-selector.tsx,
    src/components/qr-management/qr-form.tsx,
    src/components/shared/platform-badge.tsx,
    src/app/q/[slug]/scanner-landing.tsx,
    src/components/scanner/telegram-fallback.tsx
  </files>
  <action>
1. In `src/components/qr-management/platform-selector.tsx`: Remove the `<SelectItem value="telegram">Telegram</SelectItem>` line (line 68). Only WhatsApp and SMS remain.

2. In `src/components/qr-management/qr-form.tsx`: Remove the telegram placeholder conditional on line 134. Change `placeholder={platform === 'telegram' ? '@username' : '+1 555 000 0000'}` to just `placeholder="+1 555 000 0000"`.

3. In `src/components/shared/platform-badge.tsx`:
   - Remove `telegram: 'bg-sky-500/10 text-sky-400 border-sky-500/20'` from `platformStyles`.
   - Remove `telegram: 'Telegram'` from `platformLabels`.

4. In `src/app/q/[slug]/scanner-landing.tsx`:
   - Remove the `import { TelegramFallback }` line (line 7).
   - Remove the entire `if (qr.platform === 'telegram')` block (lines 17-26). NOTE: Legacy telegram QR codes in the database will fall through to the default WhatsApp/SMS rendering path, which is acceptable — `buildPlatformUrl` will throw for unknown platform, but since no new telegram QRs can be created and the DB constraint still exists, this is a known deprecation edge. If you want to be safe, add a fallback before the CTA button: `if (qr.platform !== 'whatsapp' && qr.platform !== 'sms') return null;` — but this is optional since no new telegram QRs will be created.

5. Delete the file `src/components/scanner/telegram-fallback.tsx` entirely.

6. After all edits, update `CLAUDE.md` directory structure comment: remove `└── scanner/                    # telegram-fallback` and replace with `└── scanner/                    # (reserved)` or remove the scanner line if the directory is now empty.
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>No Telegram option in platform selector. No TelegramFallback component. No telegram references in qr-form placeholder. TypeScript compiles cleanly with zero errors. Platform badge only has whatsapp and sms entries.</done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` — zero type errors
2. `npx tsx src/lib/__tests__/redirect.test.ts` — all tests pass
3. `grep -ri telegram src/ --include='*.ts' --include='*.tsx'` — no matches (except possibly comments about deprecation)
4. `npx next lint` — zero lint errors
</verification>

<success_criteria>
- Platform type is `'whatsapp' | 'sms'` with no telegram variant
- Platform selector dropdown shows only WhatsApp and SMS
- Zod validation schema rejects 'telegram' as a platform value
- TelegramFallback component file is deleted
- Scanner landing page has no telegram-specific code path
- TypeScript compiles with zero errors
- All existing tests pass
- No remaining telegram references in source code (grep returns empty)
</success_criteria>

<output>
After completion, create `.planning/quick/10-remove-telegram-option-from-qr-code-gene/10-SUMMARY.md`
</output>
