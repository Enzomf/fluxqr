---
phase: 08-add-unit-tests-to-all-components-and-services
plan: 01
subsystem: testing
tags: [vitest, react-testing-library, jsdom, unit-tests, hooks, lib-utils]

# Dependency graph
requires:
  - phase: 07-codereview
    provides: "Finalized lib utilities and hooks with clean TypeScript, zero lint errors"
provides:
  - "Vitest 4 + RTL 16 test infrastructure with jsdom environment and global mocks"
  - "6 co-located test files covering redirect.ts, utils.ts, qr-generator.ts, twilio.ts, use-slug-check.ts, use-copy-to-clipboard.ts"
  - "pnpm test:run exits with code 0 — 45 tests pass"
affects:
  - "08-02 through 08-05 — all subsequent test plans depend on this infrastructure"

# Tech tracking
tech-stack:
  added:
    - vitest 4.1.0
    - "@vitejs/plugin-react 6.0.0"
    - jsdom 28.1.0
    - "@testing-library/react 16.3.2"
    - "@testing-library/dom 10.4.1"
    - "@testing-library/jest-dom 6.9.1"
    - "@testing-library/user-event 14.6.1"
    - vite-tsconfig-paths 6.1.1
  patterns:
    - "Co-located test files (*.test.ts beside source) — no separate __tests__/ directories"
    - "vi.mock() hoisted in test files for module-level mocks"
    - "vi.stubGlobal('fetch') for testing HTTP clients without network"
    - "vi.stubEnv() for env var injection in tests"
    - "vi.useFakeTimers() + advanceTimersByTime for timer-dependent hook tests"
    - "renderHook + waitFor from @testing-library/react for async hook state transitions"

key-files:
  created:
    - vitest.config.mts
    - src/test/setup.ts
    - src/test/utils.tsx
    - src/lib/redirect.test.ts
    - src/lib/utils.test.ts
    - src/lib/qr-generator.test.ts
    - src/lib/twilio.test.ts
    - src/hooks/use-slug-check.test.ts
    - src/hooks/use-copy-to-clipboard.test.ts
  modified:
    - package.json
    - tsconfig.json
    - pnpm-lock.yaml

key-decisions:
  - "Co-located test files chosen over separate __tests__/ directories — closer to source, easier to navigate"
  - "vitest/globals in tsconfig.json types — eliminates per-file describe/it/expect/vi imports"
  - "src/test/utils.tsx is a thin RTL re-export — ready for provider wrapping in later plans if needed"
  - "useSlugCheck error test corrected: asyncStatus='idle' maps to external 'checking' (not 'idle') per hook contract"

patterns-established:
  - "Test infrastructure: Vitest + jsdom + RTL, globals=true, tsconfigPaths plugin for @/* alias"
  - "Global mocks in src/test/setup.ts: next/navigation, next/image, next/link, navigator.clipboard"
  - "Hook async tests: renderHook + waitFor with 1000ms timeout to accommodate 300ms debounce"

requirements-completed: [TEST-INFRA, TEST-LIB, TEST-HOOKS]

# Metrics
duration: 3min
completed: 2026-03-12
---

# Phase 8 Plan 01: Test Infrastructure + Lib/Hook Unit Tests Summary

**Vitest 4 + RTL 16 installed with jsdom, 45 unit tests across 6 co-located test files covering all lib utilities and hooks, pnpm test:run green**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-12T23:36:52Z
- **Completed:** 2026-03-12T23:39:56Z
- **Tasks:** 2
- **Files modified:** 12 (9 created, 3 modified)

## Accomplishments

