# 🎼 Adaptive Portfolio Platform — Experimental Orchestral Architecture

> **Note:** This repository is a job-ready portfolio site implemented in vanilla JavaScript. It intentionally includes an experimental orchestral pattern and small client-side intelligence (knowledge graph + optional AI enrichment) to demonstrate modular architecture and adaptive UI/UX.

---

## 1 — Executive summary

A modular, client-side portfolio application that demonstrates:

- explicit architectural separation (Maestro → Orchestrator → Composer → Musician → Instrument → Stage → Performance),
- a lightweight dependency injection composition root,
- a small in-browser knowledge graph for personalization,
- feasible client-side AI integration modes (heuristics, edge ML, hybrid remote LLM with caching),
- testable components and predictable lifecycles.

This codebase is organized for maintainability, testability, and experimentation while remaining a fully functional portfolio.

---

## 2 — Feature summary

| Feature                 | Description                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| Orchestral architecture | Clear separation of responsibilities for composition and execution.                                     |
| Dependency injection    | Single composition root (`stage.config.js`) with singleton/transient/scoped lifecycles.                 |
| Knowledge graph         | Small local graph (IndexedDB) storing interaction signals for ranking and personalization.              |
| AI integration          | Heuristics, optional edge ML (TF.js/WebNN), and optional remote LLM enrichments with caching/fallbacks. |
| Adaptive UI             | Project cards reorder/adjust emphasis based on signals and enrichment.                                  |
| Testability             | Unit tests for DI, musicians, composers; DOM tests for performances.                                    |
| Offline/Privacy         | Default local-only storage and optional remote enrichment (configured separately).                      |

---

## 3 — Concept definitions

| Term                           | Definition                                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Maestro (Composition Root)** | Startup module that registers services and configures the DI container. Implementation: `maestro/stage.config.js`.                                |
| **Orchestrator**               | Flow controller that sequences data retrieval, enrichment, and rendering. Example: `orchestrators/ProjectOrchestrator.js`.                        |
| **Composer**                   | Prepares and normalizes domain data, decides enrichment needs, builds view models. Example: `composers/ProjectComposer.js`.                       |
| **Musician**                   | Domain worker/service executing concrete tasks (fetch, ML inference, graph computations). Example: `musicians/RepoMusician.js`, `AIAnnotator.js`. |
| **Instrument**                 | Low-level client/utility used by musicians (HTTP client, LLM wrapper, IndexedDB graph API). Example: `instruments/HttpClient.js`.                 |
| **Stage (Component)**          | UI container that mounts performances and manages DOM lifecycle. Example: `stages/ProjectCardComponent.js`.                                       |
| **Performance (View)**         | Renderer that produces DOM fragments from view models and wires interactions. Example: `performances/ProjectCardPerformance.js`.                  |
| **Knowledge graph**            | In-browser relational store of interactions (viewed, clicked, tagged) persisted to IndexedDB and used as signals.                                 |

---

## 4 — Architecture mapping & responsibilities

| Layer            | Responsibilities                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Maestro**      | Compose system at startup, register dependencies in the DI container, select environment-specific implementations. |
| **Orchestrator** | Control execution flow, handle retries/timeouts, coordinate composers → musicians → performances.                  |
| **Composer**     | Normalize raw data, determine enrichment needs, assemble final view model.                                         |
| **Musician**     | Execute domain tasks (fetch, transform, infer), interact with instruments and graph, return structured results.    |
| **Instrument**   | Implement transport, storage, and model interfaces (HTTP, IndexedDB, LLM clients).                                 |
| **Stage**        | Manage DOM insertion/removal and host context for performances.                                                    |
| **Performance**  | Render view models, bind event handlers, emit interaction events to graph or composers.                            |

---

## 5 — Knowledge graph (design & usage)

| Topic                  | Details                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| **Purpose**            | Store lightweight relational signals in-browser to inform ranking and personalization.             |
| **Node types**         | `project:{id}`, `session:{id}`, `tag:{name}`                                                       |
| **Edge types**         | `viewed(session→project, timestamp)`, `clicked(session→project, timestamp)`, `tagged(project→tag)` |
| **Node attributes**    | `count`, `lastSeen` (timestamp), `score` (computed ranking weight)                                 |
| **Primary storage**    | **IndexedDB** — async, persistent, suitable for structured data and larger payloads.               |
| **Working cache**      | In-memory map for fast reads during a session; reconcile to IndexedDB periodically.                |
| **Read patterns**      | Musicians compute recency, frequency, co-occurrence, and derived scores for ranking.               |
| **Write patterns**     | Performances emit event writes; composers or musicians may batch/aggregate writes.                 |
| **Pruning/compaction** | Aggregate raw events into counts periodically; prune raw logs beyond retention threshold.          |
| **Privacy**            | Data remains local by default. Provide a clear/reset operation and opt-in telemetry if necessary.  |

---

## 6 — AI integration (modes & patterns)

### Integration modes

| Mode                    | Summary                                                                        | Pros                                     | Cons                                 |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------------------------------- | ------------------------------------ |
| **Heuristics-only**     | Rule-based scoring using graph metrics (recency, frequency, co-occurrence)     | Fast, deterministic, zero external cost  | Less semantically rich than ML/LLM   |
| **Edge ML (on-device)** | Small TF.js or WebNN models for lightweight classification                     | Preserves privacy, low-latency inference | Increases bundle size and complexity |
| **Remote LLM (hybrid)** | Remote large models for richer summarization/annotation; cache results locally | High-quality outputs; offload compute    | Latency, cost, privacy tradeoffs     |

### Enrichment flow

| Step | Actor               | Action                                                        |
| ---- | ------------------- | ------------------------------------------------------------- |
| 1    | Composer            | Determines enrichment need (e.g., missing/stale summary).     |
| 2    | Composer → Musician | Calls `AIAnnotator` or enrichment musician.                   |
| 3    | Musician            | Checks graph/cache for cached enrichment.                     |
| 4    | Musician            | If missing/stale: runs local model or calls `LLMClient`.      |
| 5    | Musician            | Stores summary/score in graph (IndexedDB) and returns result. |
| 6    | Composer            | Builds final view model and hands it to performance.          |

### Fallback & caching strategy

| Condition                | Action                                    |
| ------------------------ | ----------------------------------------- |
| Cached enrichment exists | Use cached data; avoid remote call.       |
| Remote LLM unavailable   | Fall back to heuristics or edge model.    |
| Remote call successful   | Persist result to graph for future reuse. |

---

## 7 — Dependency injection & lifecycles

| Capability                | Description                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| **Registration types**    | Class, factory, value.                                                                         |
| **Lifecycles**            | `singleton`: one instance; `transient`: new each resolve; `scoped`: per created scope.         |
| **Recommended mapping**   | Instruments → `singleton`; Musicians → `singleton` or `transient`; Performances → `transient`. |
| **Constructor injection** | Prefer explicit constructor parameters for clarity and testability.                            |
| **Scope usage**           | Use scoped containers for isolated per-stage or per-session dependencies.                      |

**Example registration**

```js
container.registerClass('HttpClient', HttpClient, 'singleton');
container.registerClass('RepositoryMusician', RepoMusician, 'singleton');
container.registerClass('AIAnnotator', AIAnnotator, 'transient');
container.registerFactory('ProjectCardPerformance', () => {
  const template = document.querySelector('#project-card-template');
  return new ProjectCardPerformance({ template });
}, 'transient');
