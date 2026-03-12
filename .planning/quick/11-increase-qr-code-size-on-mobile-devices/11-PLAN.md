---
phase: quick-11
plan: 11
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/dashboard/qr-list-row.tsx
autonomous: true
requirements: [QUICK-11]
must_haves:
  truths:
    - "QR code thumbnail is visibly larger on mobile screens (>= 80px)"
    - "QR code thumbnail remains compact (40px) on desktop (md+)"
    - "QR preview dialog still opens correctly when tapping the thumbnail"
  artifacts:
    - path: "src/components/dashboard/qr-list-row.tsx"
      provides: "Responsive QR thumbnail sizing"
      contains: "size-20 md:size-10"
  key_links:
    - from: "src/components/dashboard/qr-list-row.tsx"
      to: "qr-preview-dialog.tsx"
      via: "handleThumbnailClick reads thumbnailRef bounding rect"
      pattern: "thumbnailRef\\.current\\.getBoundingClientRect"
---

<objective>
Increase QR code thumbnail size on mobile devices in the dashboard QR list.

Purpose: The 40x40px QR thumbnail is too small on mobile screens to be recognizable. On mobile, the row layout already stacks vertically (flex-col), so there is room for a larger QR image. On desktop (md+), the compact 40px size should be preserved.
Output: Updated qr-list-row.tsx with responsive thumbnail sizing.
</objective>

<execution_context>
@/Users/enzo.figueiredo/.claude/get-shit-done/workflows/execute-plan.md
@/Users/enzo.figueiredo/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/dashboard/qr-list-row.tsx
@src/components/dashboard/qr-list.tsx

<interfaces>
From src/components/dashboard/qr-list-row.tsx:
```typescript
export type QrCodeWithImage = QrCode & { dataUrl: string }

interface QrListRowProps {
  qr: QrCodeWithImage
  onDelete: (id: string) => Promise<{ error?: string }>
  pulseId?: string | null
}
```

Current layout: The row uses `flex flex-col md:flex-row md:items-center` — on mobile it stacks vertically, on desktop it is a horizontal row. The QR `<img>` is fixed at `width={40} height={40}` with `self-center md:self-auto`.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Make QR thumbnail responsive — larger on mobile, compact on desktop</name>
  <files>src/components/dashboard/qr-list-row.tsx</files>
  <action>
In src/components/dashboard/qr-list-row.tsx, update the QR thumbnail `<img>` element (lines 39-55):

1. Remove the fixed `width={40} height={40}` HTML attributes from the img tag — sizing will be controlled entirely by Tailwind classes.

2. Replace the current className with responsive sizing classes:
   - Mobile (default): `size-20` (80px) — large enough to be clearly visible and recognizable as a QR code.
   - Desktop (md+): `md:size-10` (40px) — preserves the current compact inline thumbnail.
   - Keep existing classes: `rounded`, `shrink-0`, `cursor-pointer`, `hover:opacity-80`, `transition-opacity`, `self-center`, `md:self-auto`.

The full className should be:
```
"size-20 md:size-10 rounded shrink-0 cursor-pointer hover:opacity-80 transition-opacity self-center md:self-auto"
```

Do NOT change:
- The `ref={thumbnailRef}` — needed for QrPreviewDialog bounding rect calculation.
- The onClick/onKeyDown handlers — they open the preview dialog.
- The `role="button"` and `tabIndex={0}` accessibility attributes.
- Any other part of the component (info section, actions, etc.).
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>QR thumbnail renders at 80px on mobile (default) and 40px on md+ breakpoint. No TypeScript errors. Preview dialog still functions (thumbnailRef intact).</done>
</task>

</tasks>

<verification>
- TypeScript compiles without errors: `npx tsc --noEmit`
- Visual check: On mobile viewport (< 768px), QR thumbnails in dashboard list should be 80x80px
- Visual check: On desktop viewport (>= 768px), QR thumbnails should remain 40x40px
- QR preview dialog still opens when clicking the thumbnail
</verification>

<success_criteria>
- QR code thumbnails are 80px on mobile, 40px on desktop
- No TypeScript or lint errors
- No regressions to QR preview dialog or row layout
</success_criteria>

<output>
After completion, create `.planning/quick/11-increase-qr-code-size-on-mobile-devices/11-SUMMARY.md`
</output>
