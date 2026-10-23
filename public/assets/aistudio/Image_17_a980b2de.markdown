---
name: Serene Botanical Health
colors:
  surface: '#e4feff'
  surface-dim: '#c4dfe0'
  surface-bright: '#e4feff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#def9f9'
  surface-container: '#d8f3f4'
  surface-container-high: '#d2edee'
  surface-container-highest: '#cde8e8'
  on-surface: '#051f20'
  on-surface-variant: '#404945'
  inverse-surface: '#1c3435'
  inverse-on-surface: '#dbf6f7'
  outline: '#707975'
  outline-variant: '#c0c8c4'
  surface-tint: '#38675a'
  primary: '#053c31'
  on-primary: '#ffffff'
  primary-container: '#235347'
  on-primary-container: '#94c5b6'
  inverse-primary: '#9fd1c1'
  secondary: '#41664f'
  on-secondary: '#ffffff'
  secondary-container: '#c0eacc'
  on-secondary-container: '#456b53'
  tertiary: '#25382b'
  on-tertiary: '#ffffff'
  tertiary-container: '#3b4f41'
  on-tertiary-container: '#aac0ae'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bbeddd'
  primary-fixed-dim: '#9fd1c1'
  on-primary-fixed: '#002019'
  on-primary-fixed-variant: '#1e4f43'
  secondary-fixed: '#c3eccf'
  secondary-fixed-dim: '#a7d0b4'
  on-secondary-fixed: '#002111'
  on-secondary-fixed-variant: '#294e39'
  tertiary-fixed: '#d1e8d5'
  tertiary-fixed-dim: '#b6ccba'
  on-tertiary-fixed: '#0c1f14'
  on-tertiary-fixed-variant: '#384b3e'
  background: '#e4feff'
  on-background: '#051f20'
  surface-variant: '#cde8e8'
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
  metric-numeral:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 44px
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

This design system blends Scandinavian organic minimalism with refined glassmorphism, tailored specifically for health and biometric tracking (BMI and weight management). 

The emotional tone evokes calm vitality, biological harmony, and quiet confidence. Traditional health tracking tools often induce anxiety through harsh alert reds, clinical grays, and rigid grids. Here, weight and health metrics are contextualized as living, fluctuating rhythms of nature.

The visual style combines layered organic card tiers, translucent frosted glass overlays (`backdrop-blur-md`), botanical layered silhouettes, and pill-shaped interactive touch targets. The experience feels tactile and serene, balancing crisp readability with soothing organic depth.

## Colors

The palette is derived directly from deep botanical layers and filtered natural light, organizing functional interfaces across both Light and Dark modes.

### Palette Tokens
- **Deep Obsidian Pine (`#051F20`)**: Serves as the primary dark-mode background, deep contrast text in light mode, and extreme-depth papercraft layers.
- **Dark Forest (`#0B2B26`)**: Surface elevations in dark mode and high-contrast headlines.
- **Deep Teal Pine (`#163832`)**: Container borders, active card strokes, and subtle atmospheric gradients.
- **Moss Cedar (`#235347`)**: Primary brand anchor. Used for primary buttons, active toggles, chart curves, and emphasized icons.
- **Soft Sage (`#8EB69B`)**: Secondary action state, healthy metric indicators, subtle badges, and supportive chart fills.
- **Pale Mint Glass (`#DAF1DE`)**: Light-mode surface base, badge tints, input fills, and highlight overlays.

### Mode Behavior
- **Light Mode**: Canvases default to clean pure white (`#FFFFFF`) alongside soft layered mint tints (`#DAF1DE` at 30–60% opacity). Cards sit on frosted surfaces with 1px border strokes (`rgba(35, 83, 71, 0.1)`). Primary text utilizes `#051F20`.
- **Dark Mode**: Canvases rely on `#051F20` with layered cards elevated via `#0B2B26` and translucent white glass borders (`rgba(255, 255, 255, 0.12)`). High-priority metrics and text utilize `#DAF1DE` and `#FFFFFF`.

## Typography

The type system pairs **Plus Jakarta Sans** for expressive, friendly geometry across headings and numeric data, with **Inter** for clean, neutral, and hyper-legible body copy.

Numerical metric displays (such as BMI scores, current weights, and delta changes) use tabular figure styling within Plus Jakarta Sans to prevent jittering during animated transitions and slider adjustments.

