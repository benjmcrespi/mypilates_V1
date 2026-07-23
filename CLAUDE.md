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
- Draft class system with individual edit and per-row delete
- Recurring class creation, weekly and bi-weekly, generates independent drafts with series_id
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

**Terminology sweep complete:** My Classes, Sync Classes, Add a New Class, Booking Note (optional), Default Booking Link all confirmed in the dashboard.

### Not built
- Post-class attendance prompt, no UI and no attendance_reports queries anywhere
- Multi-select delete on drafts. Selection exists but drives "Publish Selected", not bulk delete. Session A adds Delete All Drafts, which is different from multi-select delete. Decide whether multi-select delete is still wanted.

### Needs review
- **/classes discovery page** exists with category filtering. This was never specified in any session and is not part of the MVP plan. Determine whether it is intentional, a leftover from mypilates.ca, or speculative work. Either document it or remove it.

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

### ✅ Next A — Forgot Password + Reset Page — COMPLETE

Add "Forgot password?" link below the sign-in form. On click: reveal email input and "Send reset link" button. On submit: call `supabase.auth.resetPasswordForEmail` with `redirectTo: 'https://instruktor.ca/reset-password'`. Show success: "Check your email — we've sent a reset link."

Create `/reset-password` page: reads Supabase token from URL, shows new password + confirm password inputs, calls `supabase.auth.updateUser` on submit, redirects to dashboard on success.

Style with brand tokens. Do not touch anything else.

---

### ✅ Next B — Typography Implementation — COMPLETE

Install DM Sans and Cormorant Garamond from Google Fonts. Update `tailwind.config.js` with fontFamily as above. Apply Cormorant Garamond to: Instruktor wordmark in nav, instructor name on student profile header, H1 on landing page hero. Apply DM Sans everywhere else. Never use Cormorant Garamond below 20px.

---

### ✅ Next C — Recurring Class Creation — COMPLETE

---

### ✅ Next — Class Category System — COMPLETE

**The problem:** Free-text categories create 1000s of variations ("Hot Yoga", "hot yoga", "hot yoga class") that break search and discovery when the student discovery feature is built.

**The solution:** Instruktor owns the canonical category taxonomy. Instructors choose from a maintained list — they do not create categories. An "Other" option captures edge cases for monitoring.

**Schema — seed this data on migration:**

```sql
CREATE TABLE IF NOT EXISTS class_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  group_name TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

-- Seed canonical categories
INSERT INTO class_categories (name, slug, group_name, sort_order) VALUES
  ('Reformer Pilates',     'reformer-pilates',     'Pilates',       1),
  ('Mat Pilates',          'mat-pilates',           'Pilates',       2),
  ('Clinical Pilates',     'clinical-pilates',      'Pilates',       3),
  ('Pilates Cardio',       'pilates-cardio',        'Pilates',       4),
  ('Hot Yoga',             'hot-yoga',              'Yoga',          5),
  ('Inferno Hot Pilates',  'inferno-hot-pilates',   'Yoga',          6),
  ('Vinyasa',              'vinyasa',               'Yoga',          7),
  ('Yin Yoga',             'yin-yoga',              'Yoga',          8),
  ('Restorative Yoga',     'restorative-yoga',      'Yoga',          9),
  ('Power Yoga',           'power-yoga',            'Yoga',          10),
  ('Hatha Yoga',           'hatha-yoga',            'Yoga',          11),
  ('Barre',                'barre',                 'Barre',         12),
  ('Ballet Barre',         'ballet-barre',          'Barre',         13),
  ('Cardio Barre',         'cardio-barre',          'Barre',         14),
  ('HIIT',                 'hiit',                  'Strength',      15),
  ('Bootcamp',             'bootcamp',              'Strength',      16),
  ('Strength Training',    'strength-training',     'Strength',      17),
  ('Circuit Training',     'circuit-training',      'Strength',      18),
  ('Spin / Indoor Cycling','spin',                  'Cardio',        19),
  ('Dance Cardio',         'dance-cardio',          'Cardio',        20),
  ('Meditation',           'meditation',            'Mind & Body',   21),
  ('Breathwork',           'breathwork',            'Mind & Body',   22),
  ('Stretch & Flexibility','stretch',               'Mind & Body',   23),
  ('Dance',                'dance',                 'Dance',         24),
  ('Hip Hop Dance',        'hip-hop-dance',         'Dance',         25),
  ('Aerial Fitness',       'aerial-fitness',        'Other',         26),
  ('Boxing / Kickboxing',  'boxing',                'Other',         27),
  ('TRX',                  'trx',                   'Other',         28)
ON CONFLICT (slug) DO NOTHING;
```

