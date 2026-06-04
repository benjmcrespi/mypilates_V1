# Instruktor — Product Context Document
> Feed this document to Claude Code at the start of every session for full product context.

---

## What We're Building

**Instruktor** is a personal brand and scheduling platform purpose-built for boutique fitness instructors. It consolidates classes from multiple studios into one instructor-owned profile page, giving instructors the professional presence, client ownership, and performance data they need to build careers on their own terms.

**Mission:** Shift the power dynamic in boutique fitness — from "the instructor is grateful to teach at the studio" to "the studio is grateful to have the instructor."

**Tagline:** Become an Instruktor.

**Domain:** instruktor.ca (migrated from mypilates.ca — complete)

---

## The Problem

Boutique fitness instructors often teach at 2–4 studios simultaneously. Each studio runs its own booking platform (Mindbody, Mariana Tek, etc.). The instructor has no unified presence — their identity and client relationships are fragmented across platforms they don't own. When an instructor leaves a studio, their booking history, reviews, and client relationships stay behind.

---

## The Solution

A profile page at instruktor.ca/[username] that:
- Pulls all classes from all studios into one place via ICS calendar sync
- Belongs to the instructor, not any studio
- Builds a student following the instructor owns
- Generates analytics they can take into studio auditions

---

## Current State

Already built and working:
- instruktor.ca live with hybrid colour palette applied
- Instructor authentication and dashboard
- ICS calendar file upload and parsing
- Draft class system — pull from ICS, edit, publish
- Student-facing schedule page at instruktor.ca/[username]
- Basic class cards with Book Spot button linking to studio booking pages
- Instructor bio information completed

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Tailwind CSS |
| Backend / Database | Supabase (PostgreSQL + Auth + Storage), project ID: `ptbemdzqfujbfjiybooj` |
| Hosting | Vercel |
| Version Control | GitHub |
| Editor | VS Code + Claude Code |

---

## Brand & Visual Identity

### Positioning
Warm, grounded, empowering, inclusive. Not feminine, not techy, not corporate. Premium and distinctive — closer to a high-end wellness brand than a SaaS product. Reference: Kolm Kontrast (kolmkontrast.com) — warm dark aesthetic, not as dark.

### Palette — Hybrid Approach

The platform uses dark surfaces for brand/profile moments and light surfaces for functional content. Clay is the universal constant — works on both dark and light backgrounds.

**Dark surfaces (hero sections, profile headers, navigation, onboarding):**

| Token | Hex | Usage |
|---|---|---|
| `espresso` | `#1A0E07` | Page background, hero sections, nav |
| `bark` | `#2C1810` | Cards on dark, surface elements |
| `linen` | `#F7F3EE` | Primary text on dark |
| `smoke` | `#BFA090` | Muted text on dark |

**Light surfaces (class lists, dashboards, forms, functional content):**

| Token | Hex | Usage |
|---|---|---|
| `linen` | `#F7F3EE` | Page background in light sections |
| `bark` | `#2C1810` | Primary text on light |
| `sand` | `#E4CDB8` | Borders, dividers |
| `stone` | `#9B8070` | Muted text on light |

**Universal tokens (work on both):**

| Token | Hex | Usage |
|---|---|---|
| `clay` | `#C4683A` | Primary action — all buttons, CTAs, active states |
| `sage` | `#7A9471` | Success states, verification |
| `sage-light` | `#EAF0E6` | Success backgrounds on light |

### Tailwind Config

```javascript
colors: {
  espresso: '#1A0E07',
  bark:     '#2C1810',
  linen:    '#F7F3EE',
  sand:     '#E4CDB8',
  stone:    '#9B8070',
  smoke:    '#BFA090',
  clay: {
    DEFAULT: '#C4683A',
    light:   '#F2E6DF',
    dark:    '#7A3520',
  },
  sage: {
    DEFAULT: '#7A9471',
    light:   '#EAF0E6',
  },
},
```

### Hybrid Usage Pattern
- **Instructor profile header / student page header:** dark (espresso bg, linen text)
- **Class list / schedule content:** light (linen bg, bark text)
- **Instructor dashboard:** light (easier to work in)
- **Onboarding cards:** dark throughout, clay final CTA card
- **Landing page hero:** dark
- **Landing page content sections:** alternating dark/light

