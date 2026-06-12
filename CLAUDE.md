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

## Current State (what is already built and working)

- instruktor.ca live, deployed on Vercel, full domain migration complete
- Hybrid colour palette applied throughout
- Instructor authentication, sign up, and dashboard
- Instructor profile — photo upload, bio, certifications, years of experience, Instagram handle, timezone
- Studio management — name, platform, booking type, booking note, default booking URL, ICS feed URL
- ICS calendar sync — pull latest schedule, auto-populates booking URL/type/note from studio defaults
- Duplicate detection on ICS pull
- Draft class system — edit individual drafts, Publish All button
- Multi-select delete on drafts
- Student-facing page at instruktor.ca/[username] — dark header, linen body, hybrid palette
- Classes grouped by week on student page (This week / Next week / Later collapsed)
- Bio truncated with Read More / Show Less toggle
- Email follow mechanic — email capture, confirmation email, follower notifications on new publish
- Follower count on instructor dashboard
- Click-through tracking on every Book Spot button — logged to analytics_events table
- Analytics dashboard cards — confirmed followers, total clicks, clicks this week, top class
- Booking context shown on student page class cards (booking type and note)
- Mobile responsive on both dashboard and student-facing page
- Recurring class creation — weekly and bi-weekly repeat options, generates independent draft instances with series_id, works with Publish All

**Not yet built (build in order below):**
- Recurring class creation for manual studios
- Forgot password + /reset-password page
- Typography system (DM Sans + Cormorant Garamond)
- Landing/marketing page at instruktor.ca
- Product tour (Driver.js)
- Post-class attendance prompt
- Onboarding card carousel
- Viral footer CTA

---

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

