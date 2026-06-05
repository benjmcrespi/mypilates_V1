# Instruktor — Product Context Document
> Feed this document to Claude Code at the start of every session for full product context.

---

## What We're Building

**Instruktor** is a professional scheduling and personal brand platform for boutique fitness instructors. Think LinkedIn for fitness instructors — but with a live, bookable schedule. It gives instructors the professional presence, portable following, and career data they need to build a practice that belongs to them, wherever they teach.

**Mission:** Give every fitness instructor the professional infrastructure to own their career — wherever they teach.

**Tagline:** Become an Instruktor.

**Domain:** instruktor.ca (migrated from mypilates.ca — complete)

---

## The Problem

Boutique fitness instructors are skilled professionals who often teach across multiple studios simultaneously. But the infrastructure around them wasn't built with them in mind.

Today, an instructor teaching at three studios has:
- Three separate booking platforms with no unified presence
- Client relationships stored on each studio's platform — not portable
- Reviews and ratings that stay with studios when the instructor moves on
- No professional profile that travels with them
- No data to show what they bring to a room

Instruktor builds the professional layer that's been missing.

---

## The Solution

A profile page at instruktor.ca/[username] — the instructor's professional home. It:
- Consolidates classes from all studios into one bookable schedule
- Builds a student following the instructor carries everywhere they teach
- Generates performance data portable to any future opportunity
- Exists independently of any single studio or platform

Studios benefit too. An instructor with a professional profile, a proven following, and trackable fill rates is easier to hire and less of a gamble. Instruktor makes instructors more credible, not more threatening.

**The analogy:** Every photographer has a portfolio. Every musician has a Spotify artist page. Every professional has a LinkedIn. Fitness instructors should have an Instruktor.

---

## Current State

Already built and working:
- instruktor.ca live with hybrid colour palette applied
- Instructor authentication and dashboard (3 tabs: Live Schedule, Add & Drafts, Instructor Settings)
- ICS calendar file upload and parsing with duplicate detection via `external_uid`
- Draft class system — pull from ICS, edit, Publish All in one tap
- Student-facing schedule page at instruktor.ca/[username]
- Instructor profile: photo upload (Supabase Storage `avatars` bucket), bio, certifications (tags), years of experience, Instagram handle
- Studio management: platform dropdown, booking type, booking note, default booking URL, iCal link — all set once per studio, auto-inherited by synced classes
- Sync API: parses native ICS `URL:` field (uses it over studio default when present), stamps `booking_type` and `booking_note` onto every draft
- Booking context on student page: coloured badges (membership required, app recommended, drop-in welcome) + booking note shown on each class card
- Publish All button — one tap publishes every pending draft
- Draft count badge on Add & Drafts tab

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
Warm, professional, inviting, direct. The product should feel like a well-designed professional tool that happens to be built for a creative, community-driven industry. Not clinical like a SaaS dashboard. Not soft like a generic wellness app. Confident and approachable — the way a great instructor carries themselves.

Reference aesthetic: Kolm Kontrast (kolmkontrast.com) — warm dark palette, premium but not cold. Not as dark.

### The LinkedIn Parallel
Instruktor is to fitness instructors what LinkedIn is to professionals. It is not a statement about studios. It is a statement about taking your career seriously. Studios don't feel threatened by instructors having a LinkedIn. They won't feel threatened by instructors having an Instruktor — because it signals professionalism, not defiance.

### Tone
- **Inviting:** speaks to instructors as accomplished professionals, not underdogs
- **Warm:** community-first, not corporate
- **Professional:** clean, direct, no fitness clichés
- **Direct:** says what it means, no hedging

Avoid: "power shift," "the studio should be grateful," adversarial framing of any kind. The student-studio-instructor relationship is collaborative. Instruktor sits inside that relationship as a professional tool, not against it.

### Palette — Hybrid Approach

