---
phase: 7
slug: a-complete-codereview-phase-to-ensure-nextjs-best-practices-2026-and-identify-codesmeslls-duplication
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (plain Node.js `assert` + `tsx` runner) |
| **Config file** | None — see `src/lib/__tests__/redirect.test.ts` for existing pattern |
| **Quick run command** | `pnpm lint && npx tsc --noEmit` |
| **Full suite command** | `pnpm lint && npx tsc --noEmit && npx tsx src/lib/__tests__/redirect.test.ts && pnpm build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm lint && npx tsc --noEmit`
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Check | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|-------|------|------|-------------|-----------|-------------------|--------|
| Lint clean | all | all | code quality | static | `pnpm lint` | ⬜ pending |
| TypeScript clean | all | all | type safety | static | `npx tsc --noEmit` | ⬜ pending |
| Redirect tests pass | all | all | core function | unit | `npx tsx src/lib/__tests__/redirect.test.ts` | ⬜ pending |
| Build succeeds | all | final | no regressions | build | `pnpm build` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed for a code review/refactor phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Scanner page under 10KB JS | CLAUDE.md rule | Requires bundle analyzer or build output inspection | Run `pnpm build`, check `.next/` output for scanner route chunk size |
| Accessibility improvements | a11y check | Visual/interactive verification needed | Check alt text, aria labels, keyboard nav on key pages |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
