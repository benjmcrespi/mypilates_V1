---
target: the instructor dashboard
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-31T02-56-30Z
slug: src-app-dashboard-page-js
---
# Design Critique — Instructor Dashboard (Re-run)

**Method: dual-agent (A: `adff412d7781452bd` · B: `a6a5763ed64fd330c`)**

This is a re-critique after the harden/colorize/polish passes. Both agents ran fully independently, with no access to the prior report, exactly like the first run, so this is a genuine fresh read, not a self-grading exercise.

## Verification: did the fixes actually land?

Assessment B re-verified all 3 targeted fixes from scratch against the current code, independent of any claim made when they shipped:

| Prior finding | Status |
|---|---|
| `alert()`/`window.confirm()` in page.js / AddStudioModal.js | **Fixed** — zero live calls in either file, only explanatory comments remain |
| Hardcoded hex success banner (`#EAF5ED`/`#1D5E34`/`#BCE1C7`) | **Fixed** — zero hex matches anywhere in `src`; now `bg-sage-light text-bark border-sage/30` |
| `yellow` classes on editing border / DraftRow Edit button | **Fixed** — zero `yellow` matches anywhere in `src`; now `border-clay`/`clay-light`/`clay-dark` |

Deliberately out of scope and confirmed still open, not regressions: label/input `htmlFor` association (unresolved), modal `role="dialog"`/`aria-modal` semantics (unresolved), the waitlist toggle's keyboard/screen-reader accessibility (unresolved, still a bare div). These were never part of this round's chosen work.

## Design Health Score

**22/40 → 26/40 (Acceptable, 65%)**

