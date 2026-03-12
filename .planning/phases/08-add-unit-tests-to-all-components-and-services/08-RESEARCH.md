# Phase 8: Add Unit Tests to All Components and Services - Research

**Researched:** 2026-03-12
**Domain:** Vitest + React Testing Library on Next.js 16 / React 19
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Test framework**
- Vitest as the test runner — native ESM, fast, built-in coverage, compatible with Next.js 16
- React Testing Library (@testing-library/react) with jsdom environment for component rendering tests
- renderHook() from RTL for testing custom hooks
- Migrate existing `src/lib/__tests__/redirect.test.ts` from plain Node.js assert to Vitest `expect()` syntax
- Add `test` script to package.json using Vitest

**Testing scope**
- Lib utilities: redirect.ts, utils.ts, qr-generator.ts, twilio.ts — pure functions, highest ROI
- Custom hooks: use-slug-check.ts, use-copy-to-clipboard.ts — tested via renderHook()
- All custom React components: everything in components/shared/, components/dashboard/, components/qr-management/, components/public/, components/scanner/, components/admin/, components/auth/
- Excluded: components/ui/ (shadcn primitives), app/ route files (pages, layouts, API routes), Server Actions, auto-generated types

**File layout**
- Co-located test files: `src/lib/utils.test.ts` next to `src/lib/utils.ts`
- Migrate existing `src/lib/__tests__/redirect.test.ts` to `src/lib/redirect.test.ts`
- Remove empty `__tests__/` directory after migration

**Mocking strategy**
- Supabase: vi.mock('lib/supabase/server') at module level. Most components receive data as props — mocks rarely needed
- Next.js APIs: vi.mock('next/navigation') for useRouter, useSearchParams, usePathname
- Browser APIs: Mock navigator.clipboard, navigator.share on globalThis in jsdom
- Shared test setup: `src/test/setup.ts` for global mocks (next/navigation, next/image) and `src/test/utils.tsx` for custom render helpers

**Business rule validation & bug fixes**
- Tests must assert business rules from REQUIREMENTS.md and CLAUDE.md
- If a test reveals a business rule violation or logic bug, fix the source code inline
- Commit bug fixes separately from test additions for clean git history

### Claude's Discretion
- Vitest configuration details (plugins, coverage provider choice)
- Which specific assertions to write per component (render checks, interaction tests, edge cases)
- Whether to use @testing-library/user-event vs fireEvent
- Test grouping strategy within files (describe blocks)
- Coverage threshold numbers (if any)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

## Summary

Phase 8 establishes a Vitest + React Testing Library test suite for all custom lib utilities, hooks, and components in a Next.js 16 / React 19 project. The existing codebase has zero test infrastructure — no vitest.config.ts, no package.json test script, and one plain Node.js assert file to migrate. The scope is deliberately narrow: lib utilities and hooks first (highest ROI, trivial mocking), then React components (jsdom rendering, Next.js navigation mocks).

The project uses pnpm, TypeScript strict mode, path alias `@/*` → `src/*`, and Tailwind v4 CSS-first config. None of these conflict with Vitest setup. The official Next.js 16 documentation (last updated 2026-02-27) recommends exactly the stack decided by the user: `vitest` + `@vitejs/plugin-react` + `jsdom` + `@testing-library/react` + `vite-tsconfig-paths`.

The main complexity in this phase is not test writing — it is setting up the global mocks (next/navigation, next/image, navigator.clipboard) correctly once so that 30+ test files can import without boilerplate. Getting this wiring right in Wave 0 is the critical path.

