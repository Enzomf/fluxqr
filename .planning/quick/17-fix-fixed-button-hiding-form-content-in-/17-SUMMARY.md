---
phase: quick-17
plan: 01
tags: [ui, css, dialog, flex-layout]

key-files:
  modified:
    - src/components/qr-management/qr-form-dialog.tsx

duration: 1min
completed: 2026-03-12
---

# Quick Task 17: Fix fixed button hiding form content in QR dialog

**Replaced sticky positioning with flex-shrink-0 on dialog header and footer to prevent overlap with scrollable form content.**

## What Changed

- `qr-form-dialog.tsx` header: `sticky top-0 z-10` → `flex-shrink-0`
- `qr-form-dialog.tsx` footer: `sticky bottom-0 z-10` → `flex-shrink-0`

## Root Cause

The dialog uses `flex flex-col max-h-[85vh]` with a scrollable middle section (`flex-1 overflow-y-auto`). The `sticky` positioning on header/footer doesn't work correctly inside a flex column — sticky elements need a scroll container as their parent, but the scroll happens in the middle child, not the flex parent. This caused the footer button to overlap the form fields.

## Fix

Using `flex-shrink-0` instead of `sticky` lets the flex layout handle positioning naturally: header and footer maintain their size, the middle section takes remaining space and scrolls independently. No z-index needed.

## Commit

- `fe2b41f`: fix(ui): replace sticky positioning with flex-shrink-0 in QR form dialog
