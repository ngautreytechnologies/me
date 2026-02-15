# 02_STYLE_KERNEL.md — Global Look & Feel (Calm Principal Design System)

This module defines the global CSS design kernel for the CV website.

It establishes the foundational look and feel:

- typography hierarchy
- grounded colour palette
- spacing rhythm
- card and section styling
- link and accent behaviour
- responsive baseline

This is the visual system layer that makes the site feel:

- calm
- trustworthy
- professional
- architect-like

The styling is intentionally minimal and mature.

No trends, no flash, no noise.

---

## 1. Purpose

The style kernel provides a single source of truth for:

- layout rhythm
- typography consistency
- reusable component primitives
- visual tone aligned with a Principal Engineer profile

All future component styling must build on this foundation.

---

## 2. File: `assets/style.css`

This is the global stylesheet for the entire site.

It is structured as:

1. Design tokens (palette + typography)
2. Global page layout
3. Section rhythm
4. Card system
5. Text + link behaviour
6. Responsive baseline

---

## 3. Design Tokens (Grounded Masculine Calm)

The palette is deliberately restrained:

- Deep Prussian Blue for authority
- Slate tones for calm secondary text
- Muted Gold for subtle accent
- Off-white background for softness
- Charcoal for readability

```css
:root {
  /* Palette */
  --color-bg: #f5f6f4;
  --color-text: #1e1e1e;
  --color-heading: #0f2a44;
  --color-muted: #3e5568;
  --color-accent: #c6a75e;

  /* Surfaces */
  --color-card: #ffffff;
  --color-border: rgba(15, 42, 68, 0.08);

  /* Typography */
  --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;

  /* Spacing + Radius */
  --radius: 18px;
  --shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}
