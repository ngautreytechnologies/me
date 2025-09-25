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

    async searchRepositoriesByTopics() {
        const url = `https://api.github.com/users/${Config.GITHUB_USERNAME}/repos`;

        // Fetch all repos
        const res = await fetch(url, {
            headers: { 'Accept': 'application/vnd.github+json' }
        });
        if (!res.ok) throw new Error(`Failed to fetch repos: ${res.status}`);
        const repos = await res.json();

        // Filter by name prefixes using for loop
        const filteredRepos = [];
        for (let i = 0; i < repos.length; i++) {
            const repo = repos[i];
            if (repo.name.startsWith('portfolio') || repo.name.startsWith('codesample')) {
                filteredRepos.push(repo);
                break; // stop checking other prefixes for this repo
            }
        }

        return filteredRepos;

    }

    async fetchCodeFile(repoName, filePath) {
        const url = `https://raw.githubusercontent.com/${Config.GITHUB_USERNAME}/${repoName}/main/${filePath}`;

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
