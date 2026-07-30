---
name: SelectIA
description: A multidimensional AI model comparison dashboard.
colors:
  brand-primary: "#1a1a1a"
  brand-accent: "#2a2a2a"
  bg-base: "#ffffff"
  bg-elevated: "#ffffff"
  bg-surface: "#fafafa"
  bg-overlay: "#f4f4f4"
  text-primary: "#111111"
  text-secondary: "#888888"
  border-default: "rgba(0, 0, 0, 0.05)"
typography:
  display:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontWeight: 600
    letterSpacing: "-0.022em"
    lineHeight: 1.1
  body:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.9375rem"
    letterSpacing: "-0.011em"
    lineHeight: 1.6
  label:
    fontFamily: "'Fira Code', 'Cascadia Code', ui-monospace, monospace"
    letterSpacing: "-0.02em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  6: "24px"
  8: "32px"
components:
  card:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
  badge-tinted:
    backgroundColor: "{colors.bg-overlay}"
    textColor: "{colors.text-secondary}"
---

# Design System: SelectIA

## Overview

**Creative North Star: "El Blanco Puro Absoluto"**

SelectIA is a dense, high-contrast, premium data dashboard. While it supports 4 themes (Linear Dark, Linear Light, Pure Black), its primary soul and default state is **Blanco Puro** (Pure White). This theme is characterized by extreme minimalism, removing all brand color in favor of soft, near-black grays. The interface relies almost entirely on whitespace, microscopic contrast shifts (whites and `#fafafa`), and crisp typography to create a sense of absolute clarity and clinical precision.

**Key Characteristics:**
- **Blanco Puro Default:** A nearly all-white canvas where depth is achieved through ultra-subtle off-whites rather than shadows.
- **Colorless Brand:** The primary accent is a soft near-black (`#1a1a1a`). Saturated colors are banished from the UI chrome and exist solely in the data visualizations.
- **Micro-Typography:** Heavy reliance on small, uppercase, widely tracked eyebrow labels, and monospace numerics for data metrics.

## Colors

The palette for the default Blanco Puro theme is a ruthless exercise in subtraction.

### Primary
- **Near Black Primary** (#1a1a1a): Used for primary buttons, focus rings, and active states.
- **Dark Gray Accent** (#2a2a2a): Used for subtle glowing accents and secondary highlights.

### Neutral
- **Base Background** (#ffffff): The absolute white canvas.
- **Elevated Background** (#ffffff): Matches the base to flatten the hierarchy visually.
- **Surface Background** (#fafafa): A micro-shift off-white for cards.
- **Overlay Background** (#f4f4f4): For inputs, dropdowns, and tinted badges.
- **Primary Text** (#111111): Near-black for maximum readable contrast without the harshness of `#000`.
- **Secondary Text** (#888888): Muted gray for labels, table headers, and metadata.

### Named Rules
**The Colorless Chrome Rule.** The interface chrome itself must never use a saturated color. Buttons, active states, and backgrounds are strictly grayscale. Color is a privilege reserved exclusively for charts and semantic status dots (success/error).

## Typography

**Display Font:** Inter (with system fallbacks)
**Body Font:** Inter
**Label/Mono Font:** Fira Code (with tnum and zero features)

**Character:** Technical, crisp, and tightly packed. Heavily utilizes negative letter-spacing for headings to create a premium, compact feel.

### Hierarchy
- **Display** (600, tight tracking -0.022em, line-height 1.1): Used for KPI values and hero metrics.
- **Body** (400, 0.9375rem, tracking -0.011em): Standard paragraph text.
- **Label** (600, uppercase, wide tracking 0.08em): Eyebrow text and table headers.
- **Mono** (400, tnum feature, tracking -0.02em): Used exclusively for numbers, metrics, and code snippets.

### Named Rules
**The Monospace Metric Rule.** All numeric data points, scores, and prices must use the monospace font (`Fira Code`) with tabular numerals (`tnum`) enabled to ensure vertical alignment in tables and cards.

## Layout

The application operates on a strict 8pt grid (`--space-2`, `--space-4`, etc.). Layouts are dense and structured, maximizing horizontal real estate for data tables and charts.

## Elevation & Depth

SelectIA uses a flat-by-default architecture. In Blanco Puro, depth is virtually erased, relying on ultra-thin 5% opacity black borders (`rgba(0,0,0,0.05)`) and 1-2% lightness shifts instead of shadows.

### Shadow Vocabulary
- **Ambient Focus Glow** (`0 0 0 3px rgba(0, 0, 0, 0.06)`): Used for keyboard focus rings.
- **Hover Lift** (`0 6px 12px -2px rgba(0,0,0,0.04)`): Microscopic shadow used when hovering over interactive cards.

### Named Rules
**The Flat Canvas Rule.** Cards and containers at rest do not cast shadows. Shadows are exclusively reserved for interactive states (hover) and high-z-index overlays (dialogs, tooltips).

## Shapes

Shapes are geometric but slightly softened. Cards use an 8px (`md`) or 12px (`lg`) radius. Inputs and smaller elements use a tighter 4px (`sm`) radius.

## Components

### Cards
- **Corner Style:** 12px (`--radius-lg`)
- **Background:** Surface (`#fafafa`)
- **Border:** Translucid hairline (`rgba(0, 0, 0, 0.05)`)
- **Hover State:** Slight negative translation (`translateY(-1px)`) and a subtle shadow lift, accompanied by a stronger border opacity.

### Data Tables
- **Headers:** Micro-typography (`0.75rem`), uppercase, wide tracking, secondary text color.
- **Rows:** Flat by default, with a subtle overlay background on hover.

### Tinted Badges
- **Style:** Background overlay, secondary text color, with a 1px translucid border. Used for tags and metadata.

## Do's and Don'ts

### Do:
- **Do** use `var(--text-secondary)` for all non-critical text to reduce cognitive load.
- **Do** align numeric columns to the right and use the `num` utility class.

### Don't:
- **Don't** use pure black `#000000` for text; stick to `#111111` to keep the extreme contrast manageable.
- **Don't** introduce colored backgrounds anywhere in the layout chrome.
