# 11_FOOTER_COMPONENT.md — Footer (Quiet Close + Professional Links)

This module defines the **Footer** component.

The footer is intentionally minimal.

It provides:

- a calm closing line
- optional professional links
- no distractions

This is the final impression of the site.

---

## 1. Purpose

The footer answers:

> “Where can I find this engineer professionally?”

It should:

- feel understated
- remain trustworthy
- avoid clutter

---

## 2. Component Structure

This module renders:

- a short closing statement
- a small set of links (email, GitHub, LinkedIn)

---

## 3. File: `components/footer.html`

```html
<footer class="footer">
  <p class="muted">
    Built as a simple, local-first CV site — calm systems thinking, no noise.
  </p>

  <p class="footer-links">
    <a href="mailto:ngautreytechnologies@gmail.com">Email</a>
    <span>·</span>
    <a href="https://github.com/ngautreytechnologies" target="_blank">GitHub</a>
    <span>·</span>
    <a href="https://linkedin.com/in/nicholas-gautrey-5b0b17378/" target="_blank">
      LinkedIn
    </a>
  </p>
</footer>
```

---

## 4. Required CSS Additions

Add to `assets/style.css`:

```css
.footer {
  margin-top: 60px;
  padding: 30px 0;
  text-align: center;
  font-size: 0.95rem;
}

.footer-links {
  margin-top: 12px;
}

.footer-links a {
  color: var(--color-heading);
  text-decoration: none;
}

.footer-links a:hover {
  text-decoration: underline;
}

.footer-links span {
  margin: 0 8px;
  color: var(--color-muted);
}
```

---

## 5. Notes

- Keep links minimal.
- No social clutter.
- The footer should feel like a quiet sign-off.

---
