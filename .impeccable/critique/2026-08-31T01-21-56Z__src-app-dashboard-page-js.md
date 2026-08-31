---
target: the instructor dashboard
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 4
timestamp: 2026-08-31T01-21-56Z
slug: src-app-dashboard-page-js
---
# Design Critique — Instructor Dashboard

**Method: dual-agent (A: `aafd7ffdb6d5f578e` · B: `a3f909e7387f104d3`)**

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2/4 | Initial load renders a blank `bg-linen` shell with no spinner and no `aria-busy`/`role="status"` while 6 Supabase queries resolve; optimistic waitlist toggle shows a change even if the write silently fails |
| 2 | Match Between System and Real World | 3/4 | Canonical terminology and This Week/Next Week/Later grouping match instructor mental models well; docked for raw Postgres/Supabase error strings surfacing verbatim in alerts |
| 3 | User Control and Freedom | 2/4 | Cancel exists everywhere, but none of the 4 modal types carry role="dialog"/aria-modal, an Escape handler, or a focus trap; deletes are immediate, no undo |
| 4 | Consistency and Standards | 1/4 | Same action class (delete) uses two different systems depending on which button was clicked; off-palette yellow marks the editing state despite the Rare Accent Rule; icon vocabulary mixes unicode, SVG, and an emoji |
| 5 | Error Prevention | 3/4 | Every destructive action is confirmation-gated; the series-edit flow explicitly blocks unsafe date recalculation before saving |
| 6 | Recognition Rather Than Recall | 3/4 | Categories/studios are dropdown-selected, studio defaults auto-fill; docked because 19 of 20 label elements in the file (8 of 9 in AddStudioModal) have no htmlFor pairing |
| 7 | Flexibility and Efficiency | 2/4 | Real accommodations exist (tertiary "Publish all" link, multi-select-to-publish, studio defaults) but zero keyboard shortcuts, no modal Escape-dismiss, bulk actions stop at publish |
| 8 | Aesthetic and Minimalist Design | 2/4 | Mostly disciplined single-accent system, but the My Classes/Sync panel surfaces ~9 simultaneous interactive affordances in one stack |
| 9 | Error Recovery | 1/4 | The large majority of error paths are raw alert("Error saving: " + error.message) (9+ sites); one well-written exception proves the team can do better |
| 10 | Help and Documentation | 3/4 | Re-triggerable 7-step product tour with strong inline micro-copy; docked because the tour's live step order/copy has drifted from CLAUDE.md's original spec |
| **Total** | | **22/40** | **Acceptable (55%)** |

## Design Specificity Verdict

