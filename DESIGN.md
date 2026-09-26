---
name: Instruktor
description: Professional scheduling and personal brand platform for boutique fitness instructors
colors:
  espresso: "#1A0E07"
  bark: "#2C1810"
  linen: "#F7F3EE"
  sand: "#E4CDB8"
  stone: "#9B8070"
  smoke: "#BFA090"
  clay: "#B85A35"
  clay-light: "#F2E6DF"
  clay-dark: "#7A3520"
  sage: "#7A9471"
  sage-light: "#EAF0E6"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontWeight: 400
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontWeight: 500
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "DM Mono, ui-monospace, SFMono-Regular, monospace"
    fontWeight: 400
    letterSpacing: "0.2em"
rounded:
  sharp: "2px"
  pill: "9999px"
  legacy-control: "8px"
  legacy-card: "12px"
  legacy-card-elevated: "16px"
  legacy-sheet: "24px"
spacing:
  card-padding: "24px"
  section-y-marketing: "96px"
  section-y-marketing-emphasis: "112px"
  section-y-app: "24px"
components:
  button-primary:
    backgroundColor: "{colors.clay}"
    textColor: "{colors.linen}"
    rounded: "{rounded.sharp}"
    padding: "20px 44px"
  button-primary-hover:
    backgroundColor: "{colors.clay-dark}"
  button-secondary:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.bark}"
    rounded: "{rounded.sharp}"
    padding: "8px 16px"
  card:
    backgroundColor: "#FFFFFF"
    rounded: "{rounded.sharp}"
    padding: "{spacing.card-padding}"
  input:
    backgroundColor: "{colors.linen}"
    textColor: "{colors.bark}"
    rounded: "{rounded.sharp}"
    padding: "8px 16px"
---

# Design System: Instruktor

## Overview

**Creative North Star: "The Instructor's Portfolio"**

Instruktor reads like a portable professional portfolio, not a SaaS dashboard. An editorial serif (Cormorant Garamond) is reserved for identity moments, the instructor's name, the wordmark, a hero headline, never smaller than 20px and never on anything functional. Everything an instructor actually works in day to day, forms, buttons, class lists, is carried by DM Sans: clean, confident, and out of the way. The palette is warm and earthy (espresso, clay, linen) rather than the cool grey-and-blue of a generic scheduling tool, because the product's whole premise is that the instructor's brand, not a studio's, leads every page.

The system is deliberately warm over clinical. It is a community platform an instructor is proud to share, not a piece of software they tolerate. Surfaces stay flat and bordered rather than glossy or heavily shadowed; where elevation does appear, it is soft and earns its place through interaction rather than sitting there by default. Nothing in the system should read as corporate, cold, or adversarial toward the studios instructors also work with.

**Key Characteristics:**
- A warm, earthy neutral base (espresso, bark, linen, sand, stone, smoke) standing in for grayscale
- One reserved accent color (clay) for every actionable element; nothing else competes for that attention
- Flat-with-borders elevation on light surfaces, completely flat color-blocking on dark surfaces
- A near-sharp `2px` radius everywhere except genuine circles (avatars, toggles, pill-shaped count badges) and the mobile bottom-sheet's native top corners
- Wide letter-spacing (`0.14em`–`0.22em`) on every label, nav link, and short button, a deliberate move away from the rounded-pill, default-tracking look that read as generic
- A hard split between the serif (brand/identity, ≥20px, weight 600 with a touch of positive tracking) and the sans (everything else)

## Colors

The palette is warm and earthy rather than cool or neutral-grey, built from a single terracotta accent against a spectrum of espresso-to-linen neutrals.

### Primary
- **Terracotta Clay** (`#B85A35`): the system's only actionable color. Every primary button, CTA, active tab state, and default input focus ring uses it. Hover and active states step to Deep Clay (`#7A3520`); light surface fills (badges, panel tints) use Clay Wash (`#F2E6DF`).

### Secondary
- **Studio Sage** (`#7A9471`) / **Sage Wash** (`#EAF0E6`): reserved exclusively for success and positive-verification states, the follow-confirmation banner, the fading auto-save checkmark, the "drop-in welcome" badge. Never used as a second brand accent or decoration.

