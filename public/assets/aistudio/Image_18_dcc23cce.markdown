---
name: Serene Forest Health
colors:
  surface: '#001718'
  surface-dim: '#001718'
  surface-bright: '#253d3e'
  surface-container-lowest: '#001112'
  surface-container-low: '#051f20'
  surface-container: '#092324'
  surface-container-high: '#152e2f'
  surface-container-highest: '#20393a'
  on-surface: '#cde8e8'
  on-surface-variant: '#c1c8c1'
  inverse-surface: '#cde8e8'
  inverse-on-surface: '#1c3435'
  outline: '#8b938c'
  outline-variant: '#414843'
  surface-tint: '#a7d0b4'
  primary: '#a9d2b6'
  on-primary: '#113723'
  primary-container: '#8eb69b'
  on-primary-container: '#234833'
  inverse-primary: '#41664f'
  secondary: '#9fd1c1'
  on-secondary: '#00382d'
  secondary-container: '#1e4f43'
  on-secondary-container: '#8ebfb0'
  tertiary: '#b7cebb'
  on-tertiary: '#213528'
  tertiary-container: '#9cb2a1'
  on-tertiary-container: '#314537'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c3eccf'
  primary-fixed-dim: '#a7d0b4'
  on-primary-fixed: '#002111'
  on-primary-fixed-variant: '#294e39'
  secondary-fixed: '#bbeddd'
  secondary-fixed-dim: '#9fd1c1'
  on-secondary-fixed: '#002019'
  on-secondary-fixed-variant: '#1e4f43'
  tertiary-fixed: '#d1e8d5'
  tertiary-fixed-dim: '#b6ccba'
  on-tertiary-fixed: '#0c1f14'
  on-tertiary-fixed-variant: '#384b3e'
  background: '#001718'
  on-background: '#cde8e8'
  surface-variant: '#20393a'
  deep-forest: '#0B2B26'
  pine-accent: '#163832'
  text-pure: '#FFFFFF'
  text-mint: '#DAF1DE'
  surface-glass: rgba(11, 43, 38, 0.65)
  border-glass: rgba(218, 241, 222, 0.12)
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  metric-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 42px
    fontWeight: '700'
    lineHeight: 46px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
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
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1.25rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system establishes a comprehensive dark mode environment for personal biometric and BMI tracking. It is built around an organic, botanical aesthetic that replaces clinical anxiety with grounded calm and natural balance.

The visual style merges dark botanical minimalism with translucent glassmorphism. Deep evergreen layers form an immersive background canopy, while floating glass panels with delicate specular highlights and blurred backdrops organize biometric information. Interactive elements employ smooth, elongated curves and tactile pill forms that evoke river stones and botanical contours.

The experience addresses health and body composition through peaceful clarity rather than urgent judgment: numbers sit harmoniously within serene forest tones, soft mint glows, and quiet depth transitions.

## Colors

The color palette is rooted entirely in deep botanical layers, calibrated for dark mode ergonomics and nocturnal clarity.

### Color Hierarchy
- **Canvas Base (`#051F20`)**: The deepest pine shade, used for view backgrounds, root viewports, and outer canvases.
- **Surface Elevation (`#0B2B26`)**: The primary container layer. In glassmorphic cards, this color serves as the translucent fill base (`rgba(11, 43, 38, 0.65)`).
- **Secondary Structure & Borders (`#163832`)**: Used for nested containers, track grooves, inactive segmented states, and structural division.
- **Interactive Anchor (`#235347`)**: The deep moss mid-tone used for secondary buttons, slider tracks, active card strokes, and subtle glow backplates.
- **Primary Interactive (`#8EB69B`)**: The soft sage green providing primary call-to-action fills, active toggle states, progress arcs, and dynamic metric indicators.
- **Text & Accent Pale Mint (`#DAF1DE`)**: Used for numerical readouts, critical badges, high-contrast values, and subtle specular borders (`rgba(218, 241, 222, 0.12)`).
- **Pure White (`#FFFFFF`)**: Reserved for primary headlines, critical metric figures, and high-emphasis button text.

### Dark Mode Contrast Rules
Avoid pure black backgrounds. Contrast is created through tone-on-tone forest layering, keeping eye strain minimal while maintaining accessible contrast for numerical scales and health status indicators.

## Typography

Typography balances geometric structure and neutral reading clarity.

### Family Roles
- **Headlines, Metric Displays, and Labels**: Rendered in **Plus Jakarta Sans** for soft, modern curves and energetic clarity. Numbers should use tabular figures (`font-variant-numeric: tabular-nums`) so dynamic calculations and sliders animate cleanly without horizontal shifting.
- **Body & Explanatory Text**: Rendered in **Inter** to maximize neutral legibility when presenting health interpretations, classification notes, and long-form medical guidance.

### Hierarchy & Tuning
- Display numbers for BMI and weight scores use `metric-display` in `#DAF1DE` or `#FFFFFF`.
- Subtitles and section tags use `label-sm` with slight uppercase letter tracking (`+0.05em`) in `#8EB69B`.
- Body text is set primarily in `#DAF1DE` at 80% opacity or `#8EB69B` for secondary contextual details.

## Layout & Spacing

The layout is built on an 8pt modular grid that provides open breathing space between metric sections.