| # | Heuristic | Prior | Now | Key Issue |
|---|-----------|-------|-----|-----------|
| 1 | Visibility of System Status | 2/4 | 3/4 | Granular per-action loading states throughout; initial load still renders a blank bg-linen screen with no spinner |
| 2 | Match Between System and Real World | 3/4 | 3/4 | Canonical terminology followed precisely; one leak: calendar_url is "calendar link" in one place, "Studio iCal Link" in another |
| 3 | User Control and Freedom | 2/4 | 2/4 | Every modal has Cancel, but none close on Escape or backdrop click; no undo after any confirm |
| 4 | Consistency and Standards | 1/4 | 2/4 | Alert/confirm and yellow inconsistencies fixed; newly surfaced: Edit/Delete render in two different visual systems (rounded-lg vs rounded-md) depending on which list |
| 5 | Error Prevention | 3/4 | 3/4 | Strong guardrails throughout; single-class delete uses one generic message regardless of published status |
| 6 | Recognition Rather Than Recall | 3/4 | 3/4 | Still mostly visible, not hidden; label association still not programmatic |
| 7 | Flexibility and Efficiency | 2/4 | 2/4 | Real batch/default efficiency exists; still zero keyboard shortcuts, no select-all for drafts |
| 8 | Aesthetic and Minimalist Design | 2/4 | 3/4 | Strong progressive disclosure; Sync Classes card can show up to 6 simultaneous actions |
| 9 | Error Recovery | 1/4 | 3/4 | Alert-based errors replaced with plain-language banners matching DESIGN.md's documented pattern; one gap: a failed studio mid-sync silently aborts the rest with no indication which studio failed |
| 10 | Help and Documentation | 3/4 | 2/4 | Independent reviewer scored this heuristic more strictly this round (tour/onboarding exist but aren't contextual at the point of confusion); read as rater variance on a subjective heuristic, not a regression, nothing here changed between rounds |
| **Total** | | **22/40** | **26/40** | **Acceptable** |

## Design Specificity Verdict

**Could a generic scheduler ship this unchanged? No**, confirmed independently again this round. The canonical terminology table is followed completely, the "studio owns the facts, instructor owns the booking details" rule has real nuance (ICS-locked fields grey out with explanatory copy while Booking Link/Note/Category stay live on the same record), and the series-edit published-impact warning quantifies real student-facing stakes rather than an abstract record count. Palette discipline holds throughout: clay is the dashboard's only actionable color, sage only appears for success states, no stray SaaS-blue or gray chrome anywhere.

Deterministic scan: `detect.mjs` returned clean again (exit 0, `[]`) — same as round 1, it doesn't check the things that actually matter here (consistency, accessibility semantics), so a clean automated scan continues to say little on its own. The real signal is Assessment B's manual re-verification above.

Visual overlays: no user-visible overlay of the authenticated dashboard exists this run either, same constraint as round 1 (no login against a possibly-production backend).

## Overall Impression

The three targeted fixes genuinely landed and are independently confirmed, that's the headline. The score moved 22 → 26, and the specific defect class targeted (native browser dialogs, off-token colors) is fully gone. What surfaced this round is a different kind of problem: with the loudest inconsistency cleared, a subtler and arguably more consequential one is now visible, the *new* confirm-modal system was applied unevenly. The two most-used publish buttons (This Week's/Next Week's Schedule) still fire with zero confirmation while the two less-used ones (Publish All/Selected) now confirm, an asymmetry that didn't stand out as clearly when everything used inconsistent alert()s. Deferred accessibility work (labels, dialog semantics, keyboard toggle) remains exactly where it was, as expected.

## What's Working

1. **Publish-language differentiated by state**: "Success! Class published to live schedule" only fires on a genuine first publish; a later edit to the same class correctly says "Changes saved." instead, deliberate state-aware copy, not framework default.
2. **The series-edit published-impact warning**: "M are live on your page and will change immediately for students" quantifies real consequence in plain, student-facing language, the single best piece of UX writing in the file, confirmed again this round.
3. **Two-level progressive disclosure on studio cards**: studios collapse to one row by default, and the recurring-schedule summary is independently expandable from the field panel, genuine cognitive-load engineering matching DESIGN.md's documented signature component precisely.

## Priority Issues

**[P0] No confirmation on the primary "Publish This Week's/Next Week's Schedule" buttons, while the less-used secondary publish paths now require one**
- **Why it matters:** This is the styled clay primary CTA an instructor presses weekly to go live, and publishing with followers fires an irreversible, real notification email. The path most likely to be pressed before finishing draft review has *less* protection than the paths used less often, risk is inverted relative to usage. This asymmetry exists precisely because the harden pass fixed `handlePublishAll`/`handlePublishSelected` but the weekly-publish handlers were never in the original alert/confirm inventory (they had no confirmation at all before either).
- **Fix:** Wrap `handlePublishThisWeek` and `handlePublishNextWeek` in the same `askConfirm` pattern already used two functions above them, naming the count and noting followers will be notified.
- **Suggested command:** `/impeccable harden`

**[P1] Single-class delete confirmation doesn't distinguish a live/published class from an untouched draft**
- **Why it matters:** The series-delete flow explicitly warns when published classes are affected; the single-class flow uses one generic "cannot be undone" regardless of status, so deleting a class students may have booked gets the same low-stakes wording as deleting a never-published draft.
- **Fix:** Branch the confirm copy on the class's published status, reusing the "live on your page" language already written for the series flow.
- **Suggested command:** `/impeccable harden`

**[P1] Edit/Delete buttons render in two different visual systems depending on which list they're in, one of which violates DESIGN.md's own Binary Radius Rule**
- **Why it matters:** Published Classes row buttons use bordered `rounded-lg` (8px); DraftRow's buttons use filled pills at `rounded-md` (6px), a radius value DESIGN.md explicitly says shouldn't exist in the system. Identical actions on the same object type look different purely based on which tab you're in.
- **Fix:** Standardize on the bordered `rounded-lg` treatment across both list types.
- **Suggested command:** `/impeccable polish`

**[P2] No Escape/backdrop dismissal on any modal; focus indicator is a border-color shift only**
- **Why it matters:** Keyboard-only and screen-reader users have no standard modal-dismiss path, and every input dashboard-wide replaces the native focus ring with only a subtle border-color change. This is the same accessibility-semantics gap flagged and deliberately deferred in round 1, still unresolved, not a new regression.
- **Fix:** Add a shared Escape handler across modal state; add a visible focus ring app-wide (already precedented on the auth pages).
- **Suggested command:** `/impeccable harden`

**[P2] The Sync Classes card surfaces up to 6 simultaneous competing actions**
- **Why it matters:** This is the tab instructors visit weekly for the product's core "under 60 seconds" job; six competing CTAs works against that stated principle.
- **Fix:** Fold "Publish Selected" and "Publish all N drafts" behind a single small disclosure so the default state shows only Pull + the two week-based buttons.
- **Suggested command:** `/impeccable distill`

## Persona Red Flags

**Alex (Power User):** Zero keyboard shortcuts anywhere; no modal closes on Escape. No "select all" checkbox for the drafts multi-select despite the batch-publish data already existing, many pending drafts means clicking each one before "Publish Selected" is usable. Four overlapping publish paths in one card force Alex to parse which is "the" button before trusting it.

**Sam (Accessibility):** The waitlist toggle is still a click-only div with no role/aria-checked/keyboard handling, confirmed unchanged by static re-check. The "Copied!" link confirmation is a purely visual tooltip with no aria-live region, a screen-reader user gets zero confirmation the copy succeeded. Focus indicators dashboard-wide are border-color-only, no ring, on every input and button.

**Casey (Distracted Mobile User):** Initial dashboard load is a blank screen with no spinner on a slow connection. Success/error banners render only at the very top of the page, easy to miss if a background auto-save fails while scrolled deep into Settings or the drafts list.

## Minor Observations

- The em dash in `AddStudioModal.js`'s "Classes found" checklist (` — {c.dayLabel}s, {c.timeLabel}`) is still present, found independently again this round, violating the binding no-em-dash rule. Never in scope for the three fixed issues.
- Terminology split: "Studio iCal Link" (Settings) vs. "calendar link" (AddStudioModal and the sync error message) for the same underlying field.
- `handleSync`'s per-studio loop has no per-iteration try/catch, one dead calendar link silently aborts the whole sync with no indication which studio failed.
- CLAUDE.md's clay hex is still stale relative to DESIGN.md/the shipped app, noted again, still not fixed (never requested).

## Questions to Consider

1. The two most-used publish buttons now have *less* protection than the two least-used ones, purely as a side effect of which functions happened to already call window.confirm() before the harden pass. Now that the pattern exists everywhere else, is there a reason the weekly-publish path should stay unconfirmed, or was this just never on anyone's list until this exact review?
2. The series flow tells you exactly how many published classes are about to disappear from students' view. The single-class flow doesn't say that at all, even for a live class. What made the multi-class case feel dangerous enough to write that language, and why didn't the same reasoning reach the single-class path sitting right next to it?
3. DraftRow and the Published Classes row show the identical two actions, Edit and Delete, in two different visual languages, one of which breaks a documented rule. If nobody's flagged it, is that because it's genuinely invisible, or because nobody's looked at both lists back to back?