**Primary recommendation:** Install the canonical Next.js 16 Vitest stack, wire up global mocks in `src/test/setup.ts`, then write tests in order: lib utilities → hooks → simple components → complex components with Server Action dependencies.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vitest | ^3.x (latest) | Test runner, coverage | Official Next.js 16 recommendation; native ESM, fastest cold start |
| @vitejs/plugin-react | ^4.x | Transforms JSX/TSX in Vite/Vitest | Required for React component testing in Vitest |
| @testing-library/react | ^16.x | render(), screen, fireEvent, renderHook() | Official RTL for React 18+ (renderHook built-in, no separate package) |
| @testing-library/dom | ^10.x | DOM query utilities | Peer dep of @testing-library/react |
| @testing-library/jest-dom | ^6.x | Custom DOM matchers (toBeInTheDocument, etc.) | Industry standard; use `/vitest` import path |
| jsdom | ^25.x | Browser DOM simulation for Node.js | Only jsdom works with Vitest unit tests in Node |
| vite-tsconfig-paths | ^5.x | Resolves `@/*` alias in tests | Required for path aliases in vitest.config |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/user-event | ^14.x | Simulates real user interactions | Prefer over fireEvent for click/type/keyboard interactions |
| @vitest/coverage-v8 | (bundled with vitest) | Native V8 code coverage | Add `--coverage` flag; no extra install for v8 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jsdom | happy-dom | happy-dom is faster but less spec-complete; jsdom is proven for Next.js |
| @vitest/coverage-v8 | @vitest/coverage-istanbul | istanbul is slower but more accurate on edge cases; v8 is fine for this project size |
| @testing-library/user-event | fireEvent | user-event simulates real browser interactions (keyDown/keyPress/keyUp per char); fireEvent fires single synthetic event. Use user-event for interaction tests, fireEvent only for rare low-level events |

**Installation (pnpm — project uses pnpm):**
```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event vite-tsconfig-paths
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── test/
│   ├── setup.ts              # global mocks: next/navigation, next/image, navigator.clipboard
│   └── utils.tsx             # custom render wrapper if providers needed
├── lib/
│   ├── redirect.ts
│   ├── redirect.test.ts      # migrated from __tests__/redirect.test.ts
│   ├── utils.ts
│   ├── utils.test.ts
│   ├── qr-generator.ts
│   ├── qr-generator.test.ts
│   ├── twilio.ts
│   ├── twilio.test.ts
│   └── __tests__/            # DELETE after migration
├── hooks/
│   ├── use-slug-check.ts
│   ├── use-slug-check.test.ts
│   ├── use-copy-to-clipboard.ts
│   └── use-copy-to-clipboard.test.ts
└── components/
    ├── shared/
    │   ├── platform-badge.test.tsx
    │   ├── empty-state.test.tsx
    │   ├── qr-pulse-wrapper.test.tsx
    │   └── page-header.test.tsx
    ├── auth/
    │   └── google-sign-in-button.test.tsx
    ├── dashboard/
    │   ├── sidebar-link.test.tsx
    │   ├── qr-list-row.test.tsx
    │   ├── qr-list.test.tsx
    │   ├── delete-dialog.test.tsx
    │   ├── qr-preview-dialog.test.tsx
    │   ├── phone-verify-dialog.test.tsx
    │   └── sidebar.test.tsx
    ├── qr-management/
    │   ├── slug-input.test.tsx
    │   ├── platform-selector.test.tsx
    │   ├── qr-type-select.test.tsx
    │   ├── qr-form.test.tsx
    │   └── qr-form-dialog.test.tsx
    └── public/
        ├── freemium-gate.test.tsx
        ├── otp-verify-form.test.tsx
        ├── phone-verify-form.test.tsx
        ├── public-qr-form.test.tsx
        ├── public-qr-result-dialog.test.tsx
        └── qr-type-grid.test.tsx
```

### Pattern 1: vitest.config.mts (Root Config)

**What:** Single config file at project root that wires Vitest to understand the Next.js project structure.
**When to use:** Always — this is the mandatory configuration file.

```typescript
// Source: https://nextjs.org/docs/app/guides/testing/vitest (last updated 2026-02-27)
// vitest.config.mts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/components/ui/**',      // shadcn primitives — excluded per scope
        'src/app/**',                 // route files — excluded per scope
        'src/types/**',               // auto-generated types
        'src/test/**',                // test infrastructure itself
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
    },
  },
})
```

### Pattern 2: Global Test Setup (`src/test/setup.ts`)

