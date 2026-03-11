---
id: 1
description: Fix phone verification card center alignment on home page
date: 2026-03-11
---

## Task

The PhoneVerifyForm card (`max-w-sm`) is narrower than its parent content wrapper (`max-w-lg`), causing it to left-align within the container instead of centering.

### Fix

Add `flex flex-col items-center` to the content area wrapper in `home-client.tsx` so all step components center within the max-w-lg container.

**File:** `src/app/home-client.tsx` line 49