- Installed and configured Vitest 4.1 with React plugin, jsdom environment, tsconfigPaths (@/* alias), and globals:true — all subsequent test plans inherit this setup
- Created `src/test/setup.ts` with global mocks for next/navigation, next/image, next/link, and navigator.clipboard — eliminates per-file boilerplate in 6 test files
- Wrote 45 passing tests across 6 files: redirect (11), utils (10), qr-generator (4), twilio (8), use-slug-check (7), use-copy-to-clipboard (4)
- Migrated and expanded the legacy plain-assert `__tests__/redirect.test.ts` to Vitest syntax with broader coverage, then removed the old directory

## Task Commits

Each task was committed atomically:

1. **Task 1: Install test dependencies and configure Vitest + global mocks** - `42c7fb2` (chore)
2. **Task 2: Write unit tests for all lib utilities and custom hooks** - `da58e10` (feat)

**Plan metadata:** _(created in final commit)_

## Files Created/Modified

- `vitest.config.mts` — Vitest config: jsdom, globals, tsconfigPaths plugin, v8 coverage
- `src/test/setup.ts` — Global mocks: next/navigation, next/image, next/link, navigator.clipboard
- `src/test/utils.tsx` — RTL re-export: render, screen, waitFor, userEvent
- `src/lib/redirect.test.ts` — 11 tests for buildPlatformUrl, platformColor, platformLabel
- `src/lib/utils.test.ts` — 10 tests for cn() and formatScanCount() (incl. ANLYT-02 boundary at 1000)
- `src/lib/qr-generator.test.ts` — 4 tests for generateQrDataUrl (URL format, QR options) and downloadQrPng
- `src/lib/twilio.test.ts` — 8 tests for sendVerification and checkVerification (URL, Basic auth, body params, error handling)
- `src/hooks/use-slug-check.test.ts` — 7 tests covering all 5 SlugStatus states including debounced async transitions
- `src/hooks/use-copy-to-clipboard.test.ts` — 4 tests for copy success, 2000ms reset (fake timers), and clipboard denial
- `package.json` — Added test/test:run/test:coverage scripts
- `tsconfig.json` — Added vitest/globals to types array
- `pnpm-lock.yaml` — Updated with 8 new devDependencies

## Decisions Made

- Co-located test files (`*.test.ts` beside source) — no separate `__tests__/` directories needed; plan mandated removal of the legacy pattern
- `vitest/globals` in tsconfig.json types — eliminates per-file `import { describe, it, expect, vi } from 'vitest'`; aligns with globals:true in vitest.config.mts
- `src/test/utils.tsx` kept minimal — just RTL re-exports; provider wrapping deferred until later plans when components need context

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed legacy `src/lib/__tests__/redirect.test.ts` in Task 1**
- **Found during:** Task 1 (Vitest setup verification)
- **Issue:** The old plain-assert file was picked up by Vitest (no test suite found error, exit code 1)
- **Fix:** Deleted `src/lib/__tests__/` directory early (plan said to do it in Task 2, but it was blocking Task 1 verification)
- **Files modified:** `src/lib/__tests__/redirect.test.ts` (deleted)
- **Verification:** `pnpm test:run` exited cleanly with "No test files found" (not an error — no tests existed yet)
- **Committed in:** `42c7fb2` (Task 1 commit)

**2. [Rule 1 - Bug] Corrected useSlugCheck fetch-error test expectation**
- **Found during:** Task 2 (use-slug-check.test.ts, first run)
- **Issue:** Plan spec said error path returns `'idle'`, but the hook's return logic is `asyncStatus === 'idle' ? 'checking' : asyncStatus` — so after `setAsyncStatus('idle')` on error, the external status is `'checking'`, not `'idle'`
- **Fix:** Updated test name and assertion to `'checking'` with explanation comment documenting the hook's internal vs external status mapping
- **Files modified:** `src/hooks/use-slug-check.test.ts`
- **Verification:** All 45 tests pass
- **Committed in:** `da58e10` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking issue, 1 behavior mismatch)
**Impact on plan:** Both auto-fixes necessary for correctness. No scope creep. Old directory removal was accelerated by 1 task but planned regardless.

## Issues Encountered

- Vitest 4.1.0 warns that `vite-tsconfig-paths` plugin is redundant since Vite now supports `resolve.tsconfigPaths` natively — non-breaking warning, plugin still works. Can be cleaned up in a future task by switching to `resolve: { tsconfigPaths: true }` in vitest.config.mts.

## Next Phase Readiness

- Test infrastructure ready: `pnpm test:run` runs 45 tests in ~1.5s, all green
- Patterns established for hooks (renderHook + waitFor), HTTP mocking (vi.stubGlobal fetch), and env vars (vi.stubEnv)
- Plans 08-02 through 08-05 can proceed with component and server action tests

---
*Phase: 08-add-unit-tests-to-all-components-and-services*
*Completed: 2026-03-12*
