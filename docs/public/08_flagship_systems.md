# 08_FLAGSHIP_SYSTEMS_COMPONENT.md — Flagship Systems (Calm Project Cards)

This module defines the **Flagship Systems** component.

This is where you showcase:

- the kind of systems you design
- the principles you care about
- your long-term architectural direction

It should feel like:

- an architect’s portfolio
- not a product pitch

Projects are presented as calm, minimal cards.

---

## 1. Purpose

Flagship Systems answers:

> “What does this engineer build when given space to design properly?”

This section reinforces:

- systems integrity
- long-term thinking
- responsible AI positioning
- personal technical vision

---

## 2. Component Structure

This module renders two project cards:

- CaseCell (high-integrity evidence workflows)
- DendriFlow (developer workflow R&D)

Names and detail can remain high-level.

---

## 3. File: `components/flagship-systems.html`

```html
<section class="card">
  <h2>Flagship Systems</h2>

  <p class="muted">
    A small selection of systems design work and long-term projects that
    reflect my architectural interests and approach.
  </p>

  <div class="project-card">
    <h3>CaseCell — High-Integrity Evidence Platform (Local-First)</h3>
    <p>
      A local-first platform designed for workflows where provenance,
      auditability, and procedural correctness must withstand external scrutiny.
    </p>
    <p class="muted">
      Focus: deterministic architecture, domain-driven execution,
      infrastructure-agnostic design, responsible AI boundaries.
    </p>
  </div>

  <div class="project-card">
    <h3>DendriFlow — Developer Workflow R&amp;D (Passion Project)</h3>
    <p>
      An early-stage exploration of modular automation and AI-assisted developer
      workflows, focused on calm ergonomics, composable tooling, and local-first
      execution.
    </p>
    <p class="muted">
      Focus: cognitive load reduction, reusable workflow components,
      responsible augmentation patterns.
    </p>
  </div>
</section>
```

---

## 4. Required CSS Additions

Add to `assets/style.css`:

```css
.project-card {
  margin-top: 22px;
  padding: 18px;
  border-radius: var(--radius);
  background: var(--color-card);
  box-shadow: var(--shadow);
}

.project-card h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--color-heading);
}

.project-card p {
  margin: 6px 0;
  line-height: 1.55;
}

.project-card .muted {
  margin-top: 10px;
}
```

---

## 5. Notes

- Keep project descriptions calm and principle-led.
- Avoid internal implementation specifics.
- This section should communicate architectural taste and direction.

---