### Logo Mark
Clay rotated k mark on bark (#2C1810) background. Built as geometric SVG paths — not a font character. A horizontal bar with two lines converging from upper-left and upper-right toward the centre of the bar. Represents multiple studios converging into one professional presence.

### Typography System — Two Fonts

**Cormorant Garamond** (Google Fonts) — display/brand use only
- The Instruktor wordmark in the nav
- Instructor name on student-facing profile header
- H1 display headings on the landing page hero
- Nothing smaller than 20px. Never on form inputs, buttons, or functional UI.

**DM Sans** (Google Fonts) — everything else
- All body text, class names, dates, times
- Buttons, inputs, labels, dropdowns
- Nav links, dashboard content, analytics cards
- The default font-family for the entire app

**Tailwind Config:**
```javascript
fontFamily: {
  sans:  ['DM Sans', 'system-ui', 'sans-serif'],
  serif: ['Cormorant Garamond', 'Georgia', 'serif'],
},
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

### Wordmark
"Instruktor" — Cormorant Garamond, title case, weight 400, letter-spacing 4px.
- Primary: linen (#F7F3EE) on espresso (#1A0E07)
- Secondary: clay (#C4683A) on linen (#F7F3EE)

### Palette — Hybrid Approach

**Dark surfaces (profile headers, hero sections, nav, onboarding):**

| Token | Hex | Usage |
|---|---|---|
| `espresso` | `#1A0E07` | Page background, hero sections |
| `bark` | `#2C1810` | Cards on dark, surface elements |
| `linen` | `#F7F3EE` | Primary text on dark |
| `smoke` | `#BFA090` | Muted text on dark |

**Light surfaces (dashboards, class lists, forms):**

| Token | Hex | Usage |
|---|---|---|
| `linen` | `#F7F3EE` | Page background |
| `bark` | `#2C1810` | Primary text on light |
| `sand` | `#E4CDB8` | Borders, dividers |
| `stone` | `#9B8070` | Muted text on light |

**Universal:**

| Token | Hex | Usage |
|---|---|---|
| `clay` | `#C4683A` | All buttons, CTAs, active states |
| `sage` | `#7A9471` | Success, verification |

### Component Patterns
- **Primary button:** `bg-clay text-linen rounded-xl font-sans`
- **Dark background:** `bg-espresso`
- **Light background:** `bg-linen`
- **Cards on dark:** `bg-bark border border-white/10 rounded-xl`
- **Cards on light:** `bg-white border border-sand rounded-xl`
- **Section labels:** 11px, uppercase, letter-spacing, `text-stone` or `text-smoke`

### Tone
Inviting, warm, professional, direct. Not adversarial toward studios — collaborative. No "power shift" language. The student-studio-instructor relationship is collaborative. Instruktor is professional infrastructure, not a rebellion.

---

## User Roles

**Instructor** — pays subscription. Creates profile, syncs classes, publishes schedule, shares link.

**Student** — free. Views instructor page, clicks Book Spot, follows via email.

**Studio** — future. Discovers and hires instructors through Instruktor.

---

## Build Queue — In Priority Order

### ✅ Sessions 1–5 — COMPLETE
Colour system, studio management, mobile optimisation, email follow mechanic, click tracking. All working.

---

### Next A — Forgot Password + Reset Page

Add "Forgot password?" link below the sign-in form. On click: reveal email input and "Send reset link" button. On submit: call `supabase.auth.resetPasswordForEmail` with `redirectTo: 'https://instruktor.ca/reset-password'`. Show success: "Check your email — we've sent a reset link."

Create `/reset-password` page: reads Supabase token from URL, shows new password + confirm password inputs, calls `supabase.auth.updateUser` on submit, redirects to dashboard on success.

Style with brand tokens. Do not touch anything else.

---

### Next B — Typography Implementation

Install DM Sans and Cormorant Garamond from Google Fonts. Update `tailwind.config.js` with fontFamily as above. Apply Cormorant Garamond to: Instruktor wordmark in nav, instructor name on student profile header, H1 on landing page hero. Apply DM Sans everywhere else. Never use Cormorant Garamond below 20px.

---

### ✅ Next C — Recurring Class Creation — COMPLETE

---

### Session — Landing Page (instruktor.ca homepage)

Six sections using brand tokens throughout. Mobile responsive.

**1. Nav** — Instruktor wordmark (Cormorant Garamond, linen on espresso), Sign in link, "Create your page" clay button.

**2. Hero** — espresso background. Badge: "Beta · Vancouver, BC". H1 (Cormorant Garamond): "Become an Instruktor." Sub (DM Sans): "Your classes. Every studio. One link. The professional home for fitness instructors who teach at more than one studio." Primary CTA (clay button): "Create your page →". Small text: "Free during beta."

**3. How it works** — linen background. Three steps:
1. Add your studios — connect each studio's calendar and booking link once
2. Pull your schedule — all classes from all studios populate in one tap
3. Share your link — one URL for students to find every class you teach

**4. The professional case** — bark background. Headline: "Your career, professionally managed." Body: "Every photographer has a portfolio. Every professional has a LinkedIn. Instruktor is the professional home fitness instructors have always needed — a profile, a following, and a track record that travels with you."

**5. Coming soon** — linen background. Three items: Student reviews tied to you not the studio. Analytics for studio auditions. A verification badge you earn.

**6. Final CTA** — espresso background. "Ready to build your practice?" H2 (Cormorant Garamond): "Become an Instruktor." Clay button: "Create your page →". Small text: "Currently in beta · Vancouver, BC"

Footer: Instruktor wordmark, © 2025, Privacy, instruktor.ca

"Create your page" CTA links to existing signup flow. Instruktor wordmark in nav links to instruktor.ca. Do not touch dashboard or student profile pages.

---

### Session — Product Tour (Driver.js)

Install Driver.js. Trigger once after first login post-onboarding. Store `tour_completed` boolean on profiles table. Re-triggerable from Instructor Settings → "Watch product tour."

Six steps in order:
1. Instructor Settings tab — "Start here. Add your photo, bio, and first studio."
2. Add Studio section — "Add each studio once. The booking link auto-applies to every class."
3. Add & Drafts tab — "Pull your schedule here. Classes appear as drafts instantly."
4. Publish All button — "Review drafts and publish in one tap."
5. Live Schedule analytics cards — "Track your followers and Book Spot clicks here."
6. View Live Site link — "This is the link you share. Put it in your Instagram bio."

Style Driver.js overlay with brand tokens — espresso background, linen text, clay highlight/button. Skippable at any step.

---

### Session 6 — Post-Class Attendance Prompt

After a class date passes, prompt the instructor (in-app notification or email):
*"Your [Class Name] was today — how many students attended?"*

Simple number input. Store: class_id, instructor_id, reported_count, reported_at.

Show on dashboard: attendance per class, average fill rate over time.

---

### Session 7 — Onboarding Card Carousel

Shown once after signup, before dashboard. Cannot be skipped. Re-accessible from Settings → "Watch walkthrough again."

Six cards, dark throughout, clay final card, no skip button, progress dots, swipeable mobile:
1. "You became an Instruktor." — identity/welcome
2. "One link. Every class." — core value
3. "Your brand. Your page." — instruktor.ca/[username]
4. "Your students follow you." — portable following
5. "We're just getting started." — coming soon preview
6. "Let's build your profile." — CTA to profile setup

Track `onboarding_completed` boolean on profiles table.

---

### Session 8 — Viral Footer

Subtle footer on every student-facing page:
*"Build your own schedule page — Instruktor.ca"*

Small, unobtrusive, stone/smoke colour. Does not compete with instructor content.

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
  default_booking_url TEXT,
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
```

---

## Key Design Principles

**Instructor is the product.** Their name and brand lead every page.

**Mobile is the primary surface.** Design mobile first, always.

**Reduce every interaction to its minimum.** Weekly sync in under 60 seconds.

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
