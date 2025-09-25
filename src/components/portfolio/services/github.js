import { Config } from '../../../config'
import { RequestPipeline } from '../../../modules/pipeline/request-pipeline';

export class GitHubClient {
    constructor(pipeline) {
        if (pipeline) {
            this.pipeline = pipeline;
        } else {
            // No pipeline steps but how is logger context and logger created
            this.pipeline = new RequestPipeline();
        }
    }

    async searchRepositoriesByTopics(topics = []) {
        if (!Array.isArray(topics) || topics.length === 0) {
            throw new Error("At least one topic is required for search");
        }

        // Use list user repos endpoint to ensure only your repos are fetched
        const url = `https://api.github.com/users/${Config.GITHUB_USERNAME}/repos`;

        const ctx = {
            action: 'github-search-repos',
            url,
            request: {},
            userConsent: true,
            correlationId: crypto.randomUUID()
        };

        await this.pipeline.execute(ctx);

        if (!ctx.response) {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to fetch user repos: ${res.status}`);
            ctx.response = await res.json();
        }

        // Filter by topics locally if needed
        return ctx.response.filter(repo =>
            topics.every(t => repo.topics.includes(t))
        );
    }

    async fetchCodeFile(repoName, filePath, branch = Config.DEFAULT_BRANCH) {
        const url = `https://raw.githubusercontent.com/${Config.GITHUB_USERNAME}/${repoName}/${branch}/${filePath}`;

        const ctx = {
            action: 'github-fetch-code-file',
            url,
            request: {},
            userConsent: true,
            correlationId: crypto.randomUUID()
        };

        await this.pipeline.execute(ctx);

        if (!ctx.response) {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to fetch file: ${filePath}`);
            ctx.response = await res.text();
        }

        return ctx.response;
    }
}