Mixed, authored for Instruktor at the structural/copy level, generic at the interaction level. The IA and copy are specific (canonical terminology honored, DESIGN.md's drafts grid implemented exactly, bespoke series-edit safeguards), but the interaction layer leans on native alert()/confirm() for most errors and deletes, and the most-repeated UI element (the success banner, 12+ sites) uses hardcoded hex instead of the sage tokens named for it, despite those tokens being used correctly elsewhere in the same file.

Deterministic scan: detect.mjs CLI returned clean (exit 0, []), it doesn't check accessibility semantics or token conformance, which is where the real findings are. Manual static audit found: 19/20 labels in page.js lack htmlFor, AddStudioModal.js has zero aria/role/alt/htmlFor/tabIndex attributes anywhere, all 4 modals lack dialog semantics, and one icon-only close button has no accessible name while a comparable button elsewhere does.

Visual overlays: no user-visible overlay of the actual dashboard exists this run, the route requires an authenticated Supabase session and no login was attempted to avoid creating live data in a possibly-production backend. Browser tooling was confirmed functional via a capability check on the reachable /login page only.

## Overall Impression

The dashboard's domain logic is the strongest part of the product, series-editing safeguards and studio-default auto-fill are specific, considered work. But the moments a user actually feels the product (errors, deletes, success confirmation) revert to generic web-app defaults: native alerts, off-token colors, and near-absent accessibility semantics on every custom interactive element. The biggest opportunity is one pass unifying the confirm/error/success surface into a single branded, accessible component.

## What's Working

1. The publish-button tier with domain-specific empty states ("Nothing to publish this week" instead of a generically greyed button), written for this product's exact weekly rhythm.
2. The series-scope confirmation flow: recalcDateInOwnWeek verifies a recalculated date lands on the target weekday before writing, aborting with a plain-language message rather than corrupting a series.
3. Studio-level defaults eliminating weekly re-entry, saved studio defaults flow into every future sync automatically, serving the "under 60 seconds" weekly-sync goal.

## Priority Issues

[P0] Native alert()/confirm() handle most errors and single-item deletes, inconsistent with the product's own custom modals. Why it matters: Heuristic 9 scores near-zero where users need it most; a raw OS alert is identical across every website ever built, contradicting "professional infrastructure, not a rebellion." Fix: route every confirm/error path through the existing custom modal component; translate backend errors to plain language everywhere (the pattern already exists at one call site). Suggested command: /impeccable harden

[P1] The most-repeated feedback element bypasses the design token system. Why it matters: the global success banner fires at every successful action (12+ sites) using hardcoded hex instead of sage/sage-light. Fix: replace with bg-sage-light text-sage border-sage/30. Suggested command: /impeccable polish

[P1] Off-palette yellow marks the "editing" state, violating the Rare Accent Rule. Why it matters: yellow appears nowhere in DESIGN.md's palette, shows up on every draft row's Edit button plus the whole edit-form border. Fix: replace with a clay- or bark-based highlight. Suggested command: /impeccable colorize

[P1] Accessibility semantics are essentially absent from every custom interactive component. Why it matters: the waitlist toggle is a bare div with no role/aria-checked/keyboard handler; all 4 modals lack role="dialog"/aria-modal/Escape; 19/20 labels unassociated; AddStudioModal has zero aria attributes anywhere. A keyboard-only or screen-reader user cannot operate the waitlist toggle at all. Fix: convert the toggle to a real button with role="switch"; add dialog semantics to the shared modal wrapper (one fix, one place); pair every label via htmlFor/id. Suggested command: /impeccable audit

[P1] stone and sage text fail WCAG AA contrast at the sizes they're used. Why it matters: text-stone computes to ~3.7:1, text-sage ~3.3:1, both under the 4.5:1 AA minimum, used for nearly all meta text often at 11-12px. Fix: darken stone for text usage specifically, or reserve current values for >=18px/bold contexts only. Suggested command: /impeccable audit

[P2] Draft checkboxes imply bulk delete but only wire to Publish Selected. Why it matters: the checkbox is the universal "select to act" pattern but only feeds Publish Selected; PRODUCT.md's own flagged open question. Fix: extend selection to drive Delete Selected, or restyle/relabel to stop implying a missing capability. Suggested command: /impeccable clarify

## Persona Red Flags

Alex (Power User): bulk-delete checkboxes do nothing (only feed Publish Selected); no modal binds Escape; zero keyboard shortcuts anywhere.

Sam (Accessibility): waitlist toggle unreachable by keyboard, not announced by screen readers; 19/20 unassociated labels; AddStudioModal has zero accessibility attributes in the entire file; all 4 modals lack dialog semantics; icon vocabulary mixes unicode/SVG/emoji inconsistently.

Casey (Distracted Mobile User): draft-row checkbox is a bare 16x16px hit area, under the 44x44pt thumb minimum; every delete interrupts the branded mobile flow with the OS's native confirm sheet. Strength for balance: Sync Classes panel is deliberately ordered first in mobile source order, a real mobile-first decision.

## Minor Observations

- AddStudioModal.js:280 contains a literal em dash in user-facing copy, violating the exception-free No Em Dashes rule.
- page.js:1110's internal comment still reads the deprecated "ADD & DRAFTS TAB" label. Not user-facing.
- ProductTour.js has drifted from CLAUDE.md's originally specified step order/copy.
- The manual Add-a-Class form's Studio select is never disabled when isIcsLocked is true.
- handleToggleWaitlist updates UI optimistically and only console.errors on failure, no rollback or user-facing indication.

## Questions to Consider

1. Every destructive action outside Delete All Drafts and series edits still routes through the browser's own alert()/confirm(). If the product's whole premise is "a portfolio, not a SaaS dashboard," what does it say that the moments only the instructor ever sees are the least-branded in the app?
2. The single most-repeated UI element bypasses the token defined for exactly its purpose while that token is used correctly elsewhere. Would fixing the success banner as a shared component clean up the yellow highlight and alert()-based errors as a natural side effect?
3. Draft checkboxes look like "select to act" everywhere else on the web but only feed Publish Selected. Now that Delete All Drafts exists, is scoped Delete Selected still needed, or should the checkboxes stop promising a capability the product doesn't offer?
