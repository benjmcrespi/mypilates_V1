# Instruktor — Product Context Document
> Feed this document to Claude Code at the start of every session for full product context.

---

## What We're Building

**Instruktor** is a professional scheduling and personal brand platform for boutique fitness instructors. Think LinkedIn for fitness instructors — but with a live, bookable schedule. It gives instructors the professional presence, portable following, and career data they need to build a practice that belongs to them, wherever they teach.

**Mission:** Give every fitness instructor the professional infrastructure to own their career — wherever they teach.

**Tagline:** Become an Instruktor.

**Domain:** instruktor.ca (migrated from mypilates.ca — complete)

**Social:** @beinstruktor on Instagram and TikTok

---

## Visual Design Rules — Read Before Generating Any UI

**[DESIGN.md](DESIGN.md) is the single source of truth for Instruktor's visual design system.** It is authoritative over the "Brand & Visual Identity" section below, which predates it and may drift out of sync (its own frontmatter and `.impeccable/design.json` sidecar are normative for exact token values).

- **Before generating, editing, or reviewing any visual component** (a screen, page, modal, card, button, form, or any other UI), read DESIGN.md in full first. Do not rely on memory of a prior read in the same session if meaningful time or work has passed — re-read it.
- **Do not invent colors, fonts, or spacing outside the design system.** Every color, font, radius, spacing, and shadow value used in UI code must trace back to a token or documented pattern in DESIGN.md (or its sidecar). No ad hoc hex codes, no arbitrary Tailwind values, no font-family outside DM Sans / Cormorant Garamond / DM Mono.
- If a design decision isn't covered by DESIGN.md, an existing component's need has no matching pattern, stop and ask rather than improvising a new token or one-off style.
- DESIGN.md's Do's and Don'ts and Named Rules (e.g. The Rare Accent Rule, The Twenty Pixel Floor Rule, The Flat-Dark Rule, The Binary Radius Rule) are binding constraints, not suggestions.
- A handful of accepted exceptions already exist in the live codebase (destructive buttons using raw red, a few status banners/badges using raw Tailwind colors instead of brand tokens). These are documented as accepted, not as precedent, don't extend them to new UI.
- Run `/impeccable document` to refresh DESIGN.md whenever the implemented system changes; keep this file and DESIGN.md pointing at each other rather than duplicating token values here.

---

## Current State (verified against codebase)

### Built and working

**Core platform**
- instruktor.ca live on Vercel, migrated from mypilates.ca
- Instructor auth, signup, dashboard
- Instructor profile: photo upload, bio, certifications, years of experience, Instagram handle, timezone
- Forgot password and /reset-password pages, both tested end to end
- Typography: DM Sans and Cormorant Garamond via next/font/google
- Hybrid colour palette applied throughout
- Mobile responsive on dashboard and student-facing page

**Classes and studios**
- Studio management with full CRUD
- ICS calendar sync at /api/sync, auto-populates booking link, note, and category from studio defaults
- Duplicate detection on ICS pull (upsert on external_uid)
- Draft class system with individual edit and per-row delete, plus a "Delete All Drafts" bulk action with confirmation modal
- Recurring class creation, weekly and bi-weekly, generates independent drafts with series_id
- Series editing and deletion: "this class only" vs "this and all future classes" scope modal, day-of-week recalculation that keeps each affected class in its own original week, confirmation when published classes are affected, never touches past classes or triggers follower emails
- ICS-synced classes lock their class name, date, and time fields as read-only when edited; booking link, booking note, and category remain editable
- "Save Draft" button to persist edits to a draft without publishing it
- Collapsible studio cards in Instructor Settings (My Saved Studios & Calendars), each showing an expandable recurring-schedule summary derived from series records, with an independent nested breakdown by series
- Class category system: CategorySelect component, categories.js with auto-inference and grouping, class_categories queries in dashboard and sync, category_id FK on classes
- Publish This Week's Schedule / Publish Next Week's Schedule, with tertiary "Publish all X drafts" link
- Green checkmark auto-save confirmation, 1.5s fade

**Student-facing**
- Student page at /[handle], dark header, linen body
- Classes grouped by week: This week / Next week / Later collapsed
- Bio truncation with Read More / Show Less
- Booking note and type shown on class cards
- Viral footer: "Build your own schedule page at Instruktor.ca"

