/**
 * Portfolio Projects Loader + Renderer (Full JSDoc + Best Practices)
 * ------------------------------------------------------------------
 * Modules:
 *   - Config: constants and tuning
 *   - Utils: helpers (escaping, fetch, caching)
 *   - StoryService: loads repos + stories
 *   - ProjectRenderer: renders projects + details
 *   - TagTreeRenderer: renders hierarchical tag tree
 *   - App: bootstrapper
 *
 * Best Practices:
 *   - XSS prevention (escapeHtml on all untrusted input)
 *   - Retry + timeout logic for fetch
 *   - Cache in memory + localStorage
 *   - DOM batching (DocumentFragment)
 *   - Defensive programming (null checks, try/catch)
 *   - Clear separation of concerns
 */

// -------------------- Config --------------------
class Config {
    /** GitHub username where repos are located */
    static GITHUB_USERNAME = "ngautreytechnologies";

    /**
     * Example tag hierarchy.
     * Each tag node may contain:
     *   - name {string} Display name
     *   - summary {string} Short description
     *   - problem {string?} Optional problem statement
     *   - solution {string?} Optional solution statement
     *   - children {TagNode[]} Nested tags
     */
    TAG_HIERARCHY = {
        tags: [
            {
                name: "ML & Predictive Analytics",
                summary: "Machine learning components to enrich and predict telemetry events.",
                problem: "Raw telemetry and operational data lacks insights for proactive action.",
                solution: "Use ML models to detect anomalies, forecast trends, and enrich events.",
                children: [
                    {
                        name: "Anomaly Detection",
                        summary: "Detect unusual patterns in telemetry data.",
                        problem: "Manual monitoring is error-prone and slow.",
                        solution: "Train lightweight ML models to flag anomalies in near real-time."
                    },
                    {
                        name: "Forecasting Models",
                        summary: "Predict trends in energy consumption or operational metrics.",
                        problem: "Teams cannot act on future events without insights.",
                        solution: "Use time-series models to provide actionable predictions."
                    },
                    {
                        name: "Generative Reporting",
                        summary: "Automatically summarize logs, events, or system health.",
                        problem: "Manual reporting is time-consuming and inconsistent.",
                        solution: "Use templated generation to create readable summaries from raw data."
                    }
                ]
            },
            {
                name: "DendriFlow Integration",
                summary: "Enhance workflows with reliable, observable automation.",
                problem: "Manual orchestration leads to slow pipelines and risk of error.",
                solution: "Integrate ML models and enrichment tasks into DendriFlow pipelines.",
                children: [
                    {
                        name: "Event-Driven Pipelines",
                        summary: "Trigger workflows based on S3, DynamoDB, or EventBridge events.",
                        problem: "Polling or manual triggers are inefficient.",
                        solution: "Pipeline steps execute automatically in response to events."
                    },
                    {
                        name: "Sidecar ML Modules",
                        summary: "Run Python ML sidecars alongside C# services for enrichment.",
                        problem: "C# services cannot efficiently handle ML inference.",
                        solution: "Use lightweight sidecars with shared memory or IPC for fast execution."
                    },
                    {
                        name: "Observability & Telemetry",
                        summary: "Monitor pipeline performance, errors, and enrichment activity.",
                        problem: "Invisible pipelines cause silent failures and delays.",
                        solution: "Log actions, emit events, and feed dashboards for proactive monitoring."
                    }
                ]
            },
            {
                name: "Cloud & Data Infrastructure",
                summary: "Robust backbone for scalable, maintainable workflows.",
                problem: "Systems need reliable storage, processing, and orchestration.",
                solution: "Leverage AWS services for event-driven and serverless architecture.",
                children: [
                    {
                        name: "S3 & Data Lakes",
                        summary: "Centralized storage for batch and analytical telemetry data."
                    },
                    {
                        name: "DynamoDB",
                        summary: "Low-latency operational store for enriched telemetry state."
                    },
                    {
                        name: "EventBridge & Step Functions",
                        summary: "Orchestrate events and business workflows reliably."
                    },
                    {
                        name: "Analytics & Visualization",
                        summary: "Athena, Redshift, QuickSight for dashboards and ad-hoc queries."
                    }
                ]
            },
            {
                name: "Programming & Frameworks",
                summary: "Polyglot technologies used to implement DendriFlow pipelines and ML enrichment.",
                children: [
                    { name: "Python", summary: "ML modules, data processing, and sidecars." },
                    { name: "C#", summary: "Service orchestration components when needed." },
                    { name: "TypeScript / JavaScript", summary: "Frontend dashboards, visualizations, and web integrations." },
                    { name: "SQL / NoSQL", summary: "Data storage, retrieval, and operational state." },
                    { name: "Serverless Frameworks", summary: "Lambda / FaaS functions for event-driven tasks." }
                ]
            }

        ]
    };


    /** Max time before a fetch aborts (ms) */
    static FETCH_TIMEOUT = 8000;

    /** Number of retry attempts for failed fetch */
    static MAX_RETRIES = 2;

    /** LocalStorage key for cached stories */
    static STORAGE_KEY = "portfolio_stories_cache_v1";
}