### Form Factors
- **Mobile (< 640px)**: 4-column fluid layout with `margin: 1.25rem` (20px) and `gutter: 1rem` (16px). Key calculation gauges span 4 columns; auxiliary metrics (height, weight delta, ideal weight) sit in side-by-side 2-column cards.
- **Tablet (641px - 1024px)**: 8-column layout with 24px margins. Allows two-column modular arrangements, placing calculation inputs on the left and live visual gauges on the right.
- **Desktop (> 1024px)**: 12-column layout capped at 1140px max width, centered on the viewport.

### Rhythmic Padding
Cards use an internal padding of `1.5rem` (`space-lg`), while micro-chips, toggles, and input rows utilize `0.5rem` (`space-sm`) to `1rem` (`space-md`) spacing to preserve tactile tap targets.

## Elevation & Depth

Visual depth is produced using dark glassmorphic overlays and botanical illumination, avoiding generic black shadows.

### Glassmorphic Layers
- **Surface Panels**: Backgrounds apply `rgba(11, 43, 38, 0.65)` layered over the `#051F20` canvas, combined with `backdrop-filter: blur(16px)` and `-webkit-backdrop-filter: blur(16px)`.
- **Specular Border Highlights**: Every elevated glass card features a subtle 1px border stroke using `rgba(218, 241, 222, 0.12)`, accentuating top and left light reflections.
- **Sub-Containers**: Nested rows or inset panels within glass cards use `#163832` with 50% opacity and no blur to create structured inner depth.

### Shadow Characteristics
Shadows are deeply tinted with pine tones and soft spreads:
- **Resting Card**: `0 8px 32px 0 rgba(0, 0, 0, 0.35), 0 2px 8px 0 rgba(5, 31, 32, 0.4)`
- **Floating Modals & Sheets**: `0 20px 48px -4px rgba(0, 0, 0, 0.6), 0 0 24px 2px rgba(35, 83, 71, 0.25)`
- **Interactive Element Glow**: Subtle focal points use an ambient glow: `0 0 16px rgba(142, 182, 155, 0.2)`.

## Shapes

The design uses an organic, pill-forward shape scale (level 3) reflecting botanical contours and smooth river stones.

### Radius Scale
- **Interactive Controls (Level 3 Pill)**: Primary buttons, category chips, input fields, and scrubber handles are fully pill-shaped (`rounded-full` / `9999px`).
- **Cards & Primary Modules**: Biometric overview cards, glass containers, and chart panels use `rounded-3xl` (24px to 32px).
- **Internal Elements**: Segmented controls, list rows, and inner metric blocks scale down to `rounded-2xl` (16px) to maintain nested curvature harmony.

## Components

### Buttons
- **Primary CTA**: Full pill shape (`rounded-full`), solid `#8EB69B` fill, `#051F20` high-contrast typography in `label-md`. Height 52px with horizontal padding `space-xl`. On hover and active states, background shifts to `#DAF1DE` with an ambient glow.
- **Secondary Glass Button**: Pill shape, background `rgba(22, 56, 50, 0.6)`, 1px border `rgba(218, 241, 222, 0.16)`, typography in `#DAF1DE`.
- **Icon Actions**: 44px circular glass targets (`rounded-full`) with a frosted backdrop, containing `#DAF1DE` or `#8EB69B` icons.

### Inputs & Scrubbers
- **Numeric & Text Inputs**: Fully rounded 52px containers with translucent background `rgba(11, 43, 38, 0.8)` and a 1px border of `rgba(218, 241, 222, 0.15)`. Text inputs display numbers in `#FFFFFF` with metric suffix labels ("kg", "cm") set in `#8EB69B`. Focus shifts border to `#8EB69B` with a 2px outer ring in `rgba(142, 182, 155, 0.25)`.
- **Interactive Sliders**: 8px rounded track in `#163832`, active track highlighted in `#8EB69B`. The thumb is an elevated 24px pill in `#DAF1DE` containing an inset dot of `#0B2B26`.

### Cards & Glass Panels
- Built with `rounded-3xl` radii, `rgba(11, 43, 38, 0.65)` frosted glass base, 16px backdrop blur, and 1px border in `rgba(218, 241, 222, 0.12)`.
- Internal layout maintains generous `space-lg` padding, organizing top-line labels in `label-sm` and large central values in `metric-display`.

### Health Status Badges & Chips
- Status indicators (e.g., "Abaixo do peso", "Peso saudável", "Sobrepeso") use compact pill shapes.
- Healthy classifications use a background of `rgba(142, 182, 155, 0.15)`, text in `#DAF1DE`, and a 1px border of `rgba(142, 182, 155, 0.3)`. Warning and attention states tint with muted earthen amber or brick tones within dark forest bounding frames.

### Biometric BMI Arc & Radial Charts
- Gauge tracks use an open-loop radial track in `#163832` with a 12px stroke.
- Dynamic gauge values fill via gradient transitions from `#235347` through `#8EB69B` to `#DAF1DE`.
- The central metric reading sits centered in `metric-display` with a soft mint drop-shadow glow.

### Lists & History Entries
- Log rows avoid continuous horizontal divider lines. Individual log items sit on soft glass strips (`rgba(22, 56, 50, 0.45)`) with `rounded-2xl` corners, separated by `space-sm` (8px) gaps.
- Dates and changes sit flush right with green upward/downward delta arrows in `#8EB69B`.