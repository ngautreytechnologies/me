# 03_COMPONENT_LOADER.md — Component Loader Runtime

This module defines the lightweight JavaScript runtime responsible for mounting
modular CV components into the page shell.

It enables:

- a framework-free component model
- clean separation of content into modules
- simple HTML partial loading per section

The loader is intentionally minimal and deterministic.

---

## 1. Purpose

The CV site is structured as a set of independent component files.

Each component owns:

- its own HTML fragment
- optional CSS additions
- optional JS behaviour

The loader is responsible for:

- fetching each fragment
- injecting it into the correct mount point
- keeping the page orchestration simple and explicit

---

## 2. File: `assets/main.js`

```js
async function mountComponent(id, path) {
  const mount = document.getElementById(id);
  if (!mount) return;

  const res = await fetch(path);
  if (!res.ok) {
    mount.innerHTML = `<p class="muted">Component failed to load.</p>`;
    return;
  }

  mount.innerHTML = await res.text();
}

async function boot() {
  await mountComponent("cv-header", "components/header.html");
  await mountComponent("core-skills", "components/skills.html");
  await mountComponent("career-highlights", "components/highlights.html");
  await mountComponent("strategic-impact", "components/impact.html");
  await mountComponent("flagship-systems", "components/systems.html");
  await mountComponent("experience", "components/experience.html");
  await mountComponent("education", "components/education.html");
  await mountComponent("footer", "components/footer.html");
}

boot();
```

---

## 3. Notes

- No bundler required
- No framework required
- Components remain simple HTML fragments
- Future enhancements can add caching or progressive loading
