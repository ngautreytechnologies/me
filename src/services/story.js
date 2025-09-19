// storyService.js
import { Config } from './config.js';
import { Utils } from './utils.js';
import { TagTreeRenderer } from './tagTreeRenderer.js';

export class StoryService {
    static allStories = [];
    static cache = {};

    static async loadReposAndStories() {
        const cached = Utils.loadFromStorage();
        if (cached?.length) {
            this.allStories = cached;
            TagTreeRenderer.render();
            return;
        }

        try {
            const repos = await Utils.fetchJson(`https://api.github.com/users/${Config.GITHUB_USERNAME}/repos`);
            if (!Array.isArray(repos)) throw new Error("Invalid repos response");

            const stories = await Promise.all(repos.map(async (repo) => {
                const storyUrl = `https://raw.githubusercontent.com/${Config.GITHUB_USERNAME}/${repo.name}/main/story.json`;
                const story = await Utils.fetchJson(storyUrl);
                if (story) this.cache[repo.name] = story;
                return story;
            }));

            this.allStories = stories.filter(Boolean);
            Utils.saveToStorage(this.allStories);
            TagTreeRenderer.render();
        } catch (err) { console.error("Failed to load repos/stories", err); }
    }
}
