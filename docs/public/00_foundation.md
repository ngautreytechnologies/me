# 00_FOUNDATIONS.md — Principal CV Website (Local-First Modular Site)

This document defines the foundations for Nicholas Gautrey’s personal CV website.

It is the architectural north-star for the site:  
what it is, why it exists, what it must convey, and how it is structured.

The implementation is intentionally simple:

- vanilla HTML
- vanilla CSS
- minimal JavaScript for module loading
- no frameworks
- no build tooling
- no unnecessary assets

The site should feel like a calm, high-integrity engineering artefact.

---

## 1. Purpose of the Site

The purpose of this website is to present an accurate and compelling picture of Nicholas Gautrey as a Principal Software Engineer.

It must communicate:

- systems-level thinking
- architectural responsibility
- technical credibility
- calm, trustworthy leadership
- long-term engineering judgement
- responsible AI integration (as a tool, not a gimmick)

This is not a marketing site.

It is a professional technical profile, designed for:

- Senior Engineer interviews
- Principal Engineer roles
- Architecture-led positions
- High-integrity system environments

---

## 2. Audience and Use Case

Primary audience:

- engineering hiring managers
- technical recruiters screening senior candidates
- architects and platform leads evaluating systems maturity

Secondary audience:

- collaborators and peers
- open-source readers
- future clients (long-term)

The site must support rapid scanning while still rewarding deeper reading.

---

## 3. Core Principles

### Calm Professional Authority

The site should feel composed and mature, not flashy or performative.

### Systems Thinking Over Buzzwords

The focus is on architecture, integrity, boundaries, and delivery outcomes.

### Minimalism and Clarity

Whitespace, readable typography, and clean hierarchy matter more than decoration.

### Trustworthiness

The design should imply:

- procedural correctness
- reliability
- careful judgement

### Local-First and Lightweight

The site should load instantly, work without dependencies, and remain easy to maintain.

---

## 4. Look and Feel Requirements

### Visual Tone

The design should communicate:

- quiet confidence
- high-integrity engineering
- architect’s notebook clarity
- trustworthy senior presence

Avoid:

- startup hype styling
- loud gradients or neon
- heavy animations
- gimmicky AI visuals

---

### Layout

- single-column reading flow
- maximum width: ~850px
- generous spacing between sections
- clear hierarchy (title → section → content)

---

### Typography

Typography must be professional and highly readable.

Default font stack:

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
