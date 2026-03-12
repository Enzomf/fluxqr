---
phase: quick
plan: 7
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/dashboard/sidebar.tsx
  - src/components/shared/qr-pulse-wrapper.tsx
  - src/hooks/use-slug-check.ts
  - src/app/dashboard/new/actions.ts
  - src/app/dashboard/[id]/edit/actions.ts
  - src/app/home-client.tsx
  - src/components/dashboard/qr-list-row.tsx
  - src/components/dashboard/qr-preview-dialog.tsx
  - src/components/public/public-qr-result-dialog.tsx
autonomous: true
requirements: []

must_haves:
  truths:
    - "`pnpm run lint` exits with code 0 (zero errors, zero warnings)"
    - "No behavioral regressions — sidebar still renders, pulse animation still works, slug checking still debounces"
  artifacts:
    - path: "src/components/dashboard/sidebar.tsx"
      provides: "SidebarNav extracted outside Sidebar render body"
    - path: "src/components/shared/qr-pulse-wrapper.tsx"
      provides: "Pulse effect without synchronous setState in useEffect"
    - path: "src/hooks/use-slug-check.ts"
      provides: "Slug checking without synchronous setState in useEffect"
  key_links:
    - from: "src/components/dashboard/sidebar.tsx"
      to: "SidebarNav component"
      via: "module-level function receiving props"
      pattern: "function SidebarNav"
---

<objective>
Fix all 10 lint issues (4 errors, 6 warnings) so `pnpm run lint` passes cleanly.

Purpose: Clean lint baseline prevents lint debt from accumulating and unblocks CI lint gates.
Output: All 9 source files modified, zero lint errors/warnings.
</objective>

<execution_context>
@/Users/enzo.figueiredo/.claude/get-shit-done/workflows/execute-plan.md
@/Users/enzo.figueiredo/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix 4 lint errors (static-components + set-state-in-effect)</name>
  <files>src/components/dashboard/sidebar.tsx, src/components/shared/qr-pulse-wrapper.tsx, src/hooks/use-slug-check.ts</files>
  <action>
**sidebar.tsx — react-hooks/static-components (2 errors, lines 83 and 95):**
The `SidebarNav` function component is defined INSIDE the `Sidebar` component body, causing React to recreate it every render and reset its state. Move `SidebarNav` OUTSIDE and ABOVE the `Sidebar` component at module scope. It currently closes over `navItems`, `avatarUrl`, `email`, `fullName`, `fallbackLetter`, and `signOut`. Refactor by passing these as props to the extracted component:

1. Create a `SidebarNavProps` interface:
   ```ts
   interface SidebarNavProps {
     navItems: { href: string; label: string }[]
     avatarUrl: string
     email: string
     fullName: string
     fallbackLetter: string
     onNavigate?: () => void
   }
   ```
