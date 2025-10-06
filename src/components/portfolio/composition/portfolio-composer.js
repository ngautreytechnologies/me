import { retryStep } from '../../../modules/resilience/resilience';
import { cacheInLocalStorage } from '../../../modules/storage/storage';
import { RequestPipeline } from '../../../modules/pipeline/request-pipeline';
import { GitHubClient } from '../services/github';
import { ProjectListView } from '../views/project-list-view';
import { subscribeTagsUpdated } from '../../../reactivity';
import { Project } from '../domain/project';

/**
 * PortfolioComposer — feature-level orchestrator
 * - constructs a ProjectListView
 * - fetches repos via GitHubClient (DI-able)
 * - deserialises repos into Project domain objects
 * - applies domain-level filtering / enrichment / annotation
 * - caches processed projects for performance
 */
export class PortfolioComposer {
    #hostRoot;
    #client;
    #view;
    #unsubscribeTags;
    #projectCache = new Map(); // <cacheKey, Project>

    constructor(
        hostRoot,
        {
            containerSelector = '.projects-container',
            templateSelector = '#project-card-template',
            autoScrollOnUpdate = false,
            visibleCount = 2,
            client = null
        } = {}
    ) {
        if (!(hostRoot instanceof ShadowRoot) && !(hostRoot instanceof HTMLElement)) {
            throw new TypeError('PortfolioComposer: hostRoot must be a ShadowRoot or an HTMLElement');
        }

        this.#hostRoot = hostRoot;
        this.#view = new ProjectListView(hostRoot, {
            containerSelector,
            templateSelector,
            autoScrollOnUpdate,
            visibleCount
        });

        // Compose resilient + cached request pipeline
        this.#client =
            client ??
            new GitHubClient(
                new RequestPipeline([
                    retryStep({ retries: 3, delayMs: 200 }),
                    cacheInLocalStorage({
                        storage: localStorage,
                        keyFn: (ctx) => ctx?.url ?? String(Date.now()),
                        ttlMs: 5 * 60 * 1000
                    })
                ])
            );

        // Subscribe to global tag updates
        this.#unsubscribeTags = subscribeTagsUpdated((event) => {
            const topics = event?.topics || [];
            this.renderProjectsForTopics(topics).catch((err) => {
                if (err.name !== 'AbortError') console.error(err);
            });
        });
    }

    /**
     * Fetch, deserialize, filter and render repos.
     * @param {string[]|string} topics
     * @param {Object} [opts]
     * @param {AbortSignal} [opts.signal]
     * @returns {Promise<Array<Project>>}
     */
    async renderProjectsForTopics(topics = [], { signal = null } = {}) {
        if (!Array.isArray(topics)) topics = topics ? [topics] : [];
        topics = topics.filter(Boolean);

        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

        if (topics.length === 0) {
            this.#view.showEmpty('No topics selected.');
            return [];
        }

        this.#view.showLoading();

        try {
            // 🔁 Step 1: Fetch
            const ctx = await this.#client.searchRepositoriesByTopics(
                topics,
                ['codesample', 'portfolio'],
                { signal }
            );
            const repos = Array.isArray(ctx?.result) ? ctx.result : [];

            if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
            if (repos.length === 0) {
                this.#view.showEmpty('No projects found for these topics.');
                return [];
            }

            // 🧠 Step 2: Deserialize -> Project domain (with cache-aware lookup)
            const projects = this.#deserializeRepos(repos);
            console.log('projects', projects);

            // 🪄 Step 3: Render
            this.#view.renderProjects(projects.map((p) => p.toJSON()));

            return projects;
        } catch (err) {
            if (err?.name === 'AbortError') throw err;
            console.error('[PortfolioComposer] Error fetching or rendering projects:', err);
            this.#view.showError('Failed to load projects. Please try again later.');
            throw err;
        }
    }

    /*
    * Efficiently convert raw GitHub repo objects into Project domain objects
    * with caching and minimal allocations.
    * @param {Array<Object>} repos
    * @returns {Array<Project>}
    */
    #deserializeRepos(repos) {
        const projects = new Array(repos.length);

        for (let i = 0; i < repos.length; i++) {
            const repo = repos[i];
            const cached = this.#projectCache.get(repo.id);

            if (cached) {
                projects[i] = cached;
                continue;
            }

            const project = new Project({
                id: repo.id,
                name: repo.name,
                description: repo.description,
                url: repo.html_url,
                stars: repo.stargazers_count,
                topics: repo.topics || [],
                language: repo.language,
                createdAt: repo.created_at
            });

            this.#projectCache.set(repo.id, project);
            projects[i] = project;
        }

        return projects;
    }


    /**
     * Append additional projects (pagination).
     * @param {Array<Project>} projects
     */
    appendProjects(projects = []) {
        if (!Array.isArray(projects)) throw new TypeError('appendProjects expects an array');
        this.#view.appendProjects(projects.map((p) => p.toJSON()));
    }

    /**
     * Clear the view.
     */
    clear() {
        this.#view.clear();
    }

    /**
     * Teardown composer and release references.
     */
    teardown() {
        try {
            this.#view?.teardown?.();
        } catch (e) {
            /* ignore */
        }
        this.#view = null;
        this.#client = null;
        this.#hostRoot = null;
        this.#projectCache.clear();
    }
}
