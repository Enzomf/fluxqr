---
status: testing
phase: 07-a-complete-codereview-phase-to-ensure-nextjs-best-practices-2026-and-identify-codesmeslls-duplication
source: [07-01-SUMMARY.md, 07-02-SUMMARY.md, 07-03-SUMMARY.md]
started: 2026-03-12T21:35:00Z
updated: 2026-03-12T21:35:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: Slug Uniqueness Check (Bug Fix)
expected: |
  Go to dashboard → create new QR code. Enter a slug that belongs to an existing soft-deleted (is_active=false) QR code. The slug availability checker should report it as "taken" — not available. Previously it only checked active QRs, allowing duplicates that would violate the DB UNIQUE constraint.
awaiting: user response

## Tests

### 1. Slug Uniqueness Check (Bug Fix)
expected: Go to dashboard → create new QR code. Enter a slug that belongs to an existing soft-deleted QR code. The slug availability checker should report it as "taken". If you don't have a soft-deleted QR, just verify the slug checker works for existing active slugs.
result: [pending]

### 2. English Toast Messages
expected: Create or edit a QR code. The success toast should say "QR code created" or "QR code updated" in English (not Portuguese like "QR criado com sucesso" or "QR atualizado").
result: [pending]

### 3. Visual Consistency After Token Migration
expected: Browse dashboard, QR form, and public pages. All brand colors (indigo buttons/links), surface colors (dark backgrounds), and status colors (green success, red danger) should look correct and consistent. No broken colors, missing backgrounds, or unstyled elements.
result: [pending]

### 4. SEO: Page Title Template
expected: Navigate between pages (dashboard, admin, login). Browser tab should show titles like "Dashboard — FluxQR", "Admin — FluxQR". The home page should show "FluxQR — Dynamic QR Codes" or similar branded title.
result: [pending]

### 5. SEO: robots.txt
expected: Visit /robots.txt in the browser. It should show rules that disallow /dashboard/ and /admin/ from crawlers, while allowing the root path.
result: [pending]

### 6. SEO: sitemap.xml
expected: Visit /sitemap.xml in the browser. It should list public routes (at minimum / and /login) with the site's base URL.
result: [pending]

### 7. Error Boundary: Dashboard
expected: If a dashboard page throws an error, it should show a friendly error page with a "Try Again" button instead of crashing to a white screen. (To test: you can temporarily break something, or just verify the error.tsx file exists and the dashboard loads normally without errors.)
result: [pending]

### 8. Scanner Page Bundle Size
expected: Visit a QR scanner page (/q/[any-slug]). It should redirect quickly to the target platform. The page should feel instant — no heavy JS loading. (This verifies the scanner stays under the 10KB JS budget after removing next/image.)
result: [pending]

## Summary

total: 8
passed: 0
issues: 0
pending: 8
skipped: 0

## Gaps

[none yet]
