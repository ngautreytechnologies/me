# 05_CORE_SKILLS_COMPONENT.md — Core Skills Section (Calm, Scannable Competency Snapshot)

This module defines the **Core Skills** component of the CV site.

It provides a fast, trustworthy scan of technical strengths without turning the page into a keyword wall.

The goal is to communicate:

- Principal-level breadth
- Systems-first thinking
- Calm confidence
- Modern backend + architecture focus

No fluff. No buzzword overload.

---

## 1. Purpose

The Core Skills section exists to answer, quickly:

> “What can this engineer reliably build and lead?”

It should:

- support recruiter scanning
- reinforce architectural positioning
- stay readable and minimal

---

## 2. Component Structure

This module renders:

- a short intro line
- a clean grid of skill pillars
- optional secondary tooling list

---

## 3. File: `components/core-skills.html`

```html
<section class="card">
  <h2>Core Skills</h2>

  <p class="muted">
    Principal-level strengths across systems design, backend engineering,
    and high-integrity architecture.
  </p>

  <div class="skills-grid">
    <div class="skill">
      <h3>Systems Architecture</h3>
      <p>Boundaries, scalability, long-term maintainability.</p>
    </div>

    <div class="skill">
      <h3>Domain-Driven Design</h3>
      <p>Clean domain cores, modelling discipline, ports and adapters.</p>
    </div>

    <div class="skill">
      <h3>Platform Engineering</h3>
      <p>Reliable execution models, observability, operational clarity.</p>
    </div>

    <div class="skill">
      <h3>Data Integrity</h3>
      <p>Determinism, provenance, auditability, trust-by-construction.</p>
    </div>

    <div class="skill">
      <h3>Cloud + Local-First</h3>
      <p>AWS-native delivery with infrastructure-agnostic foundations.</p>
    </div>

    <div class="skill">
      <h3>Responsible AI Augmentation</h3>
      <p>AI as a bounded tool, never an uncontrolled dependency.</p>
    </div>
  </div>
</section>
```

---

## 4. Required CSS Additions

Add to `assets/style.css`:

```css
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.skill h3 {
  font-size: 1rem;
  margin-bottom: 6px;
  color: var(--color-heading);
}

.skill p {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.95rem;
  line-height: 1.4;
}
```

---

## 5. Notes

This section is intentionally restrained.

It should feel like:

- an engineer’s competency map
- not a marketing list
- not a recruiter keyword dump

The detail comes later in:

- Career Highlights
- Strategic Impact
- Experience

---
