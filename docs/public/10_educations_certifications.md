# 10_EDUCATION_CERTIFICATIONS_COMPONENT.md — Education + Certifications (Clean Footer Signal)

This module defines the **Education + Certifications** component.

This is the closing credibility layer:

- academic foundation
- relevant credentials
- calm, minimal presentation

No clutter, no overstatement.

---

## 1. Purpose

Education and certifications answer:

> “What formal grounding supports this engineer’s work?”

This section should:

- be short and cleanac
- reinforce trust
- avoid taking attention away from impact

---

## 2. Component Structure

This module renders:

- degree summary
- certification list
- optional note for expired AWS certs

---

## 3. File: `components/education.html`

```html
<section class="card">
  <h2>Education &amp; Certifications</h2>

  <div class="edu-block">
    <h3>Bachelor’s Degree (First Class Honours), Software Engineering</h3>
    <p class="muted">University of Northampton — 2009–2012</p>
  </div>

  <div class="edu-block">
    <h3>Certifications</h3>
    <ul>
      <li>Neo4j &amp; LLM Fundamentals — Neo4j (2024)</li>
      <li>Graph Data Modeling Fundamentals — Neo4j (2024)</li>
      <li>Neo4j Fundamentals — Neo4j (2024)</li>
      <li>AWS Developer / Solutions Architect Associate (previous)</li>
    </ul>
  </div>
</section>
```

---

## 4. Required CSS Additions

Add to `assets/style.css`:

```css
.edu-block {
  margin-top: 20px;
}

.edu-block h3 {
  margin-bottom: 8px;
  color: var(--color-heading);
}

.edu-block ul {
  margin-top: 10px;
  padding-left: 20px;
}

.edu-block li {
  margin-bottom: 8px;
  line-height: 1.5;
}
```

---

## 5. Notes

- Keep this section simple.
- The strength of the CV is architectural impact — this is supporting context.
- Certifications should remain relevant and current-focused.

---
