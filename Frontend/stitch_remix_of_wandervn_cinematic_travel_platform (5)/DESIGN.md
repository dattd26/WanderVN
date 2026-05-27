---
name: WanderVN Admin
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#43474f'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#747780'
  outline-variant: '#c4c6d0'
  surface-tint: '#405f91'
  primary: '#001736'
  on-primary: '#ffffff'
  primary-container: '#002b5b'
  on-primary-container: '#7594ca'
  inverse-primary: '#a9c7ff'
  secondary: '#115cb9'
  on-secondary: '#ffffff'
  secondary-container: '#659dfe'
  on-secondary-container: '#003370'
  tertiary: '#2f0c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#4f1c02'
  on-tertiary-container: '#cd805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#a9c7ff'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#264778'
  secondary-fixed: '#d7e2ff'
  secondary-fixed-dim: '#acc7ff'
  on-secondary-fixed: '#001a40'
  on-secondary-fixed-variant: '#004491'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#713619'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1440px
  sidebar-width: 260px
---

## Brand & Style

The design system is engineered for the high-stakes environment of travel logistics and platform management. The brand personality is **authoritative, precise, and dependable**, moving away from the consumer-facing whimsy of travel into the disciplined world of corporate oversight.

The visual style is **Corporate Minimalism**. It prioritizes information density without sacrificing clarity. By utilizing expansive whitespace and a rigid structural grid, the system evokes a sense of "quiet luxury"—the feeling of a premium, high-end tool that works flawlessly under pressure. Every element is intentional; there is no decoration for decoration's sake. The interface acts as a silent partner to the administrator, facilitating rapid data processing and high-level decision-making.

## Colors

The palette is anchored by **Deep Navy (#002B5B)**, providing a high-contrast, professional foundation that commands attention. This is balanced by a clinical **Clean White (#FFFFFF)** surface and a very light **Cool Gray (#F8FAFC)** background to differentiate between the canvas and the content containers.

Functional colors (Success, Warning, Error) are used sparingly but vibrantly to ensure critical system statuses are immediately identifiable amidst dense data. Grays are neutral-cool to maintain a modern, "tech-forward" atmosphere rather than a traditional, warm corporate feel.

## Typography

This design system utilizes **Inter** for its systematic, utilitarian qualities. It is chosen for its exceptional legibility at small sizes—a requirement for data-heavy tables and complex forms. 

- **Display & Headlines:** Use tighter letter-spacing and heavier weights to establish a clear hierarchy.
- **Body Text:** Standardized at 14px for the primary dashboard experience to maximize information density while remaining accessible.
- **Labels:** Uppercase labels with slight tracking are used for table headers and section categorizations.
- **Data Mono:** For IDs, transaction numbers, or technical logs, a monospaced font is introduced to ensure character alignment and precision.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. A fixed sidebar (260px) provides persistent navigation, while the main content area utilizes a fluid 12-column grid that expands to a maximum width of 1440px to prevent excessive line lengths on ultra-wide monitors.

Spacing is built on a **4px baseline grid**. 
- **Internal Card Padding:** 24px (lg) for standard cards; 16px (md) for compact data widgets.
- **Gutter Width:** 24px consistently between cards to provide enough "breathing room" for complex data visualizations.
- **Mobile Adaption:** On mobile devices, the sidebar collapses into a hamburger menu, and the 12-column grid reflows into a single column with 16px horizontal margins.

## Elevation & Depth

To maintain a "high-end" professional feel, this design system avoids heavy shadows. Instead, it uses **Low-Contrast Outlines** combined with extremely subtle ambient depth.

- **Primary Canvas:** #F8FAFC (flat).
- **Cards & Containers:** White (#FFFFFF) with a 1px solid border in #E2E8F0.
- **Hover States:** When a card or interactive element is hovered, a soft, diffused shadow (0px 4px 12px rgba(0, 0, 0, 0.05)) is applied to indicate interactivity.
- **Modals/Overlays:** These utilize a more pronounced shadow and a backdrop blur (8px) to isolate the task from the background data.

## Shapes

The shape language is **Soft**. A corner radius of **4px (0.25rem)** is applied to standard UI elements like input fields, buttons, and small widgets. This provides a modern touch without appearing too consumer-focused or "bubbly."

Large layout containers, such as Dashboard Cards, may use **8px (0.5rem)** to subtly distinguish them from smaller atomic components. Buttons never use a pill shape; they remain rectangular with soft corners to reinforce the corporate/professional aesthetic.

## Components

### Buttons
- **Primary:** Deep Blue (#002B5B) background with White text. No gradients.
- **Secondary:** White background with a 1px border of Deep Blue.
- **Ghost:** No background or border; used for secondary actions like "Cancel" or "Clear Filters."

### Input Fields
- Standard state: White background, #E2E8F0 border.
- Focus state: 1px Deep Blue border with a 2px soft blue outer glow (ring).
- Labels are positioned above the field in `body-sm` bold.

### Data Tables
- Row height: 48px or 56px.
- Alternate row striping is not used; instead, use thin horizontal dividers (#F1F5F9).
- Column headers use `label-caps` typography with a subtle gray background.

### Cards (KPIs & Charts)
- White background, 1px border.
- Include a 4px colored top-border accent for specific categories (e.g., Success green for "Revenue," Error red for "Cancellations").

### Chips/Tags
- Small, 2px roundedness.
- Light, desaturated background tints (e.g., light green background with dark green text) for status indicators to keep them legible but secondary to primary buttons.