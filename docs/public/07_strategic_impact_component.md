# 07_STRATEGIC_IMPACT_COMPONENT.md — Strategic Impact (STAR Architecture Stories)

This module defines the **Strategic Impact** component.

This is where Career Highlights become believable stories.

It uses a calm, succinct STAR structure:

- Situation
- Action
- Result

The goal is to show:

- architectural judgement
- business relevance
- trusted execution under constraints

---

## 1. Purpose

Strategic Impact answers:

> “How does this engineer think when systems and stakes get real?”

This section demonstrates:

- problem framing
- high-leverage decisions
- measurable outcomes
- long-term risk reduction

---

## 2. Component Structure

This module renders:

- a short intro
- a set of impact blocks (STAR style)

Each block is compact and readable.

---

## 3. File: `components/strategic-impact.html`

```html
<section class="card">
  <h2>Strategic Impact</h2>

  <p class="muted">
    A few examples of architectural work delivered under real business and
    operational constraints.
  </p>

  <div class="impact-block">
    <h3>Platform Performance and Customer Retention</h3>

    <p><strong>Situation:</strong>
      A legacy rebate calculation engine was struggling to scale for a major
      customer with significantly increased processing demand.
    </p>

    <p><strong>Action:</strong>
      I designed and delivered an interim redesign of the tiered processing
      flow, improving throughput while a longer-term evolution was planned.
    </p>

    <p><strong>Result:</strong>
      Delivered an ~85% performance improvement and helped secure and retain
      key customers during a high-stakes scaling period.
    </p>
  </div>

  <div class="impact-block">
    <h3>Scalable Service Boundaries in a Governance Platform</h3>

    <p><strong>Situation:</strong>
      A compliance platform needed to evolve rapidly without accumulating
      architectural drift or operational coupling.
    </p>

    <p><strong>Action:</strong>
      I introduced clear integration boundaries and modular backend design so
      new capabilities could be added safely and independently.
    </p>

    <p><strong>Result:</strong>
      Improved maintainability, extensibility, and operational clarity as the
      product grew in complexity.
    </p>
  </div>

  <div class="impact-block">
    <h3>Reliability and Observability Without Domain Pollution</h3>

    <p><strong>Situation:</strong>
      As systems became more business-critical, production confidence and
      diagnosability were essential — without compromising core correctness.
    </p>

    <p><strong>Action:</strong>
      I designed clean interfaces for monitoring and operational tooling so
      observability could be layered externally without leaking into domain logic.
    </p>

    <p><strong>Result:</strong>
      Improved production visibility and resilience while keeping the core
      system deterministic and infrastructure-independent.
    </p>
  </div>
</section>
```

---

## 4. Required CSS Additions

Add to `assets/style.css`:

```css
.impact-block {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--color-border);
}

.impact-block h3 {
  margin-bottom: 10px;
  font-size: 1.05rem;
  color: var(--color-heading);
}

.impact-block p {
  margin: 6px 0;
  line-height: 1.55;
}

.impact-block strong {
  color: var(--color-heading);
}
```

---

## 5. Notes

- Keep STAR blocks short.
- Avoid internal company specifics.
- Focus on business outcomes + architectural judgement.

This section is one of the strongest signals for Principal-level maturity.

---