Dark surfaces for brand/profile moments. Light surfaces for functional content. Clay is the universal constant across both.

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
- **Instructor dashboard:** light
- **Onboarding cards:** dark throughout, clay final card
- **Landing page hero:** dark
- **Landing page content sections:** alternating dark/light

### Component Patterns
- **Primary button:** `bg-clay text-linen rounded-xl`
- **Dark page background:** `bg-espresso`
- **Light page background:** `bg-linen`
- **Cards on dark:** `bg-bark border border-white/10 rounded-xl`
- **Cards on light:** `bg-white border border-sand rounded-xl`
- **Dark muted text:** `text-smoke`
- **Light muted text:** `text-stone`
- **Section labels:** 11px, uppercase, letter-spacing

---

## User Roles

### Instructor (primary customer — pays subscription)
Creates and manages their profile. Syncs classes from studios. Publishes their schedule. Shares their instruktor.ca/[username] link.

### Student (end user — free)
Views an instructor's page. Clicks Book Spot. Can follow an instructor via email to get notified of new classes.

### Studio (future — not in MVP)
Will eventually discover and hire instructors through Instruktor. Not adversaries — partners. An instructor with a strong Instruktor profile is a lower-risk hire.

---

## MVP Build Order

Build in this exact sequence. Do not jump ahead.

---

### Session 1 — Colour system update ✓ (COMPLETE)

---

### Session 2 — Studio management with default booking URLs ✓ (COMPLETE)

Each instructor adds studios to their profile. Each studio record stores:
- Studio name
- Platform (Mindbody / Mariana Tek / Other)
- Default booking URL — auto-applied to all classes from this studio on sync
- ICS feed URL
- Booking type: "Direct link" / "Membership required" / "App recommended" / "Drop-in welcome"
- Booking note — optional short text (e.g. "Book through the Altea app")

**Auto-population on sync:**
Classes inherit booking URL, booking type, and booking note from the matched studio. Instructor can override per class but rarely needs to.

Check ICS events for a native URL property — if present, use that over the studio default.

**Booking context on student page:**
Show booking type and note on each class card. A student hitting a membership wall with no warning is a broken experience.

**Per-class override:**
Edit option on each draft for exceptions. Not visible by default.

**Publish All button:**
One tap to publish all reviewed drafts. Target: full weekly sync under 60 seconds.

**Duplicate detection:**
Match on class name + start time + studio. No duplicates on re-pull.

---

### Session 3 — Mobile optimisation

Both dashboard and instruktor.ca/[username] fully responsive, tested on a real phone.

Priority screens: student profile page, pull/publish flow, studio management form.

Acceptance test: Hannah completes full weekly sync on her phone in under 60 seconds without help.

---

### Session 4 — Email follow mechanic

On instruktor.ca/[username]:
- "Follow [Name] — get notified when new classes are added"
- Email input + submit
- Store: email, instructor_id, created_at, confirmed boolean
- Confirmation email on submit
- Notify instructor at follower milestones (1, 10, 25, 50)
- Notify confirmed followers when instructor publishes new classes

Show follower count as a metric on instructor dashboard.

No full student authentication in this session. Email capture only.

---

### Session 5 — Click-through tracking

Log every Book Spot click: `event_type`, `instructor_id`, `class_id`, `timestamp`, `follower_email` if available, `source`.

Show on instructor dashboard:
- Clicks per class
- Total clicks this week
- Top class by clicks

Instrument completely now even if full dashboard comes later.

---

### Session 6 — Post-class attendance prompt

After a class date passes, prompt the instructor:
*"Your [Class Name] was today — how many students attended?"*

Store: class_id, instructor_id, reported_count, reported_at.

Show: attendance per class, average fill rate over time.

---

### Session 7 — Onboarding card flow

Shown once after signup. Cannot be skipped. Re-accessible from Settings → "Watch walkthrough again."

Six cards:
1. "You became an Instruktor." — identity
2. "One link. Every class." — core value
3. "Your brand. Your page." — instruktor.ca/[username]
4. "Your students follow you." — portable following
5. "We're just getting started." — coming soon
6. "Let's build your profile." — CTA to setup

