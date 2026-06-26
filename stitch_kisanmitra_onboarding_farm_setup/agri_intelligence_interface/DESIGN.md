---
name: AgroModern Fidelity
colors:
  surface: '#f4fcf0'
  surface-dim: '#d7dcd3'
  surface-bright: '#f6fbf2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff6ea'
  surface-container: '#ebefe6'
  surface-container-high: '#e3eadf'
  surface-container-highest: '#dfe4db'
  on-surface: '#171d16'
  on-surface-variant: '#3e4a3d'
  inverse-surface: '#2d322c'
  inverse-on-surface: '#edf2e9'
  outline: '#6f7a6e'
  outline-variant: '#bdcaba'
  surface-tint: '#056d2e'
  primary: '#00501f'
  on-primary: '#ffffff'
  primary-container: '#006b2c'
  on-primary-container: '#8ee99b'
  inverse-primary: '#80da8d'
  secondary: '#016d30'
  on-secondary: '#ffffff'
  secondary-container: '#98f4a7'
  on-secondary-container: '#0c7234'
  tertiary: '#2f4a3b'
  on-tertiary: '#ffffff'
  tertiary-container: '#466252'
  on-tertiary-container: '#bddcc8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf7a7'
  primary-fixed-dim: '#80da8d'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005320'
  secondary-fixed: '#9bf7aa'
  secondary-fixed-dim: '#7fda90'
  on-secondary-fixed: '#00210a'
  on-secondary-fixed-variant: '#005323'
  tertiary-fixed: '#caead5'
  tertiary-fixed-dim: '#afceba'
  on-tertiary-fixed: '#042014'
  on-tertiary-fixed-variant: '#314d3d'
  background: '#f6fbf2'
  on-background: '#181d18'
  surface-variant: '#dfe4db'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  base: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The brand personality is **Modern Corporate / Agricultural**, blending the reliability of a fintech platform with the vitality of nature. The target audience includes tech-forward farmers, agricultural cooperatives, and supply chain managers who require a professional, trustworthy, and efficient workspace.

The visual style is characterized by high-fidelity "Material-inspired" surfaces, utilizing a light, airy color palette and crisp typography to reduce cognitive load. It emphasizes clarity and optimism through soft green accents and functional, spacious layouts.

## Colors
The palette is rooted in a "Fidelity" green system. The **Primary** color is a deep, functional forest green used for actions and brand identity. **Secondary** and **Tertiary** colors provide subtle shifts in tone for grouping and supplemental information.

The **Neutral** palette uses "Surface" colors with a slight green tint rather than pure grays, maintaining a cohesive, organic feel. `Surface-container-lowest` (pure white) is used for the primary content cards to create maximum contrast against the `Background` (#f4fcf0). Success and Error states follow standard semantic conventions but are adjusted for high legibility against the tinted background.

## Typography
The system uses a dual-font strategy. **Plus Jakarta Sans** is the display face, chosen for its friendly, modern, and open geometric shapes, making headlines feel approachable yet professional. **Inter** is used for all functional text (body, labels, and inputs) due to its exceptional legibility and neutral, utilitarian character.

On mobile, the `display-lg` styles reflow into `headline-lg-mobile` to maintain visual hierarchy without overwhelming the viewport. Emphasis is achieved primarily through weight (SemiBold/Bold) rather than color shifts, ensuring accessibility.

## Layout & Spacing
The system utilizes a **Fixed Grid** approach for desktop, centering a max-width container (1200px) to keep information dense and reachable. On mobile, it transitions to a fluid single-column layout with 16px side margins.

A rhythmic 8px base unit (n*8) governs the spacing. **Gaps** of 16px (md) are standard for card internal padding, while 24px (lg) or 32px (xl) separate major sections. The "Authentication" flow uses a specific 400px fixed-width container on large screens to maintain a focused, transactional feel.

## Elevation & Depth
Depth is created through a mix of **Tonal Layering** and **Ambient Shadows**. 

1. **Surface Tiers:** Backgrounds live on `surface-container-lowest`. Secondary informative blocks (like the lifecycle grid) sit on `surface-container-low` to provide a subtle visual "recession."
2. **Shadows:** Floating elements like the primary login card use an extra-diffused shadow (`0 4px 12px rgba(15,23,42,0.08)`) to lift them off the background without appearing heavy.
3. **Borders:** Thin, low-contrast outlines (`outline-variant`) are used for input fields and containers to define boundaries without adding visual noise.

## Shapes
The shape language is consistently **Rounded**, reflecting the "Plus Jakarta Sans" typography. Standard components (buttons, inputs) use a 0.75rem (12px) radius. Primary cards and decorative containers use a more pronounced 1.125rem (18px) radius to emphasize their importance and provide a softer, friendlier aesthetic. Interactive elements such as icons and avatars often utilize "Full" (pill) rounding.

## Components
- **Buttons:** Primary buttons are solid `primary` color with `on-primary` text. They feature a 12px radius, 48px minimum height for touch targets, and a subtle scale transform (0.98) on active states.
- **Input Fields:** Use `surface-container-lowest` background with a 1px `outline-variant` border. On focus, the border transitions to `primary` with a 20% opacity `primary` ring (focus-ring).
- **Cards:** Defined by an 18px radius, white background, and a soft 8% opacity slate-tinted shadow. Use `surface-container-high` for internal dividers.
- **Chips / Icons:** Icon containers (like the lifecycle grid) use 20% opacity `primary-container` backgrounds to highlight the icon without competing with the primary CTA.
- **OTP Inputs:** Specific variant of text inputs—fixed 48x56px dimensions, centered text using `headline-md` typography to ensure clear visibility during verification.