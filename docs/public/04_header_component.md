# 04_HEADER_COMPONENT.md — Identity Header (Name, Role, Positioning)

This module defines the top identity block of the CV site.

It is the first thing a visitor sees.

The header must communicate:

- calm seniority  
- clear role positioning  
- trustworthy engineering presence  
- minimal, non-marketing tone  

No slogans. No noise. Just identity and focus.

---

## 1. Purpose

The header component provides:

- name
- title
- location / working mode
- one-line positioning statement

It anchors the entire document.

---

## 2. Mount Point

Loaded into:

```html
<section id="cv-header" class="section"></section>
```

---

## 3. File: `components/header.html`

This is a pure HTML fragment.

```html
<div class="card header-card">
  <h1 class="name">Nicholas Gautrey</h1>

  <p class="role">
    Principal Software Engineer / Systems Architect
  </p>

  <p class="meta">
    Remote (UK) · High-integrity systems · Local-first architecture
  </p>

  <p class="positioning">
    I design reliable platforms where correctness, traceability, and calm execution matter.
  </p>
</div>
```

---

## 4. Styling Notes

The header builds on the global style kernel:

- strong but quiet typography
- muted secondary text
- generous spacing
- card surface with soft shadow

Example CSS additions:

```css
.header-card {
  text-align: left;
}

.name {
  font-size: 2.2rem;
  margin-bottom: 0.4rem;
}

.role {
  font-size: 1.1rem;
  color: var(--color-heading);
  font-weight: 600;
}

.meta {
  color: var(--color-muted);
  margin-top: 0.25rem;
}

.positioning {
  margin-top: 1rem;
  font-size: 1rem;
  line-height: 1.6;
}
```

---

## 5. Implementation Principle

This component should feel like the first line of a well-written technical document:

- grounded
- clear
- confident
- human

Not a landing page.

---
