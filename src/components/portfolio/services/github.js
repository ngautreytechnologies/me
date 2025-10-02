import { Config } from '../../../config';
import { RequestPipeline } from '../../../modules/pipeline/request-pipeline';

export class GitHubClient {
    constructor(pipeline) {
        this.pipeline = pipeline || new RequestPipeline();
    }

    async searchRepositoriesByTopics(topics, prefixes = []) {
        if (!Array.isArray(topics) || topics.length === 0) {
            throw new Error('The `topics` parameter is required and must be a non-empty array.');
        }
        if (!Array.isArray(prefixes)) {
            throw new Error('The `prefixes` parameter must be an array.');
        }

        const url = `https://api.github.com/users/${Config.GITHUB_USERNAME}/repos`;
        const ctx = {
            action: 'github-search-repos',
            url,
            request: {},
            correlationId: crypto.randomUUID(),
        };

        return this.pipeline.execute(ctx, async () => {
            const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } });
            if (!res.ok) throw new Error(`Failed to fetch repos: ${res.status}`);
            const repos = await res.json();

            return repos.filter(repo => {
                const hasTopic = Array.isArray(repo.topics) && topics.some(topic => repo.topics.includes(topic));
                const hasPrefix = prefixes.length === 0 || prefixes.some(prefix => repo.name.startsWith(prefix));
                return hasTopic && hasPrefix;
            });
        });
    }

    async fetchCodeFile(repoName, filePath) {
        const url = `https://raw.githubusercontent.com/${Config.GITHUB_USERNAME}/${repoName}/main/${filePath}`;
        const ctx = {
            action: 'github-fetch-code-file',
            url,
            request: {},
            correlationId: crypto.randomUUID(),
            userConsent: true
        };

        return this.pipeline.execute(ctx, async () => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to fetch file: ${filePath}`);
            return res.text();
        });
    }
}
