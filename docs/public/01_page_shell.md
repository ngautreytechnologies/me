# 01_PAGE_SHELL.md — Single-Page CV Layout and Mount Architecture

This module defines the root HTML structure of the CV website.

It establishes:

- the single-column page layout
- the section mount points for all components
- the orchestration boundary between shell and modules

The page shell contains **no CV content directly**.

All content is loaded through modular component files.

The goal is a clean, calm, framework-free document structure that can scale through composition.

---

## 1. Purpose

The page shell is responsible only for:

- document metadata
- global layout container
- component mount points
- linking the stylesheet and loader runtime

This ensures the site remains:

- modular
- maintainable
- easy to extend
- readable as plain HTML
- calm and professional in structure

The shell is intentionally minimal.

---

## 2. Principles

The page shell enforces a few core principles:

- **Single-column clarity**  
  The CV is presented as one narrative stream, not a dashboard.

- **No content coupling**  
  Content is not hardcoded into the shell.

- **Composable modules**  
  Each section is loaded independently as its own component.

- **Framework-free discipline**  
  Plain HTML + CSS + small JavaScript loader only.

---

## 3. File: `index.html`

This is the only top-level HTML page in the MVP.

It defines:

- the page container
- section mount points
- a stable order of content
- the runtime entry point

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>Nicholas Gautrey — Principal Software Engineer</title>

    <!-- Global design kernel -->
    <link rel="stylesheet" href="assets/style.css" />
  </head>

  <body>
    <main class="page">

      <!-- Identity / Header -->
      <section id="cv-header" class="section"></section>

      <!-- Core Skills Snapshot -->
      <section id="core-skills" class="section"></section>

      <!-- Career Highlights -->
      <section id="career-highlights" class="section"></section>

      <!-- Strategic Impact (STAR Blocks) -->
      <section id="strategic-impact" class="section"></section>

      <!-- Flagship Systems -->
      <section id="flagship-systems" class="section"></section>

      <!-- Experience Timeline -->
      <section id="experience" class="section"></section>

      <!-- Education + Certifications -->
      <section id="education" class="section"></section>

      <!-- Footer -->
      <footer id="footer" class="footer"></footer>

    </main>

    <!-- Component loader runtime -->
    <script src="assets/main.js"></script>
  </body>
</html>
```

## 4. Section Ordering Rationale

The structure is deliberately ordered for recruiter readability:

Header
Immediate identity and positioning.

Core Skills
Quick technical snapshot.

Career Highlights
Business impact at a glance.

Strategic Impact
Deeper principal-level decision examples.

Flagship Systems
Calm showcase of long-term work and vision.

Experience Timeline
Traditional credibility and progression.

Education + Certifications
Supporting details, not foreground noise.

Footer
Contact links and closing.
