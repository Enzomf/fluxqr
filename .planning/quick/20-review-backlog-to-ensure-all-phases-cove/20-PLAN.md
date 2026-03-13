---
phase: quick-20
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/ROADMAP.md
  - .planning/STATE.md
autonomous: true
requirements: []
must_haves:
  truths:
    - "ROADMAP progress table reflects actual completion status based on existing SUMMARYs"
    - "All plan checkboxes in Phase Details match actual execution state"
    - "Quick task 16 is accounted for in STATE.md (either listed or noted as abandoned)"
    - "Phase completion dates are filled in for all completed phases"
  artifacts:
    - path: ".planning/ROADMAP.md"
      provides: "Accurate roadmap with correct progress tracking"
    - path: ".planning/STATE.md"
      provides: "Accurate state with correct progress metrics"
  key_links: []
---

<objective>
Audit ROADMAP.md and STATE.md against actual execution artifacts (SUMMARY files) to fix stale progress tracking. Multiple phases show incorrect completion status.

Purpose: The roadmap progress table and plan checkboxes have drifted from reality. Phases 3.1, 5, and 6 all have full SUMMARYs but show incomplete. Quick task 16 exists as an empty directory but is not tracked.
Output: Updated ROADMAP.md and STATE.md with accurate completion status.
</objective>

<execution_context>
@/Users/enzo.figueiredo/.claude/get-shit-done/workflows/execute-plan.md
@/Users/enzo.figueiredo/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Audit phase completion and identify all discrepancies</name>
  <files>.planning/ROADMAP.md</files>
  <action>
Scan all phase directories for SUMMARY files to determine actual completion state. Compare against ROADMAP.md progress table and plan checkboxes.

Known discrepancies to verify and fix:

**Progress Table fixes:**
1. Phase 3.1 Preview and Share: Has 2/2 SUMMARYs (03.1-01, 03.1-02). Update from "1/2 In Progress" to "2/2 Complete" with completion date.
2. Phase 4 Production: Has 1/2 SUMMARYs (04-01 only, 04-02 deploy not executed). Keep as "1/2 In Progress" -- this is correct.
3. Phase 5 Public QR Gen: Has 5/5 SUMMARYs (05-01 through 05-05). Update from "3/5 In Progress" to "5/5 Complete" with completion date.
4. Phase 6 Modal QR CRUD: Has 2/2 SUMMARYs (06-01, 06-02). Update from "0/2 Not started" to "2/2 Complete" with completion date.
5. Phase 9 PWA: Has 0 SUMMARYs, only CONTEXT.md. Keep as "0/2 Not started" -- this is correct.

**Plan checkbox fixes in Phase Details sections:**
- Phase 1: Plans 01-02, 01-03, 01-04 show `[ ]` but have SUMMARYs -- change to `[x]`
- Phase 2: Both plans show `[ ]` but have SUMMARYs -- change to `[x]`
- Phase 3: All 4 plans show `[ ]` but have SUMMARYs -- change to `[x]`
- Phase 3.1: Both plans show `[ ]` but have SUMMARYs -- change to `[x]`
- Phase 4: Plan 04-01 should be `[x]` (has SUMMARY), 04-02 stays `[ ]`
- Phase 5: All 5 plans show `[ ]` but have SUMMARYs -- change to `[x]`
- Phase 6: Both plans show `[ ]` but have SUMMARYs -- change to `[x]`
- Phase 7: All 3 plans show `[ ]` but have SUMMARYs -- change to `[x]`
- Phase 8: All 5 plans show `[ ]` but have SUMMARYs -- change to `[x]`
- Phase 9: Both plans stay `[ ]` (no SUMMARYs)

**Phase header checkbox fixes:**
- Phase 3.1 header: Change `[ ]` to `[x]`
- Phase 5 header: Change `[ ]` to `[x]`
- Phase 6 header: Change `[ ]` to `[x]`

**Get completion dates** by checking git log for the last SUMMARY commit in each phase:
```bash
git log --oneline --format="%ai %s" -- ".planning/phases/03.1-*/*SUMMARY*" | tail -1
git log --oneline --format="%ai %s" -- ".planning/phases/05-*/*SUMMARY*" | tail -1
git log --oneline --format="%ai %s" -- ".planning/phases/06-*/*SUMMARY*" | tail -1
```

**Plans count in Phase 5 header:** Update "Plans: 3/5 plans executed" to "Plans: 5/5 plans complete"
**Plans count in Phase 6 header:** Update "Plans: 2 plans" to "Plans: 2/2 plans complete"

Write the corrected ROADMAP.md.
  </action>
  <verify>
    <automated>grep -c "\[x\]" .planning/ROADMAP.md</automated>
  </verify>
  <done>All plan checkboxes match SUMMARY file existence. Progress table counts and statuses are accurate. Completion dates filled in for all completed phases.</done>
</task>

<task type="auto">
  <name>Task 2: Update STATE.md progress metrics and quick task registry</name>
  <files>.planning/STATE.md</files>
  <action>
Update STATE.md to reflect actual project state:

1. **Progress metrics:** Update total_phases, completed_phases, total_plans, completed_plans, and percent based on actual SUMMARY count.
   - Completed phases: 1, 2, 3, 3.1, 5, 6, 7, 8 = 8 phases complete (this matches current count but verify)
   - Total phases: 10 (1, 2, 3, 3.1, 4, 5, 6, 7, 8, 9)
   - Completed plans: Count all SUMMARY files across all phases
   - Total plans: Sum all plan counts from ROADMAP
   - Percent: completed_plans / total_plans * 100

2. **Current Position:** Update to reflect that phases 1-8 are done (except 4 partial), phase 9 is next.
   - "Phase: 9 of 10 (PWA Support)" or similar
   - Status: "Context gathered, planning next"

3. **Quick task 16:** The directory `16-fix-qr-code-scanner-redirect-should-redi` exists but is empty (no plan, no summary). Add it to the quick tasks table as abandoned/skipped with a note, OR remove the empty directory. Since it has no artifacts, note it as "Skipped (empty)" in the table between entries 15 and 17.

4. **Session Continuity:** Keep the existing stopped_at and resume_file as-is since that reflects where Phase 9 actually is.

5. **Roadmap Evolution:** Already lists phases 3.1 through 9. No changes needed unless a quick task introduced a feature that should be a phase (review the 19 quick tasks -- they are all bug fixes, polish, and security patches, none warrant a new phase).
  </action>
  <verify>
    <automated>grep "percent:" .planning/STATE.md</automated>
  </verify>
  <done>STATE.md progress metrics match actual SUMMARY file counts. Quick task 16 is accounted for. Current position reflects reality.</done>
</task>

</tasks>

<verification>
- `grep -c "Complete" .planning/ROADMAP.md` shows correct count of completed phases
- Progress table in ROADMAP.md matches SUMMARY file reality
- STATE.md percent is mathematically correct (completed_plans / total_plans * 100)
- No phase marked complete that lacks full SUMMARYs
- No phase marked incomplete that has all SUMMARYs
</verification>

<success_criteria>
ROADMAP.md and STATE.md accurately reflect the project's actual execution state. Every plan checkbox matches whether a SUMMARY file exists. Progress percentages are mathematically correct. Quick task 16 is accounted for.
</success_criteria>

<output>
After completion, create `.planning/quick/20-review-backlog-to-ensure-all-phases-cove/20-SUMMARY.md`
</output>