### Neutral
- **Espresso Grounds** (`#1A0E07`): the darkest surface. Hero sections, the onboarding takeover, the student profile's bio header.
- **Warm Bark** (`#2C1810`): the secondary dark surface (landing's "professional case" section), and doubles as the primary text color on every light surface.
- **Linen** (`#F7F3EE`): the default light background across the dashboard and most in-app screens.
- **Sand** (`#E4CDB8`): the near-universal border and divider color on light surfaces, cards, inputs, dividers, tab underlines.
- **Stone** (`#9B8070`): muted/secondary text on light surfaces (labels, meta text, timestamps).
- **Smoke** (`#BFA090`): muted text specifically on dark (espresso/bark) surfaces.

### Named Rules
**The Rare Accent Rule.** Clay is the only actionable color in the system. It appears on buttons, links, active states, and focus rings, never as pure decoration. Sage is reserved exclusively for success and positive-verification states; it is never used as a second brand accent.

## Typography

**Display Font:** Cormorant Garamond (with Georgia fallback)
**Body Font:** DM Sans (with system-ui fallback)
**Label/Mono Font:** DM Mono (with ui-monospace fallback)

**Character:** An editorial serif voice for identity moments, set against a clean, confident, entirely functional sans for everything an instructor actually works in. The two never mix on the same element.

### Hierarchy
- **Display** (Cormorant Garamond, hero-scale, tight line-height): the Instruktor wordmark (nav and footer), landing-page hero H1s, and the auth-page headings ("Instructor Workspace," "Instructor Sign Up," etc). Never below 20px. Weight 600 with `0.008em`–`0.01em` positive tracking, more architectural presence than the typeface's default register, an explicit, considered choice.
- **Headline** (Cormorant Garamond 500–600): instructor name on the student-facing profile header, section headings that need brand weight.
- **Body** (DM Sans 400): all UI text, class names, dates, times, buttons, inputs, dropdowns, dashboard content, analytics cards. The default for the entire app.
- **Label** (DM Sans or DM Mono, uppercase, letter-spacing `0.14em`–`0.22em`): form field labels, nav links, eyebrow labels, section headers ("How It Works," "Upcoming Classes"), and short button text. Widely used now, not rare, this tracked-uppercase treatment is one of the system's core identifying moves. DM Mono specifically stays reserved for a handful of genuinely rare micro-labels (the onboarding step counter "01 / 06", its "Back" control, small caption timestamps).

### Named Rules
**The Twenty Pixel Floor Rule.** Cormorant Garamond never appears below 20px, and never on form inputs, buttons, or functional UI. This is a binding brand commitment, not just an observed convention.

## Layout

Containers are centered and width-capped by context, widened across the board so pages hold their own on large desktop monitors instead of reading as narrow and centered: `max-w-7xl` for the landing nav, the dashboard nav, and the dashboard's own outer column (all were `max-w-5xl`); `max-w-3xl`/`max-w-4xl` for centered text blocks (landing hero, professional case, final CTA); `max-w-4xl` for the student page's main column; `max-w-md`/`max-w-lg`/`max-w-sm` for auth cards and modals, which stay narrow deliberately, a login form shouldn't stretch just because the monitor is wide. `sm` is the dominant responsive breakpoint for spacing, typography, and stack-to-row changes; `md`/`lg` are reserved for grid step-ups, most notably the dashboard's drafts layout (a custom three-track grid, `1fr auto 1fr`, that collapses to a single stacked column below `lg`).

The system's default list-row idiom is a stack-on-mobile, row-on-desktop flex pattern, repeated identically across dashboard class rows, the student page's class cards, and draft rows. Vertical rhythm differs by context: the landing page breathes at `py-24 sm:py-32` for standard sections and `py-28 sm:py-36` for its two highest-emphasis moments (the professional-case section and the final CTA), in-app working screens stay tighter at `py-6 sm:py-12`.

**Not yet migrated to this pass:** the `/classes` discovery page and the standalone `/unfollow` page (distinct from the unfollow widget embedded in the student profile page, which is migrated) still use the pre-redesign rounded-xl/rounded-lg system. Bring them in line if they're ever confirmed as in-scope surfaces; `/classes` in particular is still flagged in CLAUDE.md as unconfirmed MVP scope.

## Elevation & Depth

A hybrid system. Light surfaces pair a `border-sand` with a soft `shadow-sm` at rest, and step up to `shadow-md` only on hover or interaction, border and shadow always appear together, never shadow alone. Dark surfaces (espresso, bark) are completely flat: separation there comes from color blocking and `white/10-20%` hairline borders only, never a shadow.

### Shadow Vocabulary
- **Resting** (`box-shadow: shadow-sm` equivalent): the default state for nearly every light-surface card, list row, and primary button.
- **Hover** (`shadow-md`): the one explicit elevation transition, layered on top of resting shadow when a card or row is interacted with.
- **Modal** (`shadow-xl`): confirmation dialogs and the studio-add modal, a step up to signal overlay priority.
- **Overlay** (`shadow-2xl`): reserved for the single most prominent surface, the mobile booking bottom-sheet.
- **Accent glow** (`0 12px 34px -10px rgba(184,90,53,0.6)`): a bespoke clay-tinted shadow under the onboarding flow's final CTA, the system's one non-neutral shadow, used once, deliberately, for a single high-stakes moment.

### Named Rules
**The Flat-Dark Rule.** Shadows never appear on espresso or bark surfaces. Depth there comes from color layering and hairline borders only.

## Shapes

One near-sharp radius, used everywhere: buttons, cards, inputs, modals, badges, and containers across the landing page, auth pages, student page, and dashboard all use `2px`. This replaced an earlier system where marketing used `rounded-xl`/`rounded-lg` and in-app UI used its own similar scale; both read as generic rounded-everything, and sharpening the corners was one of the two or three biggest levers in fixing that. `/classes` and the standalone `/unfollow` page still carry the old radii, see Layout's migration note.

- **`2px` (near-sharp)**: the universal default for every button, card, input, modal, and rectangular badge.
- **`rounded-full`**: reserved strictly for genuine circles and pills, avatars, the waitlist toggle's track and thumb, count badges, onboarding progress segments, the bottom-sheet drag handle. Certification and category tags that used to be pill-shaped are now `2px` rectangles instead, this was a deliberate part of the fix, not an oversight.
- **`rounded-t-3xl`**: kept, exactly once, on the mobile booking bottom-sheet's top corners. This is a platform convention (the native iOS/Android sheet silhouette signaling "swipeable"), not decorative rounding, and is the one intentional exception to the 2px rule.

**The Sharp Corner Rule.** Everything is `2px` except a true circle/pill or the one platform-convention exception above. If you're reaching for `rounded-md`/`rounded-lg`/`rounded-xl`/`rounded-2xl`, stop, that's the old system.

## Components

Buttons, cards, and inputs are meant to feel warm and confident: solid clay fills, generous radius, a soft shadow that deepens on hover or press, never sharp, cold, or overly minimal.

### Buttons

Implemented as `.ik-btn-primary`, `.ik-btn-primary-compact`, and `.ik-nav-link` in `globals.css`, used everywhere: landing page, auth pages, student page, dashboard.

- **Shape:** `2px` radius everywhere, no exceptions.
- **Primary, short fixed labels** (`.ik-btn-primary`, e.g. "Create Your Page," "Sign In," "Follow"): solid Terracotta Clay fill, uppercase text tracked at `0.16em`. On hover, Deep Clay sweeps in from the left over 500ms while the label's tracking widens to `0.22em`; press is a soft `scale(0.985)` + `brightness(0.95)` dim, never a bounce. Used for the one loud CTA per screen (landing hero, final CTA, every auth-page submit, the follow widget).
- **Primary, long or dynamic labels** (`.ik-btn-primary-compact`, e.g. "Publish This Week's Schedule (5)," "Save Profile," "Publish Draft Live"): the same solid fill and sweep-fill hover and press-dim, but without the letter-spacing widen, a tracking jump on a long dynamic-count label reads as a glitch and risks wrapping. This is the dashboard's default primary-action treatment.
- **Repeated per-row actions** (e.g. the student page's "Book Spot"/"Join Waitlist" on every class card, dashboard Edit/Delete): sharp `2px` corners and the brand colors, but plain `hover:bg-*`/`active:scale` feedback, not the sweep. A list of many identical animated buttons reads as noise, not craft; this is a deliberate exception, not an inconsistency.
- **Secondary / Outline** (e.g. the nav's own CTA, modal Cancel buttons): white or transparent fill, `border-sand` (light surfaces) or `border-linen/35` (dark surfaces), text in Bark or Linen, hover shifts background toward Linen or a faint `linen/5` wash. Always quieter than whatever primary CTA is also on screen, on the landing/dashboard navs specifically this is confirmed as the intended hierarchy: one loud CTA per screen, the nav's is deliberately the quiet echo.
- **Ghost / Text-link:** no fill or border, clay or stone text, hover underlines or shifts toward bark/clay depending on the surface.
- **Destructive:** uses a plain red rather than a brand token (an accepted exception, not a token to extend).
- **Nav / tracked links** (`.ik-nav-link`): a hairline underline draws in from the left on hover over 450ms (`currentColor`, so it matches whatever the link's hover color is). Used for every primary nav link (landing nav, dashboard nav).
- **Motion is slower everywhere now**: 400–500ms eased transitions have replaced the old near-instant color/scale changes across the whole app, not just the landing page. All of it respects `prefers-reduced-motion`.

### Cards / Containers
- **Corner style:** `2px`, universally (see Shapes).
- **Background:** white is the dominant light-surface card background. Linen with a `border-sand` is used for nested/secondary panels sitting inside a white card. Clay Wash with a `border-sand` marks the one deliberately accent-tinted panel (Sync Classes). Full-bleed espresso/bark blocks (no border, no shadow) carry marketing sections.
- **Shadow strategy:** `shadow-sm` at rest, `shadow-md` on hover, see Elevation & Depth.
- **Border:** `border-sand` on almost every light-surface card; `white/10-20%` hairlines on dark surfaces.
- **Internal padding:** `p-5` to `p-6` standard, `p-8` to `p-10` for marketing and CTA cards.

### Inputs / Fields
- **Style:** `border-sand`, `2px` radius, `bg-linen` (public-facing forms use `bg-white` instead).
- **Focus:** `focus:border-clay` paired with a `focus:ring-2 focus:ring-clay/40` visible ring is now the dashboard/student-page default; auth pages use `focus:ring-2 focus:ring-clay` at full opacity instead. One deliberately de-emphasized case (the unfollow email field) uses `focus:border-stone`.
- **Locked / read-only** (studio-synced fields): `bg-sand/40`, `text-stone`, `cursor-not-allowed`.
- **Labels:** uppercase, tracked (`0.14em`), stone-colored micro-labels on auth pages and the student page's follow form, matching the nav/eyebrow label language. Dashboard form labels stay sentence-case (`text-sm font-medium`), a working tool's dense forms read faster with normal-case labels than an all-caps sweep down the page; this is a considered exception, not a gap.
- **Error:** surfaced as a banner above the form (red background, red border, red text), not an inline red ring on the field itself.
- **Category select:** a native, optgroup-grouped dropdown sharing the same border/radius/focus language as text inputs, with an "Other" option that reveals a short free-text field.

### Navigation
- **Dashboard nav:** white background, sticky, `border-b border-sand` only now (the shadow was dropped to match the landing nav's cleaner hairline-only separation). Wordmark set in the serif at weight 600 with `0.14em` tracking. Nav links are uppercase, tracked (`0.14em`), and use the underline-draw hover.
- **Landing nav:** dark (espresso background, linen text), sticky, a single `border-linen/10` hairline. Same wordmark and nav-link treatment as the dashboard nav now; the nav's own CTA uses the quieter outline treatment, never the solid primary fill.
- **Dashboard tab bar:** a `border-b border-sand` track; the active tab carries `border-b-2 border-clay` and clay text, inactive tabs are stone, hovering to bark.

### Signature Components
- **Onboarding card carousel:** a full-screen espresso takeover with a segmented clay progress bar and a radial clay glow that warms up on the final card; each card crossfades in on mount.
- **Auto-save confirmation:** a small sage "✓ Saved" mark that fades out 1.5 seconds after a field saves. This is the product's only save-confirmation idiom; no field anywhere should say "Auto-saves on blur."
- **Collapsible studio cards:** a two-level accordion, the studio row expands to reveal its fields, and a nested schedule-summary row expands independently within it.
- **Stat tiles:** a large bold number over a small uppercase, letter-spaced label, the system's one analytics-card convention, reused for every follower/click metric.

## Do's and Don'ts

### Do:
- **Do** reserve solid Terracotta Clay fill for primary actions only (The Rare Accent Rule).
- **Do** keep Cormorant Garamond at 20px and above, never on form inputs, buttons, or functional UI (The Twenty Pixel Floor Rule).
- **Do** use `border-sand` plus `shadow-sm` as the default resting state for light-surface cards, elevating to `shadow-md` only on hover.
- **Do** keep espresso and bark surfaces completely flat, color blocking and hairline borders only, never a shadow (The Flat-Dark Rule).
- **Do** use `2px` radius everywhere except genuine circles/pills and the mobile bottom-sheet's top corners (The Sharp Corner Rule).
- **Do** widen letter-spacing (`0.14em`–`0.22em`) on labels, nav links, and short buttons; it's the single biggest device separating this system from a generic default.

### Don't:
- **Don't** introduce a new accent color. Clay is the system's only actionable color; sage is reserved for success and positive states only.
- **Don't** apply a shadow to an espresso or bark surface. Use a `white/10-20%` hairline border instead.
- **Don't** use "Auto-saves on blur" or similar text anywhere in the product. Every auto-saving field shows the fading sage checkmark instead.
- **Don't** reach for `rounded-md`/`lg`/`xl`/`2xl` on any new UI; that's the pre-redesign system. `/classes` and standalone `/unfollow` still carry it as a known, tracked gap, not a pattern to extend.
- **Don't** wrap a repeated per-row button (a list of Edit/Delete/Book Spot actions) in the full letter-spacing-widening hover; reserve that for the one primary CTA per screen.
