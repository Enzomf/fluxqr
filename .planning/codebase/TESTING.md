# Testing Patterns

**Analysis Date:** 2026-03-10

## Test Framework

**Runner:**
- Not configured — no `jest.config.*`, `vitest.config.*`, or test runner in `package.json` devDependencies
- No test files exist in the repository at this time (project is at initial bootstrap stage)

**Assertion Library:**
- Not configured

**Run Commands:**
```bash
# No test script defined yet in package.json
# Recommended setup when adding tests:
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event
```

## Recommended Test Setup (Not Yet Implemented)

Given the stack (Next.js 15, React 19, TypeScript strict, Supabase), the recommended test setup is:

**Unit/Component Tests:** Vitest + React Testing Library
- Vitest integrates well with Vite-adjacent tooling and supports TypeScript natively
- Config file: `vitest.config.ts` at project root

**E2E Tests:** Playwright (optional for MVP)
- Install: `pnpm add -D @playwright/test`
- Config file: `playwright.config.ts`

## Test File Organization

**Recommended Location:**
- Co-located with source files: `src/lib/utils.test.ts` next to `src/lib/utils.ts`
- Or dedicated `__tests__/` directories per feature folder

**Naming:**
- Unit/integration test files: `[filename].test.ts` or `[filename].test.tsx`
- E2E test files: `[feature].spec.ts`

**Recommended Structure:**
```
src/
├── lib/
│   ├── utils.ts
│   ├── utils.test.ts          # unit tests for cn(), formatScanCount()
│   ├── redirect.ts
│   ├── redirect.test.ts       # unit tests for buildPlatformUrl()
│   └── qr-generator.ts
├── components/
│   └── shared/
│       └── platform-badge.test.tsx  # component rendering tests
└── app/
    └── api/
        └── slug-check/
            └── route.test.ts  # API route handler tests
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect } from "vitest";
import { cn, formatScanCount } from "@/lib/utils";

describe("cn()", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });
});
```

**Patterns:**
- Use `describe` blocks to group related tests by function or component
- Use `it` (not `test`) for individual test cases — reads as a sentence
- Setup: `beforeEach` for shared state, `afterEach` for cleanup
- Async: `async/await` pattern throughout

## Mocking

**Framework:** Vitest built-in mocking (`vi.mock`, `vi.fn`, `vi.spyOn`)

**Patterns:**
```typescript
import { vi } from "vitest";

// Mock Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: [], error: null }),
  })),
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));
```

**What to Mock:**
- Supabase client (`@/lib/supabase/server` and `@/lib/supabase/client`) in all unit tests
- Next.js `redirect()`, `notFound()`, `cookies()`, `headers()` in Server Action tests
- External canvas/DOM APIs when testing `qr-generator.ts`

**What NOT to Mock:**
- Pure utility functions (`cn()`, `formatScanCount()`, `buildPlatformUrl()`) — test them directly
- Tailwind class logic — test by asserting rendered class strings

## Fixtures and Factories

**Test Data (Recommended Pattern):**
```typescript
// src/__tests__/fixtures/qr-codes.ts
import type { QrCode } from "@/types";

export function makeQrCode(overrides: Partial<QrCode> = {}): QrCode {
  return {
    id: "test-id-123",
    user_id: "user-id-456",
    slug: "test-slug",
    label: "Test QR",
    platform: "whatsapp",
    contact_target: "+1234567890",
    default_message: "Hello",
    is_active: true,
    scan_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}
```

**Location:**
- Fixtures/factories: `src/__tests__/fixtures/` or co-located `__fixtures__/` directories

## Coverage

**Requirements:** No coverage threshold enforced (project at bootstrap stage)

**Recommended targets when tests are added:**
- Utility functions (`lib/utils.ts`, `lib/redirect.ts`): 100% — pure functions, easy to cover
- Server Actions: 80% — test happy path + auth failure + validation errors
- Components: snapshot tests for shared components, interaction tests for forms

**View Coverage (when configured):**
```bash
pnpm vitest run --coverage
```

## Test Types

**Unit Tests:**
- Scope: Pure functions in `src/lib/` (e.g., `buildPlatformUrl()`, `cn()`, `formatScanCount()`, `generateQrDataUrl()`)
- Approach: Input/output assertions, no network or DB calls

**Integration Tests:**
- Scope: Server Actions with mocked Supabase client, API route handlers
- Approach: Mock Supabase layer, assert returned data shapes and redirect behavior
- Key files to test: `src/app/dashboard/new/actions.ts`, `src/app/dashboard/[id]/edit/actions.ts`, `src/app/api/slug-check/route.ts`

**E2E Tests:**
- Framework: Not configured (Playwright recommended for MVP launch)
- Critical flows to cover: login via Google OAuth redirect, QR create flow, scanner redirect (`/q/[slug]`)

## Common Patterns

**Async Testing:**
```typescript
it("increments scan count on redirect", async () => {
  const mockRpc = vi.fn().mockResolvedValue({ error: null });
  // ... setup mock
  await expect(handleScanRedirect("my-slug")).resolves.not.toThrow();
  expect(mockRpc).toHaveBeenCalledWith("increment_scan_count", { qr_slug: "my-slug" });
});
```

**Error Testing:**
```typescript
it("returns error when user is not authenticated", async () => {
  vi.mocked(createClient).mockReturnValueOnce({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
  } as any);

  const result = await createQrCode(formData);
  expect(result).toEqual({ error: "Unauthorized" });
});
```

**Component Rendering:**
```typescript
import { render, screen } from "@testing-library/react";
import { PlatformBadge } from "@/components/shared/platform-badge";

it("renders whatsapp badge", () => {
  render(<PlatformBadge platform="whatsapp" />);
  expect(screen.getByText(/whatsapp/i)).toBeInTheDocument();
});
```

## Priority Test Targets

When adding tests, prioritize in this order:

1. `src/lib/redirect.ts` — `buildPlatformUrl()` is critical to the core redirect flow; pure function, easy to test
2. `src/lib/utils.ts` — `cn()` and `formatScanCount()` utility coverage
3. `src/app/api/slug-check/route.ts` — slug availability API, needs happy path + conflict case
4. `src/app/dashboard/new/actions.ts` — QR creation Server Action; test auth guard + Zod validation
5. `src/app/q/[slug]/page.tsx` — scanner proxy; test not-found and redirect behavior

---

*Testing analysis: 2026-03-10*
