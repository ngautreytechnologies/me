import { Config } from '../../../../config';
import { RequestPipeline } from '../../../../modules/pipeline/request-pipeline';

export class GitHubService {
    /**
     * @param {RequestPipeline} [pipeline]
     */
    constructor(pipeline) {
        this.pipeline = pipeline || new RequestPipeline();
    }

    /**
     * Search for repositories by topic(s) and optional name prefixes.
     *
     * @param {string[]} topics - Required list of topics.
     * @param {string[]} [prefixes=[]] - Optional list of allowed prefixes.
     * @param {object} [options]
     * @param {AbortSignal} [options.signal] - AbortSignal for cancellation.
     * @returns {Promise<object[]>}
     */
    async searchRepositoriesByTopics(topics, prefixes = ['codesample', 'portfolio'], { signal } = {}) {
        if (!Array.isArray(topics) || topics.length === 0) {
            throw new Error('[GitHubClient] `topics` must be a non-empty array.');
        }
        if (!Array.isArray(prefixes)) {
            throw new Error('[GitHubClient] `prefixes` must be an array.');
        }

        const url = `https://api.github.com/users/${Config.GITHUB_USERNAME}/repos`;
        const ctx = {
            action: 'github-search-repos',
            url,
            correlationId: crypto.randomUUID(),
        };

        return this.pipeline.execute(ctx, async () => {
            const res = await fetch(url, {
                headers: { 'Accept': 'application/vnd.github+json' },
                signal,
            });

            if (!res.ok) {
                throw new Error(`[GitHubClient] Failed to fetch repos: ${res.status} ${res.statusText}`);
            }

            const repos = await res.json();
            if (!Array.isArray(repos)) {
                throw new Error('[GitHubClient] Unexpected API response: expected an array.');
            }

            // ✅ Precompute filters for performance
            const topicSet = new Set(topics);
            const filterByTopics = (repo) =>
                Array.isArray(repo.topics) && repo.topics.some((t) => topicSet.has(t));

            const filterByPrefix =
                prefixes.length === 0
                    ? () => true
                    : (repo) => prefixes.some((prefix) => repo.name.startsWith(prefix));

            return repos.filter((repo) => filterByTopics(repo) && filterByPrefix(repo));
        });
    }

    /**
     * Fetch a specific code file from a GitHub repository.
     *
     * @param {string} repoName - Repository name.
     * @param {string} filePath - Relative path to the file (inside `main` branch).
     * @param {object} [options]
     * @param {AbortSignal} [options.signal] - AbortSignal for cancellation.
     * @returns {Promise<string>}
     */
    async fetchCodeFile(repoName, filePath, { signal } = {}) {
        if (!repoName || !filePath) {
            throw new Error('[GitHubClient] `repoName` and `filePath` are required.');
        }

        const url = `https://raw.githubusercontent.com/${Config.GITHUB_USERNAME}/${repoName}/main/${filePath}`;
        const ctx = {
            action: 'github-fetch-code-file',
            url,
            correlationId: crypto.randomUUID(),
            userConsent: true,
        };

        return this.pipeline.execute(ctx, async () => {
            const res = await fetch(url, { signal });
            if (!res.ok) {
                throw new Error(`[GitHubClient] Failed to fetch file (${filePath}): ${res.status} ${res.statusText}`);
            }
            return res.text();
        });
    }
}
