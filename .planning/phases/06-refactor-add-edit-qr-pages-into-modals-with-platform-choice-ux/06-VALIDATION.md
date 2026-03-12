---
phase: 6
slug: refactor-add-edit-qr-pages-into-modals-with-platform-choice-ux
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — TypeScript compiler + ESLint (no test runner) |
| **Config file** | tsconfig.json, eslint.config.mjs |
| **Quick run command** | `pnpm tsc --noEmit` |
| **Full suite command** | `pnpm tsc --noEmit && pnpm lint` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm tsc --noEmit`
- **After every plan wave:** Run `pnpm tsc --noEmit && pnpm lint`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | MODAL-05 | typecheck | `pnpm tsc --noEmit` | ✅ | ⬜ pending |
| 06-01-02 | 01 | 1 | MODAL-05 | typecheck | `pnpm tsc --noEmit` | ✅ | ⬜ pending |
| 06-02-01 | 02 | 1 | MODAL-01 | manual | — | N/A | ⬜ pending |
| 06-02-02 | 02 | 1 | MODAL-02,03 | manual | — | N/A | ⬜ pending |
| 06-02-03 | 02 | 1 | MODAL-04 | manual | — | N/A | ⬜ pending |
| 06-02-04 | 02 | 1 | MODAL-06,07 | manual | — | N/A | ⬜ pending |
| 06-03-01 | 03 | 2 | MODAL-08 | manual | — | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.
- Type-check (`pnpm tsc --noEmit`) validates Server Action signatures and component prop types.
- No new test framework or test files needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dialog opens on "New QR Code" click | MODAL-01 | UI interaction — no test runner | Click "New QR Code" button in dashboard; verify dialog opens |
| Step 1 grid renders two cards; selecting advances to Step 2 | MODAL-02 | UI interaction — no test runner | In create dialog, verify two cards shown; click one; verify form appears |
| Back arrow returns from Step 2 to Step 1 | MODAL-03 | UI interaction — no test runner | In Step 2, click back arrow; verify grid reappears |
| Edit opens on Step 2 pre-filled, skipping grid | MODAL-04 | UI interaction — no test runner | Click edit icon on existing QR row; verify dialog opens on form step with data pre-filled |
| After create: dialog closes, list reloads, toast fires | MODAL-06 | UI interaction — no test runner | Complete create flow; verify dialog closes, new QR appears in list, toast shown |
| After edit: dialog closes, row pulses, toast fires | MODAL-07 | UI interaction — no test runner | Complete edit flow; verify dialog closes, row pulses green, toast shown |
| Old routes 404 | MODAL-08 | URL navigation | Navigate to `/dashboard/new` and `/dashboard/[id]/edit`; verify 404 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