// -------------------- Story Service --------------------
class StoryService {
    /** @type {Array<object>} All loaded stories in memory */
    static allStories = [];

    /** @type {Object<string, object>} Per-repo cache of stories */
    static cache = {};

    /**
     * Load repos and their associated story.json files.
     * Logic:
     *   1. Check localStorage cache first (instant load).
     *   2. If not found, fetch GitHub repos via REST API.
     *   3. For each repo, attempt to fetch `story.json`.
     *   4. Cache successful stories in memory + localStorage.
     *   5. Render tag tree once data is ready.
     * @returns {Promise<void>}
     */
    static async loadReposAndStories() {
        // Try cache first
        const cached = Utils.loadFromStorage();
        if (cached && Array.isArray(cached)) {
            this.allStories = cached;
            TagTreeRenderer.render();
            return;
        }

        try {
            // Fetch repos list
            const repos = await Utils.fetchJson(
                `https://api.github.com/users/${Config.GITHUB_USERNAME}/repos`
            );
            if (!Array.isArray(repos)) throw new Error("Invalid repos response");

            // Parallel load story.json from each repo
            const stories = await Promise.all(
                repos.map(async (repo) => {
                    const storyUrl = `https://raw.githubusercontent.com/${Config.GITHUB_USERNAME}/${repo.name}/main/story.json`;
                    const story = await Utils.fetchJson(storyUrl);
                    if (story) {
                        this.cache[repo.name] = story;
                        return story;
                    }
                    return null;
                })
            );

            // Filter nulls and store
            this.allStories = stories.filter(Boolean);
            Utils.saveToStorage(this.allStories);

            // Render UI
            TagTreeRenderer.render();
        } catch (err) {
            console.error("Failed to load repos/stories", err);
        }
    }
}

// -------------------- Project Renderer --------------------
class ProjectRenderer {
    /**
     * Render projects filtered by tag.
     * Logic:
     *   - Clear project + details containers.  
     *   - Filter stories by selected tag.
     *   - Create a horizontal scrollable list of cards.
     *   - On card click, show project details.
     *   - Auto-select first card.
     * @param {string} tagName - Tag to filter stories
     * @returns {void}
     */
    static renderProjectsForTag(tagName) {
        const container = document.getElementById("github-projects");
        const detailsContainer = document.getElementById("github-project-details");
        container.textContent = "";
        detailsContainer.textContent = "";

        // Filter stories that include tag
        const filtered = StoryService.allStories.filter((story) =>
            story.tags?.some((t) => t.name === tagName)
        );

        if (!filtered.length) {
            container.innerHTML = "<p>No projects in this category.</p>";
            return;
        }

        const fragment = document.createDocumentFragment();
        const scrollWrap = document.createElement("div");
        scrollWrap.className = "scrollable-projects";
        scrollWrap.style.display = "flex";
        scrollWrap.style.overflowX = "auto";
        scrollWrap.style.gap = "1rem";
        scrollWrap.style.padding = "1rem 0";

        filtered.forEach((story) => {
            const card = document.createElement("div");
            card.className = "project-card";
            card.style.minWidth = "250px";
            card.innerHTML = `
            <div class="project-title">${Utils.escapeHtml(story.title)}</div>
            <p class="project-summary">${Utils.escapeHtml(story.summary || "")}</p>
        `;
            card.addEventListener("click", () =>
                this.showProjectDetails(story)
            );
            scrollWrap.appendChild(card);
        });

        fragment.appendChild(scrollWrap);
        container.appendChild(fragment);

        // Auto-show first project
        scrollWrap.firstChild?.click();
    }

    /**
     * Show detailed information about a single project.
     * @param {object} story - Project story object
     * @returns {void}
     */
    static showProjectDetails(story) {
        const detailsContainer = document.getElementById("github-project-details");
        detailsContainer.textContent = "";

        const cardHtml = document.createElement("div");
        cardHtml.className = "project-detail active";
        cardHtml.innerHTML = `
        <div class="detail-header">
            <h3>🔧 ${Utils.escapeHtml(story.title)}</h3>
            <div class="project-tags">
            ${story.tags
                ?.map((t) => `<span class="tag">${Utils.escapeHtml(t.name)}</span>`)
                .join(" ") || ""}
            </div>
        </div>
        <div class="detail-content">
            <p><strong>Summary:</strong> ${Utils.escapeHtml(story.summary)}</p>
            <p><strong>Problem:</strong> ${Utils.escapeHtml(story.problem_short || story.problem)}</p>
            <p><strong>Solution:</strong> ${Utils.escapeHtml(story.solution_short || story.solution)}</p>
            <h4>Tech specifics:</h4>
            <ul>${story.tech_stack
                ?.map((ts) => `<li>${Utils.escapeHtml(ts)}</li>`)
                .join("") || ""
            }</ul>
        </div>
        `;
        detailsContainer.appendChild(cardHtml);
    }
}

// -------------------- App Bootstrap --------------------
class App {
    /**
     * Application entry point.
     * Loads stories and triggers first render.
     */
    static init() {
        StoryService.loadReposAndStories();
    }
}

// Run once DOM is fully parsed
document.addEventListener("DOMContentLoaded", App.init);
