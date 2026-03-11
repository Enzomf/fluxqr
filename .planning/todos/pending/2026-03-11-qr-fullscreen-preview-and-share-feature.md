---
created: 2026-03-11T14:21:12.367Z
title: QR fullscreen preview and share feature
area: ui
files:
  - src/components/dashboard/qr-list-row.tsx
  - src/components/qr-generation/qr-image.tsx
---

## Problem

After phase 03 (QR Management), clicking a QR code in the dashboard list has no detail/preview view. Users need to:

1. **Fullscreen QR preview** — clicking a QR item in the list should open a fullscreen overlay displaying the QR code at large size, making it easy to scan directly from screen.
2. **Share QR code** — from the preview (or list row), users should be able to share the QR code via native share sheet (Web Share API) or copy the QR link/image.

These features should be added as a new phase **before the production/deploy phase** (currently phase 4).

## Solution

- Create a fullscreen modal/overlay component that renders the QR code at large size with the label and slug info
- Use the Web Share API (`navigator.share`) for native sharing on supported devices, with clipboard fallback
- Share options: share QR image (PNG blob), share link (`/q/{slug}`), copy link to clipboard
- Insert as phase 3.5 or renumber phases to fit before deploy
- Reuse existing `qr-generator.ts` and `useQrImage` hook from phase 03-01
- No Framer Motion (project rule) — use Tailwind keyframes for modal transitions