**Growth and analytics**
- Email follow mechanic: /api/follow, /api/follow/confirm, /api/notify-followers
- Unfollow: /api/unfollow, /unfollow page, unfollow widget on student page
- Async notification queue: /api/queue-notification, /api/process-notification-queue
- Book Spot click tracking to analytics_events via /api/track-click
- Analytics cards: confirmed followers, total clicks, clicks this week, top class

**Onboarding**
- Landing page at instruktor.ca, all six sections
- Onboarding card carousel, 6 cards, triggered when onboarding_completed is false
- Product tour with Driver.js, 7 steps, programmatic tab navigation, re-triggerable from Settings
- PWA: next-pwa, manifest.json, icons, AddToHomeScreen banner with iOS/Android detection

**Terminology sweep complete:** My Classes, Sync Classes, Add a New Class, Booking Link, Booking Note (optional), Default Booking Link all confirmed in the dashboard.

### Not built
- Post-class attendance prompt, no UI and no attendance_reports queries anywhere
- Multi-select delete on drafts. Selection exists but drives "Publish Selected", not bulk delete. Session A added Delete All Drafts, which is different from multi-select delete. Decide whether multi-select delete is still wanted.

### Needs review
- **/classes discovery page** exists with category filtering. This was never specified in any session and is not part of the MVP plan. Determine whether it is intentional, a leftover from mypilates.ca, or speculative work. Either document it or remove it.

### Known quirks
- **Two different "week" boundaries coexist.** The Live Schedule's "This Week's Classes" grouping uses a Sunday-start week (Sun-Sat). The Publish This Week's/Next Week's Schedule buttons and the My Classes tab use a Monday-Sunday week instead. These are independent and both intentional, don't unify them without checking both call sites.
- **Studio schedule summaries only reflect series records.** The recurring-schedule summary on a collapsed studio card is derived from series records only; one-off manually created classes won't appear in it. Acceptable for now, revisit if instructors report missing classes.

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Tailwind CSS |
| Backend / Database | Supabase (PostgreSQL + Auth + Storage) |
| Email | Resend (DNS verified, SMTP configured) |
| Hosting | Vercel |
| Version Control | GitHub |
| Editor | VS Code + Claude Code |

---

## Brand & Visual Identity

Colors, typography, spacing, shadows, and component patterns live entirely in [DESIGN.md](DESIGN.md) now (see Visual Design Rules above). This section keeps only what DESIGN.md doesn't cover.

### Logo Mark
Clay rotated k mark on bark background. Built as geometric SVG paths, not a font character: a horizontal bar with two lines converging from upper-left and upper-right toward its centre, representing multiple studios converging into one professional presence. Assets: `public/instruktor_logo.svg`, `public/icon-192.png`, `public/icon-512.png`.

### Canonical Terminology — Use These Exact Labels Everywhere

If a UI element exists on more than one page or screen, it must use the same label everywhere. No synonyms, no variations.

| Concept | Correct Label | Never Use |
|---|---|---|
| The tab showing published and draft classes | My Classes | Add & Drafts, Drafts, Schedule |
| Adding a class manually | Add a New Class | Publish a New Class, Create Class |
| Pulling classes from iCal | Sync Classes | Sync Drafts, Pull Schedule, Pull Drafts |
| The URL for booking a class | Booking Link | Booking URL, Checkout Link, Book URL |
| The studio's default booking URL field | Default Booking Link | Default Booking URL, Checkout Link |
| The note shown to students on class cards | Booking Note (optional) | Booking Context, Booking Info |
| Publishing drafts for the current week | Publish This Week's Schedule | Publish All, Publish Drafts |

### Writing Style Rule — No Em Dashes
Never use em dashes (—) anywhere in the product — UI copy, landing page, emails, error messages, onboarding text, tooltips. Use a period, comma, or colon instead. This applies to all current and future copy without exception.

### Tone
Inviting, warm, professional, direct, collaborative. No "power shift" language toward studios; Instruktor is professional infrastructure, not a rebellion.

---

## User Roles

**Instructor** — pays subscription. Creates profile, syncs classes, publishes schedule, shares link.

**Student** — free. Views instructor page, clicks Book Spot, follows via email.

**Studio** — future. Discovers and hires instructors through Instruktor.

---

## Build Queue — In Priority Order

