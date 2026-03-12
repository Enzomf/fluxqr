# Phase 8: Add Unit Tests to All Components and Services - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish a testing framework (Vitest + React Testing Library) and write unit tests for all custom lib utilities, hooks, and components. Route files (page.tsx, layout.tsx, route.ts) and shadcn ui/ primitives are excluded. Server Actions are excluded — testing focuses on the building blocks, not the Next.js server layer.

</domain>

<decisions>
## Implementation Decisions

### Test framework
- **Vitest** as the test runner — native ESM, fast, built-in coverage, compatible with Next.js 16
- **React Testing Library** (@testing-library/react) with jsdom environment for component rendering tests
- **renderHook()** from RTL for testing custom hooks
- Migrate existing `src/lib/__tests__/redirect.test.ts` from plain Node.js assert to Vitest `expect()` syntax
- Add `test` script to package.json using Vitest

### Testing scope
- **Lib utilities:** redirect.ts, utils.ts, qr-generator.ts, twilio.ts — pure functions, highest ROI
- **Custom hooks:** use-slug-check.ts, use-copy-to-clipboard.ts — tested via renderHook()
- **All custom React components:** everything in components/shared/, components/dashboard/, components/qr-management/, components/public/, components/scanner/, components/admin/, components/auth/
- **Excluded:** components/ui/ (shadcn primitives — don't hand-edit), app/ route files (pages, layouts, API routes — too much Next.js internal mocking for low ROI), Server Actions, auto-generated types

### File layout
- Co-located test files: `src/lib/utils.test.ts` next to `src/lib/utils.ts`
- Migrate existing `src/lib/__tests__/redirect.test.ts` to `src/lib/redirect.test.ts`
- Remove empty `__tests__/` directory after migration

### Mocking strategy
- **Supabase:** vi.mock('lib/supabase/server') at module level. Most components receive data as props from Server Components — Supabase mocks rarely needed
- **Next.js APIs:** vi.mock('next/navigation') for useRouter, useSearchParams, usePathname. Return controlled values per test
- **Browser APIs:** Mock navigator.clipboard, navigator.share on globalThis in jsdom environment
- **Shared test setup:** Create `src/test/setup.ts` for global mocks (next/navigation, next/image) and `src/test/utils.tsx` for custom render helpers if needed. Avoids repeating mocks across 30+ test files

### Claude's Discretion
- Vitest configuration details (plugins, coverage provider choice)
- Which specific assertions to write per component (render checks, interaction tests, edge cases)
- Whether to use `@testing-library/user-event` vs `fireEvent`
- Test grouping strategy within files (describe blocks)
- Coverage threshold numbers (if any)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for test structure and assertion patterns.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/redirect.ts`: buildPlatformUrl, platformColor, platformLabel — already has plain assert tests to migrate
- `src/lib/utils.ts`: cn(), formatScanCount() — pure functions, trivially testable
- `src/lib/qr-generator.ts`: generateQrDataUrl(), downloadQrPng() — QR generation logic
- `src/lib/twilio.ts`: Twilio API helper — pure function wrapping fetch
- `src/hooks/use-slug-check.ts`: Debounced slug availability check with state management
- `src/hooks/use-copy-to-clipboard.ts`: Clipboard API wrapper with state

### Established Patterns
- Server Components pass data as props to Client Components — most component tests just need props, not mocked data sources
- `useActionState` for form submission state management in form components
- `cn()` for conditional class merging — CSS class assertions possible
- shadcn Dialog/AlertDialog/Sheet patterns used in qr-form-dialog, delete-dialog, qr-preview-dialog, phone-verify-dialog

### Integration Points
- `vitest.config.ts` at project root — new file
- `package.json` scripts — add "test" and "test:coverage" commands
- `src/test/setup.ts` — global test setup file (new)
- `tsconfig.json` — may need path alias configuration for test resolution

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-add-unit-tests-to-all-components-and-services*
*Context gathered: 2026-03-12*
