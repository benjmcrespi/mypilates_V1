# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: instructors.** Boutique fitness instructors (Pilates, yoga, barre, and similar studio-based disciplines) who teach at more than one studio. They need a professional presence and a live, bookable schedule that belongs to them, not to any single studio, plus a portable following and career data that travels with them if they change studios.

**Secondary: students.** Free users who view an instructor's public page, browse upcoming classes, click through to book (an external, studio-owned booking link), and can follow an instructor by email to hear about newly published classes.

**Future, not yet built: studios.** Would discover and hire instructors through Instruktor. No studio-facing accounts or workflows exist today.

## Product Purpose

Instruktor is a scheduling and personal-brand platform for boutique fitness instructors: professional infrastructure they own, wherever they teach. It aggregates an instructor's classes across every studio they teach at into one profile and one live bookable schedule, syncs automatically from each studio's calendar, and accrues a portable following and click/analytics history that belongs to the instructor rather than any studio.

Mission: give every fitness instructor the professional infrastructure to own their career, wherever they teach. Success looks like instructors returning weekly without being prompted, sharing their page (e.g. in an Instagram bio), and that share driving measurable student traffic and follows.

## Positioning

Not a studio's booking system and not a generic scheduling tool. A studio's booking page only ever shows that studio's classes and is owned by the studio. Instruktor is the instructor's own page: it pulls classes from every studio they teach at into one link, and the following, click data, and career history it builds stay with the instructor if they change studios. A competing scheduler or a studio's own system could not truthfully make that portability claim, because their data is bound to the studio.

## Operating Context

- Weekly workflow: instructor syncs each studio's calendar (ICS feed), reviews auto-generated drafts, publishes, and shares one `instruktor.ca/[handle]` link. Target: under 60 seconds end to end.
- Mobile is the primary surface, both for the instructor's dashboard workflow and for students viewing a shared page.
- Students arrive via a shared link (typically an Instagram bio), view classes grouped by week, and click Book Spot, which sends them to a studio-owned external booking link. They may follow the instructor by email for notifications about newly published classes only.
- Instructors are currently invite-only beta users (Hannah plus a small initial cohort), based in Vancouver, BC.

## Capabilities and Constraints

- Built: instructor auth/profile, studio CRUD, ICS calendar sync with duplicate detection, draft/publish class workflow, recurring and series classes (weekly/bi-weekly) with day-of-week series editing, class category taxonomy, follower email mechanic, Book Spot click tracking, PWA installability, onboarding carousel, and a re-triggerable product tour.
- For ICS-synced classes, the studio owns the facts: class name, date, and time are read-only once synced. The instructor always owns Booking Link, Booking Note, and Category, even on synced classes. Never lock an entire synced class, only the studio-owned fields.
- Follower notification emails fire only for newly published classes. Edits or deletions of existing classes, published or draft, never trigger a follower email.
- A canonical terminology table (in CLAUDE.md) is binding across every screen: "My Classes," "Add a New Class," "Sync Classes," "Booking Link," "Booking Note (optional)," "Default Booking Link," "Publish This Week's Schedule," etc. No synonyms, no variation between screens.
- Voice constraint: no em dash anywhere in product copy, ever (UI, landing page, emails, errors, onboarding, tooltips).
- Not yet built: post-class attendance prompts, full student accounts, studio-side accounts, studio marketplace. Undecided: whether multi-select bulk delete of drafts is still wanted (current multi-select drives "Publish Selected," not delete; a separate "Delete All Drafts" bulk action already exists).
- Unresolved: a `/classes` discovery page with category filtering exists in the codebase but was never specified in any prior session and is not confirmed MVP scope. Needs a decision (keep, document, or remove) before being treated as product surface.

## Brand Commitments

- Name: Instruktor. Tagline: "Become an Instruktor." Domain: instruktor.ca (migrated from mypilates.ca). Social: @beinstruktor on Instagram and TikTok.
- Logo: a clay, rotated "k" mark on a bark background, built as geometric SVG paths (not a font glyph), representing multiple studios converging into one professional presence. Assets: `public/instruktor_logo.svg`, `public/icon-192.png`, `public/icon-512.png`.
- Tone: inviting, warm, professional, direct, collaborative. Explicitly not adversarial toward studios and no "power shift" framing; the student-studio-instructor relationship is collaborative. Instruktor is professional infrastructure, not a rebellion.
- The canonical terminology table and the no-em-dash rule (above) are binding brand/voice commitments, not stylistic suggestions.

## Evidence on Hand

- Hannah is a real, live instructor with an onboarded profile (confirmed by the user, 2026-08-30). Her full profile live and clean on mobile across all 4 studios she teaches at is an explicit MVP success metric, so confirm current completeness before citing her as a finished proof point rather than assuming it is fully done.
- No testimonials, press mentions, case studies, additional real-customer logos, or aggregate usage stats exist yet beyond Hannah's own usage. Future design or marketing work must not fabricate additional testimonials, customer counts, or usage numbers.
- The beta is invite-only; the near-term target is 15 Vancouver instructors onboarded within 60 days of MVP, not a number already reached.

## Product Principles

1. The instructor is the product. Their name and brand lead every page.
2. Mobile is the primary surface. Design mobile-first, always.
3. Reduce every interaction to its minimum. The weekly sync workflow must stay under 60 seconds.
4. The instructor owns booking details, the studio owns the facts. Never lock an entire synced class to enforce this.
5. Instrument everything from day one. Every click, follow, and view is logged, not added later.

## Accessibility & Inclusion

No formal accessibility standard is required (confirmed by the user, 2026-08-30). Use sensible defaults: sufficient contrast, adequate tap targets, semantic HTML. No product-specific accessibility requirement is established beyond that.