Letter spacing is tightened slightly on headings (`-0.02em`) to maintain editorial cohesion, while uppercase label roles receive generous letter spacing (`+0.05em`) for legibility in badges and table headers.

## Layout & Spacing

The layout is constructed on an 8pt base grid with a fluid column framework adapting across three primary viewports:
- **Mobile (< 640px)**: 4-column system, `margin`: `1.25rem` (20px), `gutter`: `1rem` (16px). Cards span the full width or 2 columns for quick biometric summaries.
- **Tablet (641px - 1024px)**: 8-column layout with 24px margins, allowing parallel placement of weight history graphs alongside BMI calculators.
- **Desktop (> 1024px)**: 12-column layout with max content boundaries of 1200px centered, flanked by botanical glass layers.

Vertical flow prioritizes breathing room, preventing dense, overwhelming clinical tables. Cards group related metrics together with generous internal padding (`space-lg`), separating secondary inputs with `space-md`.

## Elevation & Depth

Depth is established through soft paper-cut layering and translucent glassmorphism rather than heavy dropped drop-shadows.

### Glass Surfaces
- Floating panels employ `backdrop-filter: blur(16px)` with an ultra-sheer fill (`rgba(255, 255, 255, 0.75)` in light mode, `rgba(11, 43, 38, 0.65)` in dark mode).
- The top-level edge is refined using a delicate 1px border stroke (`rgba(255, 255, 255, 0.4)` on light, `rgba(255, 255, 255, 0.12)` on dark) simulating specular highlights on frosted glass.

### Shadows
Shadows are tinted with the deep green palette rather than pure gray:
- **Subtle Layer**: `0 4px 20px -2px rgba(5, 31, 32, 0.05)`
- **Glass Elevated Card**: `0 12px 32px -4px rgba(5, 31, 32, 0.10)`
- **Floating Action Button / Overlay**: `0 20px 40px -6px rgba(5, 31, 32, 0.18)`

## Shapes

The design uses generous, organic curves (Pill-shaped level 3). 
- Primary buttons, text inputs, and filter chips feature full pill radii (`rounded-full` / `9999px`).
- Metric cards, modal sheets, and health graphs adopt `rounded-3xl` (24px to 32px), creating fluid containers that echo natural foliage shapes.
- Inner elements inside cards (such as individual list rows or slider thumbs) transition to `rounded-2xl` (16px) to maintain nested proportional harmony.

## Components

### Buttons
- **Primary**: Full pill radius (`rounded-full`), solid `#235347` background with pure white typography, `h-13` (52px), and horizontal padding of `space-xl`. Hover transitions to `#163832` with a subtle elevation shift.
- **Secondary Glass**: Frosted translucent surface (`backdrop-blur-md`, `bg-white/40` or `bg-white/10`), 1px stroke of `rgba(35, 83, 71, 0.2)`, text in `#235347` (or `#DAF1DE` in dark mode).
- **Icon Actions**: Circular 44px buttons with soft background tints (`#DAF1DE` at 60% opacity) containing deep pine icons.

### Input Fields
- Fully rounded pill containers (`rounded-full`), height 50px, styled with a soft ambient background (`#FFFFFF` with inset tint or light `#DAF1DE` at 25% opacity).
- 1px outer stroke of `#8EB69B` with smooth focus rings expanding to a 2px diffuse outline in `#235347`.
- Metric suffix chips (e.g., "kg", "cm", "lbs") are embedded directly on the right edge inside pill-shaped badges.

### Cards & Glass Panels
- Elevated using `rounded-3xl` corners, frosted glass background, and 1px perimeter border.
- Internal padding is set to `1.5rem` (`space-lg`).
- Modular structures allow stacking of visual BMI gauges (curved semi-circle charts) over recent weight progress logs.

### Chips & Badges
- Health status chips (e.g., "Normal", "Sobrepeso", "Ideal") feature a `rounded-full` contour with background `#DAF1DE` and text in `#0B2B26`.
- Trend badges incorporate micro-directional arrows in `#235347`.

### Sliders & Steppers
- Custom weight and height scrubbers feature a 6px rail colored `#DAF1DE` with an active fill in `#235347`.
- The handle thumb is an elevated 24px pure white pill with an embedded `#235347` center dot and dual ambient drop shadows.

### Lists & Activity Logs
- Log items feature zero stark divider lines. Instead, items sit on soft alternating frosted rows with `rounded-2xl` geometry and subtle 8px gaps (`space-sm`).