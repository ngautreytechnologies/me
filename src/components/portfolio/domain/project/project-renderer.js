import { retryStep } from '../../../../modules/resilience/resilience';
import { cacheInLocalStorage } from '../../../../modules/storage/storage';
import { RequestPipeline } from '../../../../modules/pipeline/request-pipeline';
import { GitHubClient } from '../../services/github';
import { ProjectListView } from '../../views/project-list-view';

/**
 * ProjectRenderer — coordinates data fetching and delegates rendering to ProjectListView.
 * - Keeps DOM logic inside views (SRP)
 * - Supports AbortSignal for cancellable renders
 * - Uses a single pipeline & client instance (created or injected)
 */
export class ProjectRenderer {
    #hostEl;
    #listView;
    #client;
    #logger;

    /**
     * @param {HTMLElement} hostEl - Custom element instance (must have shadowRoot)
     * @param {Object} [opts]
     * @param {GitHubClient} [opts.client] - optional GitHubClient instance for DI (testable)
     * @param {function(...any):void} [opts.logger] - optional logger function
     */
    constructor(hostEl, { client = null, logger = null } = {}) {
        if (!hostEl || !(hostEl instanceof HTMLElement) || !hostEl.shadowRoot) {
            throw new TypeError('[ProjectRenderer] hostEl must be a custom element with a shadowRoot');
        }

        this.#hostEl = hostEl;
        this.#logger = typeof logger === 'function' ? logger : (...args) => console.debug('[ProjectRenderer]', ...args);

        // view layer — responsible for DOM only (SRP)
        this.#listView = new ProjectListView(hostEl);

        // allow injecting a client (useful for tests); otherwise create one with a single shared pipeline
        if (client) {
            this.#client = client;
        } else {
            const pipeline = new RequestPipeline([
                retryStep({ retries: 3, delayMs: 200 }),
                cacheInLocalStorage({
                    storage: localStorage,
                    keyFn: (ctx) => ctx?.url ?? String(Date.now()),
                    ttlMs: 5 * 60 * 1000
                })
            ]);
            this.#client = new GitHubClient(pipeline);
        }
    }

    /**
     * Fetch repositories matching topics and render them via the view.
     * Returns the array of repositories (empty array if none).
     *
     * @param {string[]|string} topics
     * @param {Object} [opts]
     * @param {AbortSignal} [opts.signal] - optional AbortSignal to cancel fetch/render
     * @returns {Promise<Array<object>>} repos
     */
    async renderProjectsForTopics(topics = [], { signal = null } = {}) {
        this.#logger('renderProjectsForTopics start', { topics });

        // normalize topics
        if (!Array.isArray(topics)) topics = topics ? [topics] : [];
        topics = topics.filter(Boolean);

        if (signal?.aborted) {
            // consistent behaviour when already aborted
            const abortErr = new DOMException('Aborted', 'AbortError');
            this.#logger('render cancelled before start (signal aborted)');
            throw abortErr;
        }

        if (!topics.length) {
            this.#logger('No topics specified — showing no results');
            this.#listView.showEmpty('No topics selected.');
            return [];
        }

        // show loading state in the view
        this.#listView.showLoading();

        try {
            const maybePromise = this.#client.searchRepositoriesByTopics(topics, [
                'codesample', 'portfolio'
            ], { signal }).catch(err => { throw err; });

            // await while allowing cancellation check after
            const ctx = await maybePromise;
            const repos = ctx.result;

            if (signal?.aborted) {
                const abortErr = new DOMException('Aborted', 'AbortError');
                this.#logger('render aborted after fetch');
                throw abortErr;
            }

            if (!Array.isArray(repos) || repos.length === 0) {
                this.#logger('No repositories found for topics', topics);
                this.#listView.showEmpty('No projects found for these topics.');
                return [];
            }

            // Delegate DOM rendering to the view (keeps renderer focused on data)
            this.#listView.renderProjects(repos);

            this.#logger(`Rendered ${repos.length} repositories`);
            return repos;
        } catch (err) {
            // Distinguish aborts from other errors
            if (err?.name === 'AbortError') {
                this.#logger('Render aborted (AbortError)');
                // Let caller handle abort; do not show a permanent error state
                throw err;
            }

            // Log and present a friendly error in the view
            console.error('[ProjectRenderer] Error fetching or rendering projects:', err);
            this.#listView.showError('Failed to load projects.');

            // Rethrow so higher-level orchestrators can also react (retry, metrics, etc.)
            throw err;
        }
    }
}
