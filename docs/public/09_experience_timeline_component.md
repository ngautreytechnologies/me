# 09_EXPERIENCE_TIMELINE_COMPONENT.md — Experience Timeline (Principal-Level Narrative)

This module defines the **Experience** component.

It provides a calm, structured timeline of roles, focusing on:

- architectural responsibility
- systems impact
- senior-level delivery

This is not a full job description dump.

It should feel like:

- trusted senior progression
- clear scope and outcomes
- readable in under 2 minutes

---

## 1. Purpose

Experience answers:

> “Where has this engineer operated, and at what level of responsibility?”

It should:

- reinforce Principal credibility
- highlight systems work over tasks
- stay concise and outcome-oriented

---

## 2. Component Structure

This module renders:

- role title + company + dates
- 3–5 focused impact bullets per role
- an “Earlier Experience” compression block

---

## 3. File: `components/experience.html`

```html
<section class="card">
  <h2>Experience</h2>

  <div class="role">
    <h3>Principal Software Engineer — Alchem Technologies Ltd</h3>
    <p class="muted">Mar 2024 – Jul 2025</p>
    <ul>
      <li>
        Defined architectural direction for a domain-driven modular platform,
        supporting near-term delivery with a clean path to future decomposition.
      </li>
      <li>
        Established integration boundaries and modelling discipline to reduce
        coupling and enable safe evolution in a compliance-heavy domain.
      </li>
      <li>
        Led proof-of-concept workstreams to validate approach and de-risk
        innovative platform capabilities.
      </li>
      <li>
        Mentored engineers through design reviews, exploratory delivery, and
        maintainable architecture practices.
      </li>
    </ul>
  </div>

  <div class="role">
    <h3>Principal Software Developer — E-bate Limited</h3>
    <p class="muted">Sep 2022 – Mar 2024</p>
    <ul>
      <li>
        Led redesign of a complex tiered rebate calculation engine, delivering
        an ~85% performance improvement in critical workloads.
      </li>
      <li>
        Strengthened platform reliability and extensibility while supporting
        customer-specific commercial flexibility.
      </li>
      <li>
        Established coding standards and mentoring practices that reduced
        knowledge silos across the engineering organisation.
      </li>
    </ul>
  </div>

  <div class="role">
    <h3>Senior Software Developer — E-bate Limited</h3>
    <p class="muted">Nov 2021 – Sep 2022</p>
    <ul>
      <li>
        Delivered new platform features with a strong focus on clean code,
        testing discipline, and production defect resolution.
      </li>
      <li>
        Built internal templates and sample services that improved developer
        productivity and architectural consistency.
      </li>
    </ul>
  </div>

  <div class="role">
    <h3>Earlier Experience</h3>
    <p class="muted">2012 – 2021</p>
    <p>
      Backend and platform engineering roles across IoT, cloud systems, and
      customer-facing product environments, building strong foundations in
      maintainable delivery, systems evolution, and production reliability.
    </p>
  </div>
</section>
```

---

## 4. Required CSS Additions

Add to `assets/style.css`:

```css
.role {
  margin-top: 26px;
}

.role h3 {
  margin-bottom: 6px;
  color: var(--color-heading);
}

.role ul {
  margin-top: 10px;
  padding-left: 20px;
}

.role li {
  margin-bottom: 10px;
  line-height: 1.55;
}

.role p {
  margin: 6px 0;
}
```

---

## 5. Notes

- Keep bullets focused on scope + impact.
- Compress older roles to preserve senior signal.
- This section should feel calm, not exhaustive.

---
