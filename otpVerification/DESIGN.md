---
name: ThiKorben
colors:
  surface: '#fcf8ff'
  surface-dim: '#dbd9e1'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2fb'
  surface-container: '#f0ecf5'
  surface-container-high: '#eae7f0'
  surface-container-highest: '#e4e1ea'
  on-surface: '#1b1b21'
  on-surface-variant: '#464652'
  inverse-surface: '#303036'
  inverse-on-surface: '#f2eff8'
  outline: '#777683'
  outline-variant: '#c7c5d4'
  surface-tint: '#4f54b4'
  primary: '#15157d'
  on-primary: '#ffffff'
  primary-container: '#2e3192'
  on-primary-container: '#9da1ff'
  inverse-primary: '#c0c1ff'
  secondary: '#8c4f00'
  on-secondary: '#ffffff'
  secondary-container: '#fd9923'
  on-secondary-container: '#663800'
  tertiary: '#491a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#6c2a00'
  on-tertiary-container: '#f19160'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#04006d'
  on-primary-fixed-variant: '#373a9b'
  secondary-fixed: '#ffdcbf'
  secondary-fixed-dim: '#ffb874'
  on-secondary-fixed: '#2d1600'
  on-secondary-fixed-variant: '#6b3b00'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb692'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#773207'
  background: '#fcf8ff'
  on-background: '#1b1b21'
  surface-variant: '#e4e1ea'
typography:
  display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 16px
  margin-mobile: 20px
---

## Brand & Style
The design system is centered on trust, reliability, and local accessibility for the Bangladeshi market. It employs a **Corporate / Modern** style with high-usability characteristics. The UI is designed to feel professional yet welcoming, bridging the gap between skilled tradespeople and everyday households. 

The aesthetic is defined by "High-Utility Minimalism"—maximizing whitespace to reduce cognitive load while using bold color accents to guide user action. The visual language balances structured grid systems with soft, organic shapes to ensure the technology feels human-centric and approachable.

## Colors
The palette uses **Deep Indigo** as the primary anchor to convey institutional trust and stability. **Warm Orange** serves as the functional accent, reserved for primary calls to action, notifications, and "active" states to provide a friendly, energetic contrast. 

The background uses a slightly warm **Off-White** to reduce screen glare and improve long-term readability compared to pure white. **Dark Charcoal** is utilized for text to maintain a high contrast ratio (conforming to WCAG AA standards) without the harshness of pure black.

## Typography
This design system utilizes **Inter** exclusively to ensure maximum legibility across various screen densities. The typographic scale is generous to accommodate users who may be navigating the app in outdoor, high-glare environments. 

Headlines are set with tighter letter spacing and heavier weights to establish a clear hierarchy. Body text maintains a comfortable line height (1.5x) to ensure descriptions of services and terms of use are easily digestible. For Bengali script support, the system should fall back to a compatible humanist sans-serif that matches Inter’s x-height.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for mobile devices. It utilizes a 4-column structure for mobile screens with a 20px outer margin to prevent content from hugging the device edges. 

The spacing rhythm is based on a 4px baseline grid. Internal card padding is standardized at 16px (md) to ensure touch targets remain large and accessible. Vertical stacking of service categories should use 24px (lg) spacing to clearly distinguish between different trade sectors.

## Elevation & Depth
Depth is communicated through **Ambient Shadows** and **Tonal Layering**. 

- **Level 0 (Base):** Off-white background (#F8F9FA).
- **Level 1 (Cards):** Pure white surface (#FFFFFF) with a soft, diffused shadow (Y: 4px, Blur: 12px, Opacity: 6% Black). This is used for service provider cards and category buttons.
- **Level 2 (Active/Modals):** Pure white surface with a more pronounced shadow (Y: 8px, Blur: 20px, Opacity: 10% Primary Color tint). This adds a subtle "brand glow" to elevated elements.

Avoid harsh borders; instead, use 1px subtle strokes (#EEEEEE) for secondary elements that do not require elevation.

## Shapes
The shape language is **Pill-shaped** and highly organic. This maximizes the "friendly" and "approachable" brand personality. 

Large-scale components like main action buttons and primary service containers use the `2xl` (32px+) corner radius. Secondary elements like input fields and small chips use `rounded-lg` (16px). This high degree of roundedness serves a functional purpose: it creates distinct "islands" of content that are easier for the eye to separate on a small screen.

## Components

### Buttons
- **Primary:** Warm Orange (#F7941D) background with White text. Heavy `2xl` rounding. Minimum height of 56px for high touch-accuracy.
- **Secondary:** Deep Indigo (#2E3192) background with White text. Used for secondary actions like "View Profile."
- **Ghost:** Transparent background with Indigo stroke and text.

### Cards
Service cards must include a high-contrast icon container (Soft Indigo background), a clear bold title, and a price/rating label. The entire card should act as a single touch target.

### Service Icons
Icons for trades must be thick-stroked (2px) and paired with clear text labels. 
- **Plumber:** Wrench icon inside a circular orange-tinted badge.
- **Electrician:** Bolt icon inside a circular blue-tinted badge.
- **Carpenter:** Saw icon.
- **Cleaner:** Broom icon.

### Input Fields
Standardized with a 16px (rounded-lg) radius. Focused states should use a 2px Deep Indigo border to provide clear visual feedback during data entry.

### Chips & Status
Use highly rounded "pills" for status indicators (e.g., "Verified," "Available"). Use Success Green (#27AE60) for positive statuses and Primary Indigo for neutral categories.