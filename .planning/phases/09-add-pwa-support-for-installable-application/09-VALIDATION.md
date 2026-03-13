---
phase: 9
slug: add-pwa-support-for-installable-application
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test:run` |
| **Full suite command** | `pnpm test:coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test:run`
- **After every plan wave:** Run `pnpm test:run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | manifest shape | unit | `pnpm test:run src/app/manifest.test.ts` | ❌ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | offline page render | unit (RTL) | `pnpm test:run src/app/~offline/page.test.tsx` | ❌ W0 | ⬜ pending |
| 09-01-03 | 01 | 1 | icon files exist | manual | `ls public/icon-*.png` | N/A | ⬜ pending |
| 09-01-04 | 01 | 1 | SW installability | manual | DevTools > Application > Manifest | N/A | ⬜ pending |
| 09-01-05 | 01 | 1 | offline fallback | manual | Chrome DevTools > Network > Offline | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/app/manifest.test.ts` — unit test for manifest() return value shape (name, icons, colors, display)
- [ ] `src/app/~offline/page.test.tsx` — renders offline page, checks for logo + heading + "Try again" link

*Existing test infrastructure covers all phase requirements — no framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PWA installability | Install experience | Browser-specific, requires DevTools | Open Chrome DevTools > Application > Manifest > check "Installable" |
| Offline fallback page | Offline behavior | Requires network toggle in DevTools | Chrome DevTools > Network > toggle Offline > navigate to new route > verify branded page |
| Icon rendering on home screen | App icons & branding | Device-specific rendering | Install PWA on Android/iOS > verify icon not clipped, correct colors |
| Splash screen colors | Background color | Device-specific rendering | Launch installed PWA > verify dark background (#0F172A), no white flash |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