**Implementation:**
- Replace all hardcoded category dropdowns with a query from `class_categories` where `active = true`, ordered by `sort_order`
- Group them by `group_name` in the dropdown (optgroup-style: Pilates, Yoga, Barre, etc.)
- Add an "Other" option at the bottom that reveals a short text input for description — stored as metadata only, not as a new category
- Apply to: class draft edit form, studio default class type, manual class creation form
- The class record stores the `class_categories.id` as a foreign key, not the name as a string

---

### ✅ Session — PWA (Progressive Web App) — COMPLETE

Makes instruktor.ca installable on iOS and Android home screens. Looks and behaves like a native app — no browser chrome, standalone display, branded splash screen. Users tap "Add to Home Screen" and it sits on their device with the Instruktor logo.

**Install next-pwa:**
```
npm install next-pwa
```

**manifest.json** (in /public):
```json
{
  "name": "Instruktor",
  "short_name": "Instruktor",
  "description": "Your classes. Every studio. One link.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1A0E07",
  "theme_color": "#1A0E07",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**iOS meta tags** (in _document or layout head):
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Instruktor" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

**Icons needed** — generate from the instruktor_logo.svg:
- /public/icons/icon-192.png (192×192)
- /public/icons/icon-512.png (512×512)
- /public/favicon.ico

Use the clay rotated k mark on bark background — same asset as the LinkedIn logo.

**next.config.js** — wrap with next-pwa:
```javascript
const withPWA = require('next-pwa')({ dest: 'public', disable: process.env.NODE_ENV === 'development' })
module.exports = withPWA({ /* existing config */ })
```

Disable in development (disable: process.env.NODE_ENV === 'development') to avoid service worker conflicts during builds.

Test by opening instruktor.ca on a real phone and confirming "Add to Home Screen" prompt appears and the installed app opens without browser chrome.

---
### Session A — Delete All Drafts + Collapsed Studio Cards

**Delete All Drafts:** Add a "Delete All Drafts" button to My Classes, styled as a subtle text link, not a primary button, positioned away from the publish buttons so it cannot be misclicked. On click show a confirmation modal: "Delete all [N] drafts? This cannot be undone." with Cancel and Delete All buttons, where N is the actual draft count. Only deletes drafts, never published classes.

**Collapsed studio cards:** In Instructor Settings, collapse each studio in My Saved Studios and Calendars into a single row showing the studio name and a chevron. Clicking the row expands to reveal the existing four fields. All studios start collapsed. Multiple studios can be open at once, expanding one does not collapse others. Keep all existing field behaviour and auto-save unchanged.

---

### Session B — Series Editing and Deletion

Applies to manually created recurring classes (classes with a series_id).

**Editing:** When editing a class with a series_id, show a modal before saving: "Edit this class only" or "Edit this and all future classes in the series". "All future" means this class and every later class in the series, both drafts and published. Never modify classes whose date has already passed.

**Day of week changes:** Series edits must support changing the day of week, not just the time. If the day of week changes, recalculate the date of every affected class to the new weekday within its own week. Do not shift any class into a different week. Verify the resulting dates match the new weekday before saving. This is the highest-risk part of this session.

**Published class confirmation:** If any affected classes are published, confirm before applying: "This will update [N] classes. [M] are live on your page and will change immediately for students."

**No follower emails on edits:** Series edits must not trigger follower notification emails. Followers are only notified about newly published classes, never about edits to existing ones.

**Deleting:** Same modal pattern: "Delete this class only" or "Delete this and all future classes in the series". Same rules, never touch past classes, confirm if published classes are affected, no follower emails.

**ICS field locking:** For classes synced from an iCal feed, lock the class name, date, and time fields as read-only and greyed out. Booking Link, Booking Note, and Category remain fully editable. Under the locked fields show: "Synced from your studio calendar. Contact your studio to change class times." Do not block editing of the whole class, the instructor must still be able to add booking details before publishing.

---

### Session C — Studio Schedule Summary (run after Session A)

In the collapsed studio row, below the studio name, show a light-weight summary line in stone colour listing the recurring days and times for that studio, derived from the series records belonging to it. Format: "Wednesdays 7:00pm, Thursdays 4:00pm". Group by weekday and time, sorted by day of week.

If the studio has an iCal link saved, also show: "Schedule linked to studio booking". If a studio has both manual series and an iCal link, show both lines.

The summary line is itself expandable. Expanding it reveals a breakdown listing each series with its class name, day, time, and cadence, for example "Reformer Elevate, Wednesdays 7:00pm, weekly". This nested expansion is independent of the studio card expansion and does not open or close the studio's field panel.

If a studio has no recurring series and no iCal link, show nothing, no empty state text.

**Known limitation:** because the summary reads from series records, one-off manually created classes will not appear. Acceptable for now, revisit if instructors report missing classes.

---

### ✅ Session 1 — Terminology Sweep — COMPLETE
All label and copy changes across the entire product in one pass:
- Rename "Add & Drafts" tab to "My Classes" everywhere
- Rename "Publish a New Class" to "Add a New Class"
- Rename "Sync Drafts" to "Sync Classes"
- Rename "Booking Context (shown to students)" to "Booking Note (optional)"
- Rename "Default Booking URL" to "Default Booking Link" on all studio forms and settings
- Remove all instances of "Auto-saves on blur" from the UI
- Reference the canonical terminology table in CLAUDE.md and apply it across every screen

---

### ✅ Session 2 — Green Checkmark + Publish by Week — COMPLETE
Two interaction-level changes:

**Green checkmark auto-save confirmation:** Replace all "Auto-saves on blur" patterns with a vanishing sage green checkmark that appears for 1.5 seconds after a field saves, then fades. Apply to all auto-saving fields across the dashboard.

**Publish by week:** Replace the "Publish All" button with two buttons:
- Primary (clay): "Publish This Week's Schedule" — publishes all drafts whose class date falls within the current Monday to Sunday calendar week
- Secondary (smaller, outlined): "Publish Next Week's Schedule" — publishes all drafts whose class date falls within next Monday to Sunday

If no drafts exist for that week, the relevant button is greyed out with "Nothing to publish this week" or "Nothing to publish next week." Keep a tertiary small text link "Publish all drafts" for power users who need it.

---

### ✅ Session 3 — Product Tour Overhaul — COMPLETE
Seven steps as defined in the Product Tour section of this document. Critical requirement: the tour must programmatically click the correct tab before highlighting any element. Use Driver.js's onHighlightStarted callback to navigate to the correct tab, wait for the DOM to update, then highlight the element. Scroll to top before driver.drive() is called. Test on mobile.

---

### ✅ Session — Landing Page (instruktor.ca homepage) — COMPLETE

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

### ✅ Session — Product Tour (Driver.js) — COMPLETE

Install Driver.js. Trigger once after first login post-onboarding. Store `tour_completed` boolean on profiles table. Re-triggerable from Instructor Settings → "Watch product tour."

Seven steps in order. The tour must navigate to the correct tab before highlighting each element — do not highlight elements on a tab the user is not currently viewing.

1. Instructor Settings → Your Profile — "This is where you upload your photo, add your bio and certifications. This is what your students will see."
2. Instructor Settings → My Saved Studios section — "Add each studio you teach at. Once added, include the booking link and calendar link to sync all your classes."
3. My Classes tab — navigate to this tab before highlighting. "Manage your class schedule here."
4. My Classes → Add a New Class button — "Create classes one at a time."
5. My Classes → Sync Classes button — "Add classes from your calendar link. Press this button to auto-populate your classes from all your studios."
6. Live Schedule → Analytics cards — "Track your followers and clicks on your classes. Your data is tracked from day one so nothing is ever lost."
7. Instructor Settings → Your Page field — "This is the link to your Instruktor schedule. Copy it and share it across all platforms."

Style Driver.js overlay with brand tokens — espresso background, linen text, clay highlight/button. Skippable at any step. Re-triggerable from Instructor Settings.

---

### Session 6 — Post-Class Attendance Prompt

After a class date passes, prompt the instructor (in-app notification or email):
*"Your [Class Name] was today — how many students attended?"*

Simple number input. Store: class_id, instructor_id, reported_count, reported_at.

Show on dashboard: attendance per class, average fill rate over time.

---

### ✅ Session 7 — Onboarding Card Carousel — COMPLETE

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

### ✅ Session 8 — Viral Footer — COMPLETE

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