### Component Patterns
- **Primary button:** `bg-clay text-linen rounded-xl` — universal
- **Page background (dark sections):** `bg-espresso`
- **Page background (light sections):** `bg-linen`
- **Cards on dark:** `bg-bark border border-white/10 rounded-xl`
- **Cards on light:** `bg-white border border-sand rounded-xl`
- **Dark muted text:** `text-smoke`
- **Light muted text:** `text-stone`
- **Section labels:** 11px, uppercase, letter-spacing

---

## User Roles

### Instructor (primary customer — pays subscription)
Creates and manages their profile. Syncs classes from studios. Publishes their schedule. Shares their instruktor.ca/[username] link on social media.

### Student (end user — free)
Views an instructor's schedule page. Clicks Book Spot to be redirected to the studio's booking platform. Can follow an instructor via email to get notified of new classes.

### Studio (future — not in MVP)
Will eventually have accounts to discover and hire instructors based on Instruktor analytics data.

---

## MVP Build Order

Build in this exact sequence. Do not jump ahead.

---

### Session 1 — Colour system update ✓ (COMPLETE)
Apply hybrid palette tokens to Tailwind config. Dark header on student-facing page, light body. Dashboard remains light.

---

### Session 2 — Studio management with default booking URLs

Each instructor adds studios to their profile. Each studio record stores:
- Studio name
- Platform (Mindbody / Mariana Tek / Other) — dropdown
- Default booking URL — auto-applied to all classes from this studio on sync
- ICS feed URL
- Booking type — dropdown: "Direct link" / "Membership required" / "App recommended" / "Drop-in welcome"
- Booking note — optional short text (e.g. "Book through the Altea app", "First class free")

**Auto-population logic on sync:**
When a class is pulled from an ICS feed, it inherits the booking URL, booking type, and booking note from its matching studio automatically. Instructor can override per class but should rarely need to.

Also check ICS events for a native URL property — if present, use that instead of the studio default.

**Booking type and note display on student page:**
Show booking context on each class card so students know what to expect before clicking Book Spot. A student hitting a membership wall with no warning is a broken experience.

**Per-class override:**
Each draft card has an Edit option for class-specific exceptions. Not visible by default — only used when a class differs from the studio default.

**Publish All button:**
Single button to publish all reviewed drafts in one tap. Target: full weekly sync in under 60 seconds.

**Duplicate detection:**
Do not create duplicate classes if the instructor pulls their schedule multiple times. Match on class name + start time + studio.

---

### Session 3 — Mobile optimisation

Both the instructor dashboard and instruktor.ca/[username] must be fully responsive and pixel-perfect on mobile. Test on a real phone, not browser dev tools.

Priority screens:
- Student-facing profile page (students click from Instagram stories)
- Pull Latest Schedule flow (instructors manage between classes)
- Studio management form
- Publish All confirmation

Acceptance test: Hannah can complete the full weekly sync — pull, review, publish — on her phone in under 60 seconds without assistance.

---

### Session 4 — Email follow mechanic

On instruktor.ca/[username], below the instructor header:
- "Follow [Name] — get notified when new classes are added"
- Single email input + submit button
- Store: email, instructor_id, created_at, confirmed boolean

On submit:
- Send confirmation email to the student
- On confirm: mark confirmed = true, send welcome message
- Notify instructor when follower count milestones are hit (first follower, 10, 25, 50)

Show follower count on instructor's dashboard as a metric card.

When instructor publishes new classes, send notification email to confirmed followers.

**Do not build full student authentication in this session.** Email capture only.

---

### Session 5 — Click-through tracking

Every Book Spot button click must log an analytics event.

Log: `event_type: 'book_spot_click'`, `instructor_id`, `class_id`, `timestamp`, `follower_email` (if available from follow session), `source` (direct / social — infer from referrer)

Show on instructor dashboard:
- Book Spot clicks per class
- Total clicks this week
- Top class by clicks

This is the foundation of the analytics layer. Instrument it completely even if the full dashboard UI comes later. Retroactive data collection is impossible.

---

### Session 6 — Post-class attendance prompt

After a class date passes, send the instructor an in-app notification or email:
*"Your [Class Name] was today — how many students attended?"*

Simple number input. Store: class_id, instructor_id, reported_count, reported_at.