Every session through Session 8 (Sessions 1-5, Next A/B/C, the Class Category System, PWA, the Onboarding Copy/Weekly Grouping fix, Sessions A/B/C, Sessions 1-3, Landing Page, Product Tour, Session 7, Session 8) is shipped. Their original build specs are superseded by **Current State** above and by the implemented code, and have been removed here to stop them drifting out of sync; check git history if an old spec's exact original wording is ever needed. The two non-obvious behaviors those specs established are preserved under **Known quirks** above.

### Session 6 — Post-Class Attendance Prompt (not built)

After a class date passes, prompt the instructor (in-app notification or email):
*"Your [Class Name] was today — how many students attended?"*

Simple number input. Store: class_id, instructor_id, reported_count, reported_at.

Show on dashboard: attendance per class, average fill rate over time.

---

## Supabase Schema

Check existing tables before running anything. Only add what is not already there.

```sql
-- Studios (may already exist)
CREATE TABLE IF NOT EXISTS studios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT,
  default_booking_url TEXT, -- UI label: "Default Booking Link"
  ics_feed_url TEXT,
  booking_type TEXT DEFAULT 'direct',
  booking_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Followers (may already exist)
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(instructor_id, email)
);

-- Analytics events (may already exist)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  instructor_id UUID REFERENCES profiles(id),
  class_id UUID REFERENCES classes(id),
  follower_email TEXT,
  source TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance reports
CREATE TABLE IF NOT EXISTS attendance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id),
  instructor_id UUID REFERENCES profiles(id),
  reported_count INTEGER,
  reported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile columns (add only if missing)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_handle TEXT;

-- Classes columns (add only if missing)
ALTER TABLE classes ADD COLUMN IF NOT EXISTS series_id UUID;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES class_categories(id);
ALTER TABLE classes ADD COLUMN IF NOT EXISTS category_other TEXT;
```

---

## Key Design Principles

**Instructor is the product.** Their name and brand lead every page.

**Mobile is the primary surface.** Design mobile first, always.

**Reduce every interaction to its minimum.** Weekly sync in under 60 seconds.

**Follower emails are for new classes only.** Editing or deleting an existing class, published or not, never triggers a follower notification. Only newly published classes generate emails.

**The instructor owns booking details, the studio owns the facts.** For iCal-synced classes the studio owns class name, date, and time. The instructor owns Booking Link, Booking Note, and Category. Never lock an entire synced class, that would block publishing.

**Auto-save confirmation.** Never show "Auto-saves on blur" text anywhere in the product. All auto-saved fields show a vanishing green checkmark (sage) after saving — appears for 1.5 seconds then fades. No text explanation needed.

**Professional by default.** Every screen should feel like a tool a serious professional is proud to share.

**Instrument everything from day one.** Log every click, follow, and view now.

**Warm over clinical.** Community platform, not SaaS dashboard.

**Dark for brand moments, light for work.** Clay is universal across both.

---

## Onboarding Flow Target

1. Sign up → onboarding cards (not skippable) → product tour (Driver.js)
2. Complete profile — photo, bio, certifications
3. Add studios — name, platform, booking type, URL, ICS feed
4. Pull Latest Schedule
5. Review drafts
6. Publish All
7. Share instruktor.ca/[username] in Instagram bio

**Target: signup to live page in under 10 minutes.**

---

## Monetisation

**Beta:** Free. Invite-only. Hannah and small initial cohort.

**Founding Instruktor cohort:** First 50 spots at $9/month locked forever. Opens once instructors return weekly without prompting. Founding members get a visible badge and direct product access. Waitlist to be live on landing page.

**V1 standard:** $15/month once founding cohort closes.

**Future:** Studio marketplace, 2% API booking fee, instructor invoicing (Stripe Connect, auto-generated from class data, GST-aware), digital product platform fee.

---

## Parked — Post-MVP

- Full student accounts with following feed
- Post-class student reviews (portable, tied to instructor not studio)
- Analytics dashboard v2 — shareable audition portfolio
- Merit-based verification badge (Airbnb Superhost model)
- API integrations — Mindbody, Mariana Tek
- Location-based class discovery (viable at 50+ instructors per city)
- Studio marketplace — studios discovering and hiring instructors
- Student booking confirmation ("I booked it" mechanic)

---

## MVP Success Metrics

- Hannah's full profile live across all 4 studios, clean on mobile
- 15 Vancouver instructors onboarded within 60 days
- Every Book Spot click tracked
- Instructors returning weekly without prompting
- At least one instructor shares their page on Instagram and drives measurable traffic