Dark throughout. Clay final card. No skip button. Progress dots. Swipeable on mobile.

Track `onboarding_completed` boolean on profiles table.

---

### Session 8 — Viral growth mechanic

Subtle footer on every student-facing page:
*"Build your own schedule page — Instruktor.ca"*

Small, unobtrusive, stone/smoke colour. Does not compete with instructor content.

---

## Parked — Post-MVP

- Landing/marketing page (design complete, build after product is stable)
- Full student accounts
- Post-class student reviews (tied to instructor, portable)
- Analytics dashboard v2 — audition portfolio
- Merit-based verification badge
- API integrations (Mindbody, Mariana Tek)
- Location-based class discovery
- Studio marketplace
- Instructor digital product sales

---

## Supabase Schema — Current State

### Already live (do not recreate)

**profiles** — id, full_name, role, avatar_url, bio, handle, timezone, certifications (text[]), years_experience (int), instagram_handle, calendar_url, default_studio_links, onboarding_completed (still needs adding — see below)

**studios** — id, instructor_id, name, platform, booking_flow, booking_type, booking_note, default_booking_url, default_class_type, calendar_url (= ics feed), location_url, created_at
> Note: ICS feed URL is stored as `calendar_url` on studios (not `ics_feed_url`)

**classes** — id, instructor_id, class_name, class_type, date_time, booking_url, booking_type, booking_note, studio_name, studio_id, location_url, status ('draft'|'published'), external_uid (unique — used for dedup), is_waitlisted

**Storage bucket** — `avatars` (public, 5MB limit, images only). Path pattern: `{user_id}/avatar.{ext}`

### Still needed (add in future sessions)

```sql
-- Session 4: Email follow mechanic
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(instructor_id, email)
);

-- Session 5: Click-through tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'book_spot_click' | 'page_view' | 'follow'
  instructor_id UUID REFERENCES profiles(id),
  class_id UUID REFERENCES classes(id),
  follower_email TEXT,
  source TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session 6: Attendance reporting
CREATE TABLE IF NOT EXISTS attendance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id),
  instructor_id UUID REFERENCES profiles(id),
  reported_count INTEGER,
  reported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session 7: Onboarding tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
```

---

## Key Design Principles

**Instructor is the product.** Their name, photo, and brand lead every page. Instruktor is the frame, not the feature.

**Mobile is the primary surface.** Students click from Instagram. Instructors manage between classes. Design mobile first.

**Reduce every interaction to its minimum.** Weekly sync must take under 60 seconds. Complexity is a failure of design.

**Professional by default.** Every screen should feel like a tool a serious professional would use and be proud to share.

**Instrument everything from day one.** Log every click, follow, and view now. Retroactive data collection is impossible.

**Warm over clinical.** Community platform, not SaaS dashboard.

**Dark for brand moments, light for work.** Hero sections and onboarding use dark. Dashboards and class lists use light. Clay is universal.

---

## Instructor Onboarding Target

1. Sign up → onboarding cards (not skippable)
2. Profile — photo, bio, certifications
3. Add studios — name, platform, booking type, URL, ICS feed
4. Pull Latest Schedule
5. Review drafts (mostly auto-populated)
6. Publish All
7. Share instruktor.ca/[username] in Instagram bio

**Target: signup to live page in under 10 minutes.**

---

## Monetisation

**Current:** Free during beta.

**V1:** $15/month. Early adopter cohort locks in permanently at a lower rate.

**Future:** Studio marketplace subscription, 2% API booking fee, digital product platform fee.

---

## MVP Success Metrics

- Hannah's full profile live across all 4 studios, clean on mobile
- 15 Vancouver instructors onboarded within 60 days
- Every Book Spot click tracked from day one
- Instructors returning weekly to pull and publish without prompting
- At least one instructor shares their page on Instagram and drives measurable traffic