Show on dashboard: reported attendance per class, average fill rate over time.

This feeds the audition analytics portfolio in a future release.

---

### Session 7 — Onboarding card flow

A card carousel shown once to every new instructor after signup, before they reach the dashboard. Cannot be skipped — must complete or it remains on the next login. Re-accessible any time from Settings → "Watch walkthrough again."

Six cards in sequence:
1. "You became an Instruktor." — identity/welcome
2. "One link. Every class." — core value prop
3. "Your brand. Your page." — instruktor.ca/[username]
4. "Your students follow you." — ownership
5. "We're just getting started." — coming soon preview
6. "Let's build your profile." — CTA to profile setup

Design: dark throughout (espresso bg), clay accent, linen text. Final card: clay background. No skip button. Progress dots (pill shape for active). Swipeable on mobile.

Track: `onboarding_completed boolean` on profiles table.

---

### Session 8 — Viral growth mechanic

On every instruktor.ca/[username] page, add a subtle footer:
*"Build your own schedule page — Instruktor.ca"*

Understated — should not compete with the instructor's content. Small text, stone/smoke colour, no button. Just a link.

---

## Parked — Build After MVP

Do not build these now. Architecture should anticipate them.

- Landing/marketing page (design complete, build after product is stable)
- Full student accounts with authentication
- Post-class student reviews (tied to instructor, not studio)
- Analytics dashboard v2 — shareable audition portfolio
- Merit-based verification badge (Uber/Airbnb Superhost model)
- API integrations with Mindbody and Mariana Tek
- Location-based class discovery
- Studio marketplace
- Instructor digital product sales

---

## Supabase Schema — Extensions Needed

Check existing schema before touching anything. Only add what isn't already there.

```sql
-- Studios table
CREATE TABLE IF NOT EXISTS studios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT, -- 'mindbody' | 'mariana_tek' | 'other'
  default_booking_url TEXT,
  ics_feed_url TEXT,
  booking_type TEXT DEFAULT 'direct',
  -- 'direct' | 'membership_required' | 'app_recommended' | 'dropin_welcome'
  booking_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Followers
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(instructor_id, email)
);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  -- 'book_spot_click' | 'page_view' | 'follow' | 'attendance_reported'
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

-- Profiles extensions (add only if columns don't exist)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
```

Ensure classes table has: `studio_id` (FK to studios), `booking_url` (overrideable), `booking_type` (overrideable), `booking_note` (overrideable), `status` ('draft' | 'published'), `category`, `start_time`.

---

## Key Design Principles

**Instructor is the product.** Their name, photo, and brand lead every page. Instruktor branding is secondary on public profiles.

**Mobile is the primary surface.** Design mobile first. Students click from Instagram. Instructors manage between classes.

**Reduce every interaction to its minimum.** The weekly sync workflow must take under 60 seconds on mobile. Complexity is a failure of design.

**Own the relationship.** Every feature moves client relationships from the studio to the instructor.

**Instrument everything from day one.** Log every click, follow, and view now — even if the dashboard UI comes later. Retroactive collection is impossible.

**Warm over clinical.** Every UI decision favours warmth and approachability. This is a community platform.

**Dark for brand moments, light for work.** Hero sections, profile headers, and onboarding use dark. Dashboards, forms, and class lists use light. Clay is universal.

---

## Instructor Onboarding Flow (Target)

1. Sign up → complete onboarding card carousel (not skippable)
2. Complete profile — photo, bio, certifications
3. Add studios — name, platform, booking type, booking URL, ICS feed URL
4. Pull Latest Schedule — classes populate as drafts
5. Review drafts (most fields auto-populated)
6. Publish All
7. Share instruktor.ca/[username] in Instagram bio

**Target: signup to live page in under 10 minutes.**

---

## Monetisation

**Current:** Free during beta with early instructors.

**V1:** $15/month per instructor. Early adopter cohort locks in permanently at a lower rate.

**Future:** Studio marketplace subscription, 2% API booking fee, instructor digital product platform fee.

---

## Success at MVP

- Hannah's full profile live across all 4 studios, clean on mobile
- 15 Vancouver instructors onboarded within 60 days of beta launch
- Every Book Spot click tracked from day one
- Instructors returning weekly to pull and publish without prompting
- At least one instructor shares their page on Instagram and drives measurable traffic
