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
  control: "8px"
  card: "12px"
  card-elevated: "16px"
  sheet: "24px"
  pill: "9999px"
  persuade: "2px"
spacing:
  card-padding: "24px"
  section-y-marketing: "96px"
  section-y-marketing-emphasis: "112px"
  section-y-app: "24px"
components:
  button-primary:
    backgroundColor: "{colors.clay}"
    textColor: "{colors.linen}"
    rounded: "{rounded.control}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.clay-dark}"
  button-primary-persuade:
    backgroundColor: "{colors.clay}"
    textColor: "{colors.linen}"
    rounded: "{rounded.persuade}"
    padding: "20px 44px"
  button-primary-persuade-hover:
    backgroundColor: "{colors.clay-dark}"
  button-secondary:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.bark}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  card:
    backgroundColor: "#FFFFFF"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  input:
    backgroundColor: "{colors.linen}"
    textColor: "{colors.bark}"
    rounded: "{rounded.control}"
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
- A binary radius language: controls are tight, surfaces are soft, circles are full
- A hard split between the serif (brand/identity, ≥20px) and the sans (everything else)

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
- **Display** (Cormorant Garamond, hero-scale, tight line-height): the Instruktor wordmark and landing-page hero H1s. Never below 20px. Weight 400 on Operate surfaces; the Persuade landing page uses weight 600 with +0.01em tracking for more architectural presence, an explicit, considered choice, not the typeface's default register.
- **Headline** (Cormorant Garamond 500): instructor name on the student-facing profile header, section headings that need brand weight.
- **Body** (DM Sans 400): all UI text, class names, dates, times, buttons, inputs, labels, dropdowns, dashboard content, analytics cards. The default for the entire app.
- **Label** (DM Mono, uppercase, letter-spacing 0.2em): a narrow, deliberately rare usage for tracked micro-labels, the onboarding step counter ("01 / 06"), its "Back" control.

### Named Rules
**The Twenty Pixel Floor Rule.** Cormorant Garamond never appears below 20px, and never on form inputs, buttons, or functional UI. This is a binding brand commitment, not just an observed convention.

## Layout

Containers are centered and width-capped by context: `max-w-3xl` for marketing text columns, `max-w-4xl` for the dashboard's nav wrapper and the student page's main column, `max-w-5xl` for full marketing sections, `max-w-md`/`max-w-lg`/`max-w-sm` for auth cards and modals. `sm` is the dominant responsive breakpoint for spacing, typography, and stack-to-row changes; `md`/`lg` are reserved for grid step-ups, most notably the dashboard's drafts layout (a custom three-track grid, `1fr auto 1fr`, that collapses to a single stacked column below `lg`).

The system's default list-row idiom is a stack-on-mobile, row-on-desktop flex pattern, repeated identically across dashboard class rows, the student page's class cards, and draft rows. Vertical rhythm differs by context: the landing page breathes at `py-24 sm:py-32` for standard sections and `py-28 sm:py-36` for its two highest-emphasis moments (the professional-case section and the final CTA), in-app working screens stay tighter at `py-6 sm:py-12`.

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

Operate surfaces (dashboard, in-app UI, auth) and the Persuade surface (the marketing landing page) intentionally use two different radius registers. See the Persuade/Operate split under Components > Buttons for why.

### Operate surfaces
- **`rounded-lg` (8px)**: controls, form inputs, in-app and secondary buttons, small badges.
- **`rounded-xl` (12px)**: standard cards and containers.
- **`rounded-2xl` (16px)**: a deliberate step up for a handful of elevated or public-facing surfaces (the public class directory cards, the unfollow confirmation card, the desktop variant of the booking sheet).
- **`rounded-t-3xl`**: the mobile booking bottom-sheet's top corners only, giving it a native iOS-style sheet silhouette.
- **`rounded-full`**: anything circular or pill-shaped, avatars, category and certification badges, the waitlist toggle's track and thumb, onboarding progress segments, the bottom-sheet drag handle.

**The Binary Radius Rule.** On Operate surfaces, controls get 8px, surfaces get 12px, stepping up to 16px or 24px only for deliberate emphasis, and circles get full. There is no in-between radius value on these surfaces.

### Persuade surface (landing page)
- **`2px` (near-sharp)**: every button, CTA, and badge on the landing page, both hero-style solid buttons and the nav's outline button. Deliberately sharper than the Operate register, editorial rather than app-like, chosen specifically to move away from the rounded-everything look that read as generic.

Don't mix registers within a surface: a screen is either Operate (8/12/16/24, full for circles) or Persuade (2px), never both.

## Components

Buttons, cards, and inputs are meant to feel warm and confident: solid clay fills, generous radius, a soft shadow that deepens on hover or press, never sharp, cold, or overly minimal.

### Buttons

Operate-surface buttons (dashboard, auth, in-app) and the Persuade-surface landing-page buttons are deliberately different systems. Don't cross-apply one to the other.

**Operate surfaces:**
- **Shape:** `rounded-lg` for in-app form submit and secondary buttons.
- **Primary:** solid Terracotta Clay fill, linen or white text, bold weight, generous padding (`py-3` to `py-4`). Hover steps to Deep Clay; press gives `active:scale-[0.98]` feedback.
- **Secondary / Outline:** white fill, `border-sand`, Warm Bark text, hover shifts background to Linen.
- **Ghost / Text-link:** no fill or border, clay or stone text, hover underlines or shifts toward bark/clay depending on the surface it sits on.
- **Destructive:** uses a plain red rather than a brand token (an accepted exception, not a token to extend).

**Persuade surface (landing page), implemented as `.ik-btn-primary` / `.ik-nav-link` in `globals.css`:**
- **Shape:** `2px` radius, uppercase label text tracked at `0.16em`, generous padding (`py-5 px-11` on primary CTAs).
- **Primary:** solid Terracotta Clay fill; on hover, Deep Clay sweeps in from the left over 500ms while the label's tracking widens to `0.22em`; press is a soft `scale(0.985)` + `brightness(0.95)` dim, not the Operate system's bounce. One primary (solid) CTA per screen, in the hero and the final CTA.
- **Secondary (nav CTA):** transparent fill, `border-linen/35`, hover brightens the border to full linen with a faint `linen/5` wash. Deliberately quieter than the primary so it doesn't compete with the one loud CTA already on screen, confirmed as the intended hierarchy, not an inconsistency to fix.
- **Nav link:** a hairline underline draws in from the left on hover over 450ms (`currentColor`, so it matches whatever the link's hover color is).
- **Motion is slower everywhere on this surface**: 400-500ms eased transitions versus the Operate system's near-instant color/scale changes. All new landing-page motion respects `prefers-reduced-motion`.

### Cards / Containers
- **Corner style:** `rounded-xl` by default, stepping to `rounded-2xl` for the elevated/public surfaces noted in Shapes.
- **Background:** white is the dominant light-surface card background. Linen with a `border-sand` is used for nested/secondary panels sitting inside a white card. Clay Wash with a `border-sand` marks the one deliberately accent-tinted panel (Sync Classes). Full-bleed espresso/bark blocks (no border, no shadow) carry marketing sections.
- **Shadow strategy:** `shadow-sm` at rest, `shadow-md` on hover, see Elevation & Depth.
- **Border:** `border-sand` on almost every light-surface card; `white/10-20%` hairlines on dark surfaces.
- **Internal padding:** `p-5` to `p-6` standard, `p-8` to `p-10` for marketing and CTA cards.

### Inputs / Fields
- **Style:** `border-sand`, `rounded-lg`, `bg-linen` (public-facing forms use `bg-white` instead).
- **Focus:** `focus:border-clay` is the dominant pattern; auth pages use `focus:ring-2 focus:ring-clay` instead. One deliberately de-emphasized case (the unfollow email field) uses `focus:border-stone`.
- **Locked / read-only** (studio-synced fields): `bg-sand/40`, `text-stone`, `cursor-not-allowed`.
- **Error:** surfaced as a banner above the form (red background, red border, red text), not an inline red ring on the field itself.
- **Category select:** a native, optgroup-grouped dropdown sharing the same border/radius/focus language as text inputs, with an "Other" option that reveals a short free-text field.

### Navigation
- **Dashboard nav:** white background, sticky, `border-b border-sand` paired with `shadow-sm`, the one place in the Operate system a nav uses both border and shadow together. Wordmark set in the serif.
- **Landing nav:** dark (espresso background, linen text), sticky, a single `border-linen/10` hairline instead of a shadow. Wordmark set at weight 600 with `0.14em` tracking, heavier than the Operate wordmark treatment. Nav links are uppercase and tracked (`0.14em`) with the underline-draw hover from the Buttons section above; the nav's own CTA uses the quieter outline treatment, never the solid primary fill.
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
- **Do** pair `rounded-lg` with controls and `rounded-xl` with cards and marketing CTAs; reserve `2xl`/`3xl` for a deliberately elevated or sheet-style surface (The Binary Radius Rule).

### Don't:
- **Don't** introduce a new accent color. Clay is the system's only actionable color; sage is reserved for success and positive states only.
- **Don't** apply a shadow to an espresso or bark surface. Use a `white/10-20%` hairline border instead.
- **Don't** use "Auto-saves on blur" or similar text anywhere in the product. Every auto-saving field shows the fading sage checkmark instead.
- **Don't** mix the two button-radius conventions on one screen. A screen is either marketing (`rounded-xl`) or in-app (`rounded-lg`), consistently.
