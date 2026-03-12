# Phase 7: Complete Code Review — Next.js Best Practices 2026 & Code Smells/Duplication - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Full codebase audit of all ~75 files in src/ — reviewing for Next.js 16 / React 19 best practices, code smells, duplication, dead code, and accessibility basics. All findings are fixed inline during the review (not just documented). Codebase maps (.planning/codebase/) are updated to reflect the current state. A brief summary report is produced at the end.

</domain>

<decisions>
## Implementation Decisions

### Review scope & depth
- Full codebase audit — every file in src/ including components/ui/ (shadcn) and types/supabase.ts (auto-generated)
- Find duplicated logic/patterns and refactor into shared utilities, hooks, or components
- Find and remove dead code — unused imports, exports, variables, and files
- Update codebase maps (.planning/codebase/) — CONCERNS.md, CONVENTIONS.md, ARCHITECTURE.md are outdated (written pre-implementation 2026-03-10)

### Fix approach
- Fix everything inline during the review — code smells, duplication, dead code, best practice violations
- Commits grouped by category (e.g., "fix: remove dead code", "refactor: extract shared utils", "fix: Next.js best practices") — clean git history
- Brief summary report produced after all fixes — categories, file counts, key improvements — lives in phase directory

### Next.js 2026 baseline
- **Server/Client boundaries:** Verify 'use client' only where needed, no Supabase calls in Client Components, proper data passing between server and client
- **Metadata & SEO:** Check generateMetadata usage, Open Graph tags, proper titles/descriptions on all routes, robots.txt
- **Caching & revalidation:** Review fetch caching, revalidatePath/revalidateTag usage, Server Action invalidation, static vs dynamic rendering
- **Security patterns:** Verify RLS enforcement, input validation (Zod), env var exposure, CSRF protection via Server Actions, middleware auth checks
- **Accessibility basics:** Check alt text on images, aria labels on interactive elements, keyboard navigation on dialogs/modals — fix issues found
- **Error boundaries & loading states:** Check all route segments for error.tsx, loading.tsx, not-found.tsx — add missing ones where appropriate
- **Scanner bundle budget:** Verify /q/[slug] stays under 10KB JS — if over, identify and fix the cause (CLAUDE.md hard rule)

### Claude's Discretion
- Order of review categories (which to tackle first)
- Whether to split large refactors into sub-tasks or handle inline
- How to structure the summary report
- Which error/loading states are worth adding vs unnecessary
- Exact accessibility improvements needed

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/utils.ts`: cn(), formatScanCount() — check for additional utility candidates during duplication analysis
- `src/lib/supabase/server.ts`, `client.ts`, `admin.ts`, `middleware.ts`: Supabase client variants — verify correct usage patterns
- `src/components/shared/`: app-button, platform-badge, empty-state, page-header, qr-pulse-wrapper, app-toast — check for consistency
- `src/hooks/`: use-slug-check, use-qr-image, use-copy-to-clipboard — check for duplication with inline logic elsewhere

### Established Patterns
- Server Components for data fetching, Client Components for interactivity
- Server Actions with 'use server' for mutations
- useActionState for form submission state management
- router.refresh() for server-side revalidation after mutations
- Tailwind v4 CSS-first config via globals.css @theme inline
- cn() for conditional class merging

### Integration Points
- `.planning/codebase/CONCERNS.md`: Pre-implementation concerns — needs full rewrite to reflect current state
- `.planning/codebase/CONVENTIONS.md`: May need updates based on patterns that evolved during 6 phases
- `.planning/codebase/ARCHITECTURE.md`: May need updates for admin, public, and modal flows added in later phases
- `eslint.config.mjs`: Existing lint config — verify it catches what the review finds

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for code review methodology.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-a-complete-codereview-phase-to-ensure-nextjs-best-practices-2026-and-identify-codesmeslls-duplication*
*Context gathered: 2026-03-12*