**What:** Runs before every test file. Configures global mocks so individual test files stay clean.
**When to use:** This file is created once in Wave 0 and never duplicated per test.

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup DOM after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock next/navigation globally — components using useRouter, usePathname, useSearchParams
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/image globally — avoids "next/image requires Image Optimization API" errors in jsdom
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  },
}))

// Mock navigator.clipboard for useCopyToClipboard tests
Object.defineProperty(globalThis, 'navigator', {
  value: {
    ...globalThis.navigator,
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
  },
  writable: true,
})
```

### Pattern 3: Pure Function Tests (lib utilities)

**What:** Import function, call with inputs, assert outputs. No mocking needed.
**When to use:** redirect.ts, utils.ts — highest ROI tests.

```typescript
// Source: migrated from src/lib/__tests__/redirect.test.ts pattern
// src/lib/redirect.test.ts
import { describe, it, expect } from 'vitest'
import { buildPlatformUrl, platformColor, platformLabel } from './redirect'

describe('buildPlatformUrl', () => {
  it('builds WhatsApp URL and strips non-digits from contact', () => {
    expect(buildPlatformUrl('whatsapp', '+55 11 99999-8888', 'Hello'))
      .toBe('https://wa.me/5511999998888?text=Hello')
  })

  it('URI-encodes special characters in message', () => {
    expect(buildPlatformUrl('whatsapp', '5511999998888', 'Hello & World'))
      .toBe(`https://wa.me/5511999998888?text=${encodeURIComponent('Hello & World')}`)
  })

  it('builds SMS URL', () => {
    expect(buildPlatformUrl('sms', '+15550001234', 'Hi'))
      .toBe(`sms:+15550001234?body=Hi`)
  })
})
```

### Pattern 4: Hook Tests with renderHook()

**What:** Render hook in isolation, act on its returned API, assert state changes.
**When to use:** use-slug-check.ts, use-copy-to-clipboard.ts.

```typescript
// Source: https://testing-library.com/docs/react-testing-library/api/
// src/hooks/use-copy-to-clipboard.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCopyToClipboard } from './use-copy-to-clipboard'

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined)
  })

  it('starts with copied = false', () => {
    const { result } = renderHook(() => useCopyToClipboard())
    expect(result.current.copied).toBe(false)
  })

  it('sets copied = true after successful copy', async () => {
    const { result } = renderHook(() => useCopyToClipboard())
    await act(async () => {
      await result.current.copy('test text')
    })
    expect(result.current.copied).toBe(true)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text')
  })
})
```

### Pattern 5: Component Render Tests

**What:** render() component, query via screen, assert visible content and interactions.
**When to use:** All components in scope.

```typescript
// src/components/shared/platform-badge.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlatformBadge } from './platform-badge'

describe('PlatformBadge', () => {
  it('renders WhatsApp label', () => {
    render(<PlatformBadge platform="whatsapp" />)
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
  })

  it('renders SMS label', () => {
    render(<PlatformBadge platform="sms" />)
    expect(screen.getByText('SMS')).toBeInTheDocument()
  })
})
```

### Pattern 6: Component Interaction Tests with userEvent

**What:** Simulate real user interaction (clicks, typing) using @testing-library/user-event.
**When to use:** DeleteDialog confirm flow, EmptyState button click, SlugInput typing.

```typescript
// src/components/qr-management/delete-dialog.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteDialog } from './delete-dialog'

describe('DeleteDialog', () => {
  it('calls onDelete with id when user confirms', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn().mockResolvedValue({})

    render(<DeleteDialog id="abc-123" label="My QR" onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: /delete qr code/i }))
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(onDelete).toHaveBeenCalledWith('abc-123')
  })

  it('does NOT hard delete — calls soft-delete handler only', async () => {
    // Business rule DEL-02: soft delete only
    const user = userEvent.setup()
    const onDelete = vi.fn().mockResolvedValue({})
    render(<DeleteDialog id="abc-123" label="My QR" onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: /delete qr code/i }))
    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    // Assertion: handler called (not direct DB delete)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
