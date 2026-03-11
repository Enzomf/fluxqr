---
plan: 1
status: complete
date: 2026-03-11
---

## Summary

Fixed the phone verification card misalignment on the home page.

**Root cause:** The content area wrapper (`max-w-lg`) was wider than the `PhoneVerifyForm` card (`max-w-sm`). Without flex centering, the narrower card left-aligned within the wider block container.

**Fix:** Added `flex flex-col items-center` to the content wrapper div in `src/app/home-client.tsx:49`. This centers all step components (phone, OTP, grid, form, result, gated) within the container.

### Key files

- `src/app/home-client.tsx` — added flex centering to content wrapper