2. Move `function SidebarNav(...)` ABOVE `export function Sidebar(...)` at module level, accepting `SidebarNavProps`.
3. Inside `SidebarNav`, use the props instead of closed-over variables. Keep the `signOut` import at module level (it's already a module import, not a local variable).
4. In `Sidebar`, render `<SidebarNav navItems={navItems} avatarUrl={avatarUrl} email={email} fullName={fullName} fallbackLetter={fallbackLetter} />` for desktop and add `onNavigate={() => setOpen(false)}` for mobile.

**qr-pulse-wrapper.tsx — react-hooks/set-state-in-effect (1 error, line 16):**
The `setIsPulsing(true)` call is synchronous inside useEffect. React 19's eslint plugin flags this. Refactor to use `flushSync` is NOT the right approach. Instead, replace the `isPulsing` state + useEffect pattern with a CSS-only approach:

Use a `key` prop trick: when `trigger` changes to true, re-mount the div to restart the CSS animation. Change the component to:
```tsx
export function QrPulseWrapper({ children, trigger }: QrPulseWrapperProps) {
  const [pulseKey, setPulseKey] = useState(0)

  useEffect(() => {
    if (trigger) {
      setPulseKey((k) => k + 1)
    }
  }, [trigger])
  // NOTE: The updater function form `(k) => k + 1` is NOT a synchronous setState —
  // it's a functional update that React batches. However, if lint still flags it,
  // use the alternative approach below instead.
```

Actually, the simplest fix: use `useRef` + `onAnimationEnd` to avoid setState in effect entirely:
```tsx
export function QrPulseWrapper({ children, trigger }: QrPulseWrapperProps) {
  const [isPulsing, setIsPulsing] = useState(false)
  const prevTrigger = useRef(trigger)

  if (trigger && !prevTrigger.current) {
    setIsPulsing(true)
  }
  prevTrigger.current = trigger

  return (
    <div
      className={cn(isPulsing && 'animate-qr-pulse rounded-md')}
      onAnimationEnd={() => setIsPulsing(false)}
    >
      {children}
    </div>
  )
}
```
This moves the state transition from useEffect into the render body (comparing with ref), which is the React-recommended pattern for "derived state from props". Remove the `useEffect` import if no longer needed.

**use-slug-check.ts — react-hooks/set-state-in-effect (1 error, line 21):**
Lines 21, 27, 32, 36 all call `setStatus(...)` synchronously in useEffect. The early returns (lines 21, 27, 32) set status and return. The fix: extract the synchronous status derivation out of the useEffect into the render body, and only keep the async fetch inside useEffect.

Refactor pattern:
```tsx
export function useSlugCheck(slug: string, currentSlug?: string): SlugStatus {
  const [asyncStatus, setAsyncStatus] = useState<'idle' | 'available' | 'taken'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Derive synchronous status outside useEffect
  const syncStatus: SlugStatus | null =
    !slug ? 'idle' :
    (currentSlug && slug === currentSlug) ? 'available' :
    !SLUG_REGEX.test(slug) ? 'invalid' :
    null  // null means "needs async check"

  useEffect(() => {
    // Only run async check when syncStatus is null (valid slug needing server check)
    if (syncStatus !== null) {
      setAsyncStatus('idle')
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setAsyncStatus('idle')  // Will show 'checking' via return below

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/slug-check?slug=${encodeURIComponent(slug)}`)
        const data = await res.json() as { available: boolean }
        setAsyncStatus(data.available ? 'available' : 'taken')
      } catch {
        setAsyncStatus('idle')
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [slug, currentSlug, syncStatus])

  // Return sync status if determined, otherwise derive from async
  if (syncStatus !== null) return syncStatus
  return asyncStatus === 'idle' ? 'checking' : asyncStatus
}
```

Wait — this still has `setAsyncStatus('idle')` in the effect. A cleaner approach: keep only the async fetch in useEffect, and handle ALL synchronous logic in the render. The `setAsyncStatus` calls inside the setTimeout callback are fine because they're in an async callback (not synchronous in the effect body).

Final approach for use-slug-check.ts:
1. Compute `syncStatus` outside useEffect (covers idle, available-unchanged, invalid cases).
2. In useEffect, only run when `syncStatus === null`. Inside the effect body, do NOT call setState synchronously — only start the debounce timer. In the timer callback, call setAsyncStatus (this is fine — it's in an async callback).
3. Return `syncStatus ?? (asyncStatus === 'idle' ? 'checking' : asyncStatus)`.
4. This eliminates all synchronous setState calls from the useEffect body.

After fixing, run `pnpm run lint 2>&1 | grep -E "error|warning"` to confirm errors are gone.
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && pnpm run lint 2>&1 | grep -c "error" | grep -q "0" && echo "PASS: no errors" || (pnpm run lint 2>&1 | grep "error"; echo "FAIL")</automated>
  </verify>
  <done>All 4 lint errors resolved: SidebarNav extracted to module scope, qr-pulse-wrapper uses ref-based trigger detection instead of setState-in-effect, use-slug-check derives synchronous status in render body</done>
</task>

<task type="auto">
  <name>Task 2: Fix 6 lint warnings (unused vars + img elements)</name>
  <files>src/app/dashboard/new/actions.ts, src/app/dashboard/[id]/edit/actions.ts, src/app/home-client.tsx, src/components/dashboard/qr-list-row.tsx, src/components/dashboard/qr-preview-dialog.tsx, src/components/public/public-qr-result-dialog.tsx</files>
  <action>
**new/actions.ts line 46 — unused `contact_target`:**
The destructuring `const { platform, contact_target, ...rest } = validated.data` extracts `contact_target` but it's never used (overridden by `finalContactTarget` from profile). Change to: `const { platform, contact_target: _contact_target, ...rest } = validated.data` — prefixing with underscore satisfies the no-unused-vars rule. Alternatively, simply omit it: `const { platform, contact_target: _, ...rest } = validated.data`. Use the underscore-only pattern (`_`) since the value is intentionally discarded.

**edit/actions.ts line 52 — unused `contact_target`:**
Same pattern: `const { label, slug, contact_target, default_message } = validated.data` — `contact_target` is unused because `finalContactTarget` from profile overrides it. Change to: `const { label, slug, contact_target: _, default_message } = validated.data`.

**home-client.tsx line 22 — unused `_usageCount`:**
The prop `usageCount` is received but never used in the component (it was for a future feature). Remove it from destructuring entirely. Also remove it from the `HomeClientProps` interface. Then check the parent Server Component that passes this prop — it's `src/app/page.tsx`. If removing the prop from the interface causes a type error in the parent, also remove the prop being passed in the parent. Read `src/app/page.tsx` to find where `usageCount` is passed and remove that prop.

**Three `@next/next/no-img-element` warnings:**
These `<img>` tags render base64 data URLs (`qr.dataUrl` / `qrData.dataUrl`). `next/image` does NOT support data URLs without a custom loader and adds no optimization value for inline base64 images. Add `{/* eslint-disable-next-line @next/next/no-img-element */}` comment directly above each `<img>` tag:

1. `src/components/dashboard/qr-list-row.tsx` line 38 — add comment above `<img`
2. `src/components/dashboard/qr-preview-dialog.tsx` line 106 — add comment above `<img`
3. `src/components/public/public-qr-result-dialog.tsx` line 85 — add comment above `<img`
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && pnpm run lint 2>&1 | tail -5</automated>
  </verify>
  <done>`pnpm run lint` exits with code 0 — zero errors, zero warnings across the entire codebase</done>
</task>

</tasks>

<verification>
Run `pnpm run lint` from project root. Expected output: no errors, no warnings, exit code 0.

Smoke check: `pnpm run build` should still succeed (no broken imports or missing props from refactoring).
</verification>

<success_criteria>
- `pnpm run lint` exits cleanly with 0 errors and 0 warnings
- `pnpm run build` still succeeds
- No behavioral changes to sidebar, pulse animation, or slug checking
</success_criteria>

<output>
After completion, create `.planning/quick/7-fix-all-lint-issues/7-SUMMARY.md`
</output>