```

### Pattern 7: Mocking Server Actions in Component Tests

**What:** Components like QrForm and GoogleSignInButton call Server Actions. Mock at module level.
**When to use:** Any component that imports from `@/app/*/actions`.

```typescript
// Mock Server Action at module level (hoisted before imports)
vi.mock('@/app/login/actions', () => ({
  signInWithGoogle: vi.fn(),
}))

vi.mock('@/app/dashboard/qr-actions', () => ({
  createQrCode: vi.fn(),
  updateQrCode: vi.fn(),
}))
```

### Anti-Patterns to Avoid

- **Testing shadcn primitives:** components/ui/ components are third-party — never write tests for them. Test the behavior of the custom component that wraps them.
- **Testing Server Components / route files:** async server components (page.tsx, layout.tsx) are not supported in Vitest unit tests per official Next.js docs. Skip entirely.
- **Using `@testing-library/react-hooks` (separate package):** This is the old React 17 package. Since React 18+, `renderHook` ships in `@testing-library/react` directly. Do not install the separate hooks package.
- **Using `globals: false` without imports:** With `globals: true` in vitest config, `describe/it/expect/vi` are auto-imported. Without it, every file needs explicit imports. The project MUST pick one strategy and stick to it. Recommended: `globals: true` in config + `"types": ["vitest/globals"]` in tsconfig.
- **Testing implementation details:** Don't assert on CSS class names unless testing business-rule-relevant styling (e.g., platform badge color). Prefer role/label/text queries.
- **Forgetting `await act()`:** State updates in hooks (especially async ones) must be wrapped in `act()`. Forgetting this causes "not wrapped in act" warnings and flaky tests.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| DOM assertion matchers | Custom `isVisible()` helpers | `@testing-library/jest-dom` | Ships `toBeInTheDocument`, `toHaveValue`, `toBeDisabled`, `toHaveClass` — 30+ matchers |
| Path alias resolution in tests | Manual `moduleNameMapper` | `vite-tsconfig-paths` | Reads tsconfig.json `paths` config automatically |
| User interaction simulation | Manual `dispatchEvent()` calls | `@testing-library/user-event` | Handles focus, keyboard events, pointer events as real browsers do |
| JSX transform in Vitest | Custom esbuild config | `@vitejs/plugin-react` | Official plugin handles React 19 JSX transform + Fast Refresh |
| Module mocking | Manual module substitution | `vi.mock()` | Vitest's built-in hoisting works correctly with ESM |

**Key insight:** The testing ecosystem for React/Vitest is mature. Every "I need to..." scenario has a library solution. The hand-rolled path causes false negatives (tests pass even when behavior is broken) and maintenance burden.

---

## Common Pitfalls

### Pitfall 1: Missing `vite-tsconfig-paths` → `@/` imports fail in tests

**What goes wrong:** Tests crash with `Cannot find module '@/components/...'` even though the app builds fine.
**Why it happens:** Vitest uses Vite's module resolver, not Next.js's. Without `vite-tsconfig-paths` plugin, the `@/*` path alias from tsconfig.json is ignored.
**How to avoid:** Add `tsconfigPaths()` as the FIRST plugin in `vitest.config.mts`. Order matters — paths must resolve before React plugin transforms.
**Warning signs:** `Error: Cannot find module '@/...'` in test output.

### Pitfall 2: `next/navigation` hooks throw in jsdom

**What goes wrong:** `SidebarLink`, `QrForm`, any component using `useRouter()`, `usePathname()`, `useSearchParams()` crash with `invariant expected app router to be mounted`.
**Why it happens:** These hooks require the Next.js router context, which doesn't exist in jsdom.
**How to avoid:** Mock `next/navigation` in `src/test/setup.ts` globally (see Pattern 2). This runs before every test file automatically.
**Warning signs:** `Error: invariant expected app router to be mounted` in component tests.

### Pitfall 3: `next/image` fails in jsdom

**What goes wrong:** Components importing `next/image` throw errors about the Image Optimization API.
**Why it happens:** `next/image` has complex server-side optimization logic that can't run in jsdom.
**How to avoid:** Mock `next/image` globally in setup.ts to return a plain `<img>` element (see Pattern 2).
**Warning signs:** `Error: Image Optimization using the default loader is not compatible...`

### Pitfall 4: `@testing-library/jest-dom` matchers not recognized

**What goes wrong:** TypeScript reports "Property 'toBeInTheDocument' does not exist on type 'Assertion'". Tests may still run but lose type safety.
**Why it happens:** The types for jest-dom matchers need explicit registration.
**How to avoid:** Use `import '@testing-library/jest-dom/vitest'` in setup.ts (not `'@testing-library/jest-dom'` — the `/vitest` subpath provides Vitest-compatible type augmentation). Also add `"@testing-library/jest-dom"` to tsconfig `types` array if needed.
**Warning signs:** TypeScript errors on `.toBeInTheDocument()`, `.toHaveValue()`, etc.

### Pitfall 5: `useActionState` components need careful action mocking

**What goes wrong:** Components using `useActionState(action, initialState)` (e.g., QrForm) need the action passed as a prop. In tests, pass `vi.fn()` that returns a `FormState` object — don't try to call the real Server Action.
**Why it happens:** Server Actions are async functions that run on the server. They throw when called client-side in jsdom.
**How to avoid:** Always pass a mocked action prop to form components. The component interface is props-driven — this is a feature.
**Warning signs:** `Server Actions are not available in jest/vitest` or fetch errors in tests.

### Pitfall 6: `vi.mock()` must be at module top-level (hoisting)

**What goes wrong:** `vi.mock()` inside `describe()` or `it()` blocks doesn't work reliably — the mock may not apply before the module is imported.
**Why it happens:** Vitest hoists `vi.mock()` calls to the top of the file at parse time. Calls inside functions aren't hoisted.
**How to avoid:** Always place `vi.mock('module-path', factory)` at the top level of the test file, outside any describe/it blocks.
**Warning signs:** Mock is not applied; real module runs instead of mock.

### Pitfall 7: `act()` warnings on async hook state updates

**What goes wrong:** `Warning: An update to X inside a test was not wrapped in act(...)` in async hook tests.
**Why it happens:** State updates triggered by async operations (fetch, setTimeout) happen outside React's render cycle unless wrapped.
**How to avoid:** Wrap async operations in `await act(async () => { ... })` when using `renderHook`. Use `waitFor()` from RTL for polling until state updates complete.
**Warning signs:** Console warnings about `act()` + flaky test results.

---

## Code Examples

### Package.json scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Testing formatScanCount business rule (ANLYT-02)

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatScanCount } from './utils'

describe('formatScanCount', () => {
  it('returns plain number string below 1000', () => {
    expect(formatScanCount(0)).toBe('0')
    expect(formatScanCount(999)).toBe('999')
  })

  it('formats 1000+ as compact notation with k suffix (ANLYT-02)', () => {
    expect(formatScanCount(1000)).toBe('1.0k')
    expect(formatScanCount(1200)).toBe('1.2k')
    expect(formatScanCount(10000)).toBe('10.0k')
  })
})
```

### Testing useSlugCheck with fetch mock

```typescript
// src/hooks/use-slug-check.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSlugCheck } from './use-slug-check'

describe('useSlugCheck', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns "idle" for empty slug', () => {
    const { result } = renderHook(() => useSlugCheck(''))
    expect(result.current).toBe('idle')
  })

  it('returns "invalid" for slug with uppercase or spaces (CREATE-02)', () => {
    const { result } = renderHook(() => useSlugCheck('My Slug'))
    expect(result.current).toBe('invalid')
  })

  it('returns "available" when slug matches currentSlug (edit mode)', () => {
    const { result } = renderHook(() => useSlugCheck('my-slug', 'my-slug'))
    expect(result.current).toBe('available')
  })

  it('returns "available" after API responds positively', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve({ available: true }),
    } as Response)

    const { result } = renderHook(() => useSlugCheck('new-slug'))
    await waitFor(() => expect(result.current).toBe('available'), { timeout: 1000 })
  })
})
```

### Testing PlatformSelector read-only in edit mode (EDIT-02)

```typescript
// src/components/qr-management/platform-selector.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlatformSelector } from './platform-selector'

describe('PlatformSelector', () => {
  it('shows tooltip text when disabled — platform is read-only after creation (EDIT-02)', async () => {
    render(<PlatformSelector disabled defaultValue="whatsapp" />)
    // Trigger tooltip
    const trigger = screen.getByText(/whatsapp/i)
    expect(trigger).toBeInTheDocument()
    // Combobox is disabled
    const select = screen.getByRole('combobox')
    expect(select).toBeDisabled()
  })
})
```

### Testing QrPulseWrapper animation trigger

```typescript
// src/components/shared/qr-pulse-wrapper.test.tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { QrPulseWrapper } from './qr-pulse-wrapper'

describe('QrPulseWrapper', () => {
  it('applies animate-qr-pulse class when trigger is true', () => {
    const { container } = render(
      <QrPulseWrapper trigger={true}><span>child</span></QrPulseWrapper>
    )
    expect(container.firstChild).toHaveClass('animate-qr-pulse')
  })

  it('does not apply animate-qr-pulse when trigger is false', () => {
    const { container } = render(
      <QrPulseWrapper trigger={false}><span>child</span></QrPulseWrapper>
    )
    expect(container.firstChild).not.toHaveClass('animate-qr-pulse')
  })
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@testing-library/react-hooks` (separate package) | `renderHook` from `@testing-library/react` | RTL v13 (React 18 release) | No extra package needed; single import |
| `jest` as test runner | `vitest` for Vite/Next.js projects | 2022–2023, mainstream 2024 | Faster startup, native ESM, no babel transform needed |
| `import '@testing-library/jest-dom'` in setup | `import '@testing-library/jest-dom/vitest'` | jest-dom v6+ | Vitest-compatible type augmentation via dedicated subpath |
| Coverage via `c8` standalone | `@vitest/coverage-v8` (bundled) | Vitest v1+ | Built into vitest; no separate tool |
| `vi.mock()` inside describe blocks | `vi.mock()` at module top level | Vitest design decision | Hoisting only works at top level |

**Deprecated/outdated:**
- `@testing-library/react-hooks`: Deprecated. Use `renderHook` from `@testing-library/react` directly.
- Plain Node.js `assert` tests (existing `src/lib/__tests__/redirect.test.ts`): Must be migrated to Vitest `expect()` syntax.
- `react-dom/test-utils.act`: Replaced by `act` from `@testing-library/react`.

---

## Open Questions

1. **useActionState mocking depth for QrForm**
   - What we know: QrForm receives `action` as a prop. In tests, pass `vi.fn()` returning `{ errors: {}, message: null }`.
   - What's unclear: Whether `useActionState` itself needs mocking in jsdom or if the React 19 implementation works as-is.
   - Recommendation: Try without mocking `useActionState` first — React 19's implementation should work in jsdom with a prop-injected mock action. If it throws, `vi.mock('react', ...)` to stub `useActionState`.

2. **Dialog/AlertDialog rendering in jsdom (base-ui)**
   - What we know: DeleteDialog uses `@base-ui/react` AlertDialog. base-ui uses portals to render to `document.body`.
   - What's unclear: Whether base-ui's portal-rendered content is accessible via `screen.getByRole()` in jsdom.
   - Recommendation: RTL's `screen` queries the full document including portals. Should work. If not, wrap render with `baseElement: document.body`.

3. **InputOTP (input-otp package) in jsdom**
   - What we know: OtpVerifyForm uses `input-otp` library. OTP input relies on keyboard events.
   - What's unclear: Whether the input-otp component needs special jsdom setup for keyboard event handling.
   - Recommendation: Use `@testing-library/user-event` for typing. If input-otp fails in jsdom, use a mock for the inner InputOTP component.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (to be installed — Wave 0) |
| Config file | `vitest.config.mts` (new — Wave 0) |
| Quick run command | `pnpm test:run --reporter=verbose` |
| Full suite command | `pnpm test:coverage` |

### Phase Requirements → Test Map

This phase adds test infrastructure and test files. The phase itself doesn't have enumerated requirement IDs from REQUIREMENTS.md — instead, tests validate existing v1 requirements:

| Req ID | Behavior Validated | Test Type | Automated Command |
|--------|-------------------|-----------|-------------------|
| CREATE-02 | Slug format validation (lowercase, hyphens only) | unit | `pnpm vitest run src/hooks/use-slug-check.test.ts` |
| CREATE-03 | Debounced slug availability check | unit | `pnpm vitest run src/hooks/use-slug-check.test.ts` |
| ANLYT-02 | Scan count 1000+ formatted as `1.2k` | unit | `pnpm vitest run src/lib/utils.test.ts` |
| SCAN-04 | Platform deep link URL construction | unit | `pnpm vitest run src/lib/redirect.test.ts` |
| DEL-02 | Soft delete only (onDelete handler, not direct DELETE) | unit | `pnpm vitest run src/components/qr-management/delete-dialog.test.tsx` |
| EDIT-02 | Platform read-only after creation | unit | `pnpm vitest run src/components/qr-management/platform-selector.test.tsx` |
| LIST-03 | Empty state renders with CTA | unit | `pnpm vitest run src/components/shared/empty-state.test.tsx` |

### Sampling Rate
- **Per task commit:** `pnpm vitest run` (all tests, no watch)
- **Per wave merge:** `pnpm test:coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps (must exist before implementation waves begin)

- [ ] `vitest.config.mts` — Vitest configuration at project root
- [ ] `src/test/setup.ts` — Global mocks (next/navigation, next/image, navigator.clipboard)
- [ ] `src/test/utils.tsx` — Custom render wrapper (if needed for providers)
- [ ] `package.json` — Add `"test"`, `"test:run"`, `"test:coverage"` scripts
- [ ] Install: `pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event vite-tsconfig-paths`

---

## Sources

### Primary (HIGH confidence)

- [Next.js official Vitest guide](https://nextjs.org/docs/app/guides/testing/vitest) — Version 16.1.6, last updated 2026-02-27. Configuration, installation commands, package list.
- [Vitest Coverage docs](https://vitest.dev/guide/coverage.html) — v8 vs istanbul, threshold config, include/exclude patterns.
- [Vitest Mocking guide](https://vitest.dev/guide/mocking) — vi.mock, vi.spyOn, vi.stubGlobal patterns.
- [React Testing Library API](https://testing-library.com/docs/react-testing-library/api/) — renderHook, render, screen, act, waitFor.

### Secondary (MEDIUM confidence)

- [@testing-library/jest-dom npm](https://www.npmjs.com/package/@testing-library/jest-dom) — `/vitest` subpath for Vitest-compatible type augmentation.
- [wisp.blog: Setting up Vitest for Next.js 15](https://www.wisp.blog/blog/setting-up-vitest-for-nextjs-15) — Verified against official Next.js docs. Global: true config, setupFiles pattern.
- [mayashavin.com: Test React hooks with Vitest](https://mayashavin.com/articles/test-react-hooks-with-vitest) — renderHook + waitFor patterns for async hooks.

### Tertiary (LOW confidence — verified via cross-reference)

- [GitHub: next/navigation mock discussion](https://github.com/vercel/next.js/discussions/48937) — Multiple verified approaches for mocking useRouter. vi.mock pattern confirmed across multiple sources.
- [dheerajmurali.com: Testing Clipboard API with Vitest](https://dheerajmurali.com/blog/clipboard-testing/) — Object.defineProperty pattern for navigator.clipboard in jsdom.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Official Next.js 16 docs (2026-02-27) specify exact packages
- Architecture: HIGH — Patterns directly from official docs + project code inspection
- Pitfalls: HIGH — Next.js navigation/image mocking issues are well-documented and cross-verified
- Coverage config: HIGH — Vitest official docs
- Hook testing: HIGH — renderHook is now in @testing-library/react core (React 18+)

**Research date:** 2026-03-12
**Valid until:** 2026-09-12 (stable libraries; Vitest releases frequently but API is stable)
