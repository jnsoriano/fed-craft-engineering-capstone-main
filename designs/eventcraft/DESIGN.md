---
name: EventCraft
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
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001a42'
  on-tertiary-container: '#3980f4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  background-subtle: '#F8FAFC'
  budget-warning: '#F59E0B'
  budget-danger: '#EF4444'
  surface-white: '#FFFFFF'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
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
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  container-max: 1200px
---

## Brand & Style

The design system embodies a **Premium Professional** aesthetic, tailored for high-stakes event planning where precision meets creativity. The target audience includes corporate event planners, engaged couples, and gala organizers who require a tool that feels as sophisticated as the events they are hosting.

The visual style is **Corporate / Modern** with a focus on high-end SaaS patterns. It leverages:
- **Generous Whitespace:** To reduce cognitive load during complex decision-making processes.
- **Precision Components:** Sharp, well-defined interactive elements that signify reliability.
- **Micro-interactions:** Subtle transitions that provide a "wizard" feel without being distracting.
- **High Contrast:** Clear separation between functional areas and informational content.

## Colors

The palette is anchored by **Deep Navy** (`primary`) to establish authority and trust. **Emerald Green** (`secondary`) is used as an energetic accent for successful actions, progress indicators, and "under-budget" states. **Royal Blue** (`tertiary`) serves as the primary interactive color for links and secondary buttons.

- **Primary:** Deep Navy for text, headers, and core brand elements.
- **Secondary:** Emerald for confirmation and positive budget tracking.
- **Neutral:** Slate grays for borders, secondary text, and iconography.
- **Budget Feedback:** A traffic-light system (Green/Amber/Red) is integrated into the persistent budget bar to provide instant financial feedback.

## Typography

This design system uses a dual-sans-serif approach for maximum clarity and a modern edge.
- **Hanken Grotesk** is used for headlines, providing a sharp, contemporary look that feels professional and custom.
- **Inter** is the workhorse for all body copy, inputs, and descriptions, ensuring high legibility in data-heavy views.
- **JetBrains Mono** is used sparingly for labels, budget numbers, and reference codes (e.g., "EVT-2023...") to emphasize the "crafted" and precise nature of the tool.

Hierarchy is maintained through weight and generous line-heights to prevent the wizard from feeling cramped.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop to keep the complex forms contained and readable, centering the wizard in the viewport.

- **Desktop (1024px+):** 12-column grid with 24px gutters. The central wizard container is capped at 1200px.
- **Tablet (768px - 1023px):** 8-column grid with 20px gutters. Side margins are reduced to 32px.
- **Mobile (<768px):** 4-column fluid grid. The persistent budget bar moves to the bottom of the viewport as a sticky element.

Spacing follows a 4px base scale, emphasizing larger gaps (`lg` and `xl`) between major sections (e.g., between the progress stepper and the active form) to create a sense of "Premium" airiness.

## Elevation & Depth

To maintain a "Professional" feel, the design avoids heavy shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**.

- **Surface Levels:** The main wizard background uses `background-subtle`, while interactive cards and form areas use `surface-white`.
- **Outlines:** Elements are defined by 1px borders in a soft neutral slate (`#E2E8F0`). 
- **Active State:** Selected cards or focused inputs use a 2px primary navy border or a subtle blue glow (tertiary) to signify focus.
- **Budget Bar:** This is the only element with a significant ambient shadow (large blur, low opacity) to visually separate it from the content it is "tracking."

## Shapes

The design system uses **Soft** roundedness (4px - 8px). This strikes a balance between the friendliness of a consumer app and the rigidity of professional enterprise software. 

- **Standard Elements:** Buttons, inputs, and small cards use 4px (`rounded`).
- **Large Containers:** Venue cards and the main wizard container use 8px (`rounded-lg`).
- **Steppers:** Step indicators use a circular (fully rounded) shape to denote completion and milestones.

## Components

### Multi-Step Progress Indicators
Located at the top of the view. Use a horizontal line with numbered circles. Completed steps should turn Emerald (`secondary`) with a checkmark icon. The active step should have a primary-colored border and bold Hanken Grotesk text.

### Card-Based Selections
Used for Event Types, Venues, and Catering Styles.
- **Venue Cards:** Must feature a top-aligned image, title in `headline-md`, and a footer with amenities icons. On hover, the border should darken; on select, the border becomes 2px Primary Navy with a small checkmark badge in the corner.
- **Type Cards:** Use large icons (24px) centered above the label.

### Budget Tracking Bar
A persistent, full-width bar (either at the very top or sticky at the bottom).
- **Left:** "Current Spend" vs "Total Budget" in `label-sm` monospace.
- **Center:** A thin progress bar indicating percentage of budget used.
- **Right:** "Remaining" amount in bold.
- **Color Logic:** The bar color transitions from Emerald to Amber to Red based on the 80%/100% thresholds.

### Buttons & Inputs
- **Primary Action:** Solid Deep Navy with white text.
- **Secondary Action:** Outlined Royal Blue.
- **Inputs:** Clean, white backgrounds with 1px slate borders. Focus state uses a 2px Royal Blue border.

### Stepper & Range Sliders
Range sliders for budget should include a "Typical Range" highlighted track segment to guide users toward realistic pricing for their guest count.