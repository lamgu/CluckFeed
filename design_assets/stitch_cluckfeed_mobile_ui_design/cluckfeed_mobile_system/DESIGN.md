---
name: CluckFeed Mobile System
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#3d4a3d'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7b6c'
  outline-variant: '#bccbb9'
  surface-tint: '#006e2f'
  primary: '#006e2f'
  on-primary: '#ffffff'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#4ae176'
  secondary: '#006e2d'
  on-secondary: '#ffffff'
  secondary-container: '#7cf994'
  on-secondary-container: '#007230'
  tertiary: '#855300'
  on-tertiary: '#ffffff'
  tertiary-container: '#ef9900'
  on-tertiary-container: '#5c3800'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#7ffc97'
  secondary-fixed-dim: '#62df7d'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005320'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  title-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 12px
  metric-display:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 26px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

The design system is engineered for Indonesian small-to-medium poultry farmers (peternak ayam broiler dan petelur). It blends utilitarian clarity with the warm, approachable efficiency pioneered by leading Indonesian consumer super-apps like Gojek and GoPay. The visual voice communicates agricultural prosperity, biological vitality, and effortless technological empowerment.

Key attributes:
- **Terpercaya & Praktis (Trustworthy & Practical):** Interfaces must withstand high glare in open-sided poultry coops (kandang). Typography is immediate, contrast is calibrated for outdoor use, and data density respects quick glances.
- **Ramah & Modern (Friendly & Modern):** Eliminates the intimidation of nutritional math (protein kasar, energi metabolisme, kalsium) through generous radii, friendly iconography, and positive visual reinforcement.
- **Style Archetype:** Clean, icon-driven tactile modernism with pill-shaped interactions, pastel-tinted status containers, and strict visual rhythm tailored for thumb-driven one-handed Android mobile navigation.

## Colors

The palette leverages an agrarian fresh spectrum paired with functional functional-safety feedback colors:

- **Primary Green (`#22C55E`):** Represents crop vitality, balanced feed formulation, and affirmative actions (simpan, racik pakan, hitung).
- **Dark/Pressed Green (`#16A34A`):** Designated state color for pressed/hover feedback and high-contrast icon accents.
- **Light Tint Green (`#E8F8EE`):** Ground color for icon containers, success tags, and selected nutritional pills.
- **Neutral Canvas (`#FFFFFF`) & Surface Tint (`#F5F7F6`):** Pure white serves as card real estate, framed by `#F5F7F6` to give separation across modules without heavy dividing lines.
- **Text & Borders:** High-legibility Charcoal (`#1F2937`) for critical metric titles, muted Neutral (`#6B7280`) for helper labels and unit measures (kg, %, kkal/kg), and crisp hairline border (`#E5E7EB`).
- **Functional Semantics:** Soft Warning Orange (`#F59E0B` with `#FEF3C7` background) for nutrient shortfalls; Soft Alert Red (`#EF4444` with `#FEE2E2` background) for toxicity thresholds, expired premix batches, or imbalance alerts.

## Typography

The type system prioritizes instantaneous comprehension and absolute numeric legibility. Built on `Inter`, it activates OpenType tabular figures (`tnum`) across all nutritional breakdowns, weights, and cost metrics so decimal figures align vertically in formulation sheets.

Headlines use firm weights (`600` and `700`) to anchor scanning paths. Body text uses neutral weights (`400`) strictly restricted to concise Indonesian phrasing (e.g., "Kebutuhan Protein Tercapai", "Tambah Jagung Giling"). Sub-labels and metadata use compact uppercase or sentence case with tightened line heights to keep operational cards compact above the Android fold.

## Layout & Spacing

The layout is built for handheld mobile performance with an Android-first 4-column dynamic grid. 

- **Outer Margins:** Fixed at `1rem` (16px) to maximize horizontal real estate on compact displays while preventing thumb mis-clicks along curved screen edges.
- **Internal Vertical Rhythm:** Core layout modules adopt a 4px base scale: `space-xs` (4px) for micro-gaps between labels and values; `space-sm` (8px) for badge and chip interiors; `space-md` (16px) for intra-card padding and feed ingredient listings; `space-lg` (20px) for separating logical card modules.
- **Touch Targets:** Any interactive cell, counter adjustment button (+ / -), or quick-filter chip retains a minimum physical bounding box of 48×48px.

## Elevation & Depth

This system avoids heavy, muddy drop shadows in favor of ambient crispness and soft surface delineation:

- **Level 0 (App Canvas):** `#F5F7F6` background provides a gentle, non-glare surface for long operational sessions.
- **Level 1 (Default Content Cards):** `#FFFFFF` fill resting on the canvas, bounded by a 1px border (`#E5E7EB`) without drop shadow, ensuring razor-sharp edges even in harsh sunlight.
- **Level 2 (Interactive Floating & Modals):** Formulator bottom sheets, nutrient sliders, and the bottom navigation bar use an ultra-diffused ambient shadow: `0px 4px 20px -2px rgba(31, 41, 55, 0.06)` combined with a subtle top border (`#E5E7EB`).
- **Level 3 (Pressed / Feedback):** Pill buttons and quick-action cards flatten slightly under touch, transitioning to `#16A34A` or reducing opacity without synthetic 3D skeuomorphism.

## Shapes

The design system employs a distinct dual-tier shape language:

- **Card Tier (`rounded-xl` / 16px–20px):** Content containers, metric summary tiles, and formulation sheets use 16px to 20px radii. This creates the friendly, approachable visual grouping characteristic of top Indonesian everyday apps.
- **Interactive Tier (Pill-shaped / Full-radius):** Primary CTAs, calculation trigger buttons, status badges, and search bars use complete continuous pill rounds (`rounded-full` / 9999px).
- **Feature Icon Box:** 44×44px or 48×48px icon containers use a squircle/rounded-square form (`rounded-2xl` / 14px) with a `#E8F8EE` light green fill.

## Components

### Buttons
- **Primary CTA:** Pill-shaped (`rounded-full`), `#22C55E` background, `#FFFFFF` bold text, minimum height 48px. Active/pressed state shifts to `#16A34A`.
- **Secondary Outline:** Pill-shaped with a 1.5px border in `#22C55E`, `#22C55E` text, and transparent background.
- **Quantity Adjuster Buttons:** Circular (36×36px) with `#E8F8EE` fill and `#16A34A` icons for quick increment/decrement of ingredient percentages.

### Icon Containers
- Feature icons (e.g., Jagung, Dedak Padi, Bungkil Kedelai, Premix) sit inside 48×48px light-green rounded-square boxes (`#E8F8EE`, border-radius 14px). Icons are rendered in `#16A34A` with 2px stroke width.

### Cards
- Standard cards use `#FFFFFF` fill, 16px padding, 18px rounded corners, and a 1px `#E5E7EB` border.
- **Nutrient Ratio Card:** Displays targeted vs. actual values (e.g., *Protein Kasar: 21.2% / Target 21.0%*) with a progress bar transitioning from orange to primary green when the target is met.

### Chips & Badges
- Status pills: `#E8F8EE` fill with `#16A34A` label for optimal ranges (*Optimal*), `#FEF3C7` with `#F59E0B` label for low values (*Kurang*), and `#FEE2E2` with `#EF4444` for excess (*Berlebih*).

### Input Fields
- Numeric input fields for feed weight (kg) and cost (Rp) feature right-aligned tabular numerals with bold unit prefixes/suffixes (`Rp`, `kg`). Border is 1px `#E5E7EB`, focusing to 1.5px `#22C55E` with an inner glow.

### Bottom Navigation Bar
- Fixed 4-tab bar housed on pure white `#FFFFFF` with a top 1px `#E5E7EB` line:
  1. **Beranda:** Home dashboard, quick formulation shortcuts.
  2. **Riwayat:** Saved feed mix batches and price logs.
  3. **Asisten AI:** Smart feed recommendation & ingredient substitution.
  4. **Profil:** Farm settings, flock capacity, and nutrient presets (Broiler Starter, Finisher, Layer).
- Active item displays `#22C55E` icon and text; inactive items display `#6B7280`.