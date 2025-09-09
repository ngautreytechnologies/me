/**
 * Portfolio Projects Loader + Renderer (Modular)
 * ----------------------------------------------
 * - Fetches GitHub repos & story.json files
 * - Builds a hierarchical tag tree
 * - Renders project cards & detailed view
 * 
 * Best Practices Applied:
 *  - Single Responsibility Principle (SRP)
 *  - Encapsulation via classes
 *  - Static utility functions for helpers
 *  - Clear separation of concerns (data vs UI)
 *  - Defensive coding (null checks, error handling)
 */

// -------------------- Config --------------------
class Config {
    /**
     * GitHub username for fetching repos.
     * Replace with your own GitHub handle.
     */
    static GITHUB_USERNAME = "ngautreytechnologies";

    /**
     * Hierarchical tag metadata used to render skill tree.
     * Provides summaries, problems, and solutions for context.
     */
    static TAG_HIERARCHY = {
        tags: [
            // Example tree structure (trimmed for brevity)
            {
                name: "AI",
                summary: "Artificial intelligence applied to telemetry.",
                problem: "Raw telemetry lacks contextual insights.",
                solution: "Apply ML models for anomaly detection and enrichment.",
                children: [
                    {
                        name: "ML",
                        summary: "Machine learning models running in a sidecar.",
                        problem: "Need near real-time enrichment for telemetry data.",
                        solution: "Run lightweight models in Python sidecar via shared memory.",
                        children: [
                            {
                                name: "AI ML Sidecar",
                                summary: "Sidecar enrichment microservice.",
                                problem: "C# service cannot handle ML workloads efficiently.",
                                solution: "Offload ML to colocated Python container with fast IPC."
                            }
                        ]
                    }
                ]
            }
        ]
    };
}

// -------------------- Utilities --------------------
class Utils {
    /**
     * Escapes unsafe HTML characters to prevent XSS.
     * @param {string} str - Raw string that may contain unsafe HTML
     * @returns {string} - Sanitized string safe for innerHTML
     */
    static escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

// -------------------- Story Service --------------------
class StoryService {
    /** @type {Array<Object>} - Cached list of all loaded stories */
    static allStories = [];

    /** @type {Object<string, Object>} - Cache by repo name */
    static cache = {};

    /**
     * Fetch GitHub repos and load `story.json` for each repo.
     * Populates `allStories` and triggers tag tree rendering.
     */
    static async loadReposAndStories() {
        try {
            const response = await fetch(`https://api.github.com/users/${Config.GITHUB_USERNAME}/repos`);
            const repos = await response.json();

            const stories = [];
            for (const repo of repos) {
                try {
                    const storyUrl = `https://raw.githubusercontent.com/${Config.GITHUB_USERNAME}/${repo.name}/main/story.json`;
                    const storyResponse = await fetch(storyUrl);
                    if (!storyResponse.ok) continue; // Skip repos without story.json

                    const story = await storyResponse.json();
                    this.cache[repo.name] = story;
                    stories.push(story);
                } catch (err) {
                    console.warn(`Failed to load story.json for ${repo.name}`, err);
                }
            }

            this.allStories = stories;
            TagTreeRenderer.render(); // Refresh UI after data load
        } catch (err) {
            console.error("Failed to load GitHub repos", err);
        }
    }
}

// -------------------- Project Renderer --------------------
class ProjectRenderer {
    /**
     * Render project cards for a given tag.
     * @param {string} tagName - The tag to filter stories by
     */
    static renderProjectsForTag(tagName) {
        const container = document.getElementById("github-projects");
        const detailsContainer = document.getElementById("github-project-details");
        container.innerHTML = '';
        detailsContainer.innerHTML = '';

        // Filter stories by tag
        const filtered = StoryService.allStories.filter(story =>
            story.tags?.some(t => t.name === tagName)
        );

        if (!filtered.length) {
            container.innerHTML = '<p>No projects in this category.</p>';
            return;
        }

        // Scrollable card container
        const scrollWrap = document.createElement('div');
        scrollWrap.className = 'scrollable-projects';
        scrollWrap.style.display = 'flex';
        scrollWrap.style.overflowX = 'auto';
        scrollWrap.style.gap = '1rem';
        scrollWrap.style.padding = '1rem 0';

        // Create project cards
        filtered.forEach(story => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.style.minWidth = '250px';
            card.innerHTML = `
        <div class="project-title">${Utils.escapeHtml(story.title)}</div>
        <p class="project-summary">${Utils.escapeHtml(story.summary || '')}</p>
      `;
            card.addEventListener('click', () => this.showProjectDetails(story));
            scrollWrap.appendChild(card);
        });

        container.appendChild(scrollWrap);

        // Auto-select first project for better UX
        const first = scrollWrap.querySelector('.project-card');
        if (first) first.click();
    }

    /**
     * Render the detail view for a given project.
     * @param {Object} story - Story metadata
     */
    static showProjectDetails(story) {
        const detailsContainer = document.getElementById("github-project-details");
        detailsContainer.innerHTML = '';

        const cardHtml = document.createElement('div');
        cardHtml.className = 'project-detail active';
        cardHtml.innerHTML = `
      <div class="detail-header">
        <h3>🔧 ${Utils.escapeHtml(story.title)}</h3>
        <div class="project-tags">
          ${story.tags?.map(t => `<span class="tag">${Utils.escapeHtml(t.name)}</span>`).join(' ') || ''}
        </div>
      </div>
      <div class="detail-content">
        <p><strong>Summary:</strong> ${Utils.escapeHtml(story.summary)}</p>
        <p><strong>Problem:</strong> ${Utils.escapeHtml(story.problem_short || story.problem)}</p>
        <p><strong>Solution:</strong> ${Utils.escapeHtml(story.solution_short || story.solution)}</p>
        <h4>Tech specifics:</h4>
        <ul>${story.tech_stack?.map(ts => `<li>${Utils.escapeHtml(ts)}</li>`).join('') || ''}</ul>
      </div>
    `;
        detailsContainer.appendChild(cardHtml);
    }
}

// -------------------- Tag Tree Renderer --------------------
class TagTreeRenderer {
    /**
     * Recursively builds a tree of tags.
     * @param {HTMLElement} container - The parent DOM element
     * @param {Array<Object>} nodes - List of tag nodes
     */
    static createTree(container, nodes) {
        nodes.forEach(node => {
            const skillNode = document.createElement('div');
            skillNode.className = 'skill-node';

            const badge = document.createElement('span');
            badge.className = 'tag-badge';
            badge.textContent = node.name;
            badge.title = `${node.summary || ''}\n${node.problem || ''}\n${node.solution || ''}`;
            skillNode.appendChild(badge);

            // Leaf node → render projects
            if (!node.children || node.children.length === 0) {
                badge.addEventListener('click', () => ProjectRenderer.renderProjectsForTag(node.name));
            }

            // Nested children → expandable
            if (node.children && node.children.length) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'children';
                this.createTree(childrenContainer, node.children);
                skillNode.appendChild(childrenContainer);

                // Expand/collapse toggle
                badge.addEventListener('click', () => {
                    skillNode.classList.toggle('expanded');
                });
            }

            container.appendChild(skillNode);
        });
    }

    /**
     * Render the root tag tree in the #skill-tree container.
     */
    static render() {
        const container = document.getElementById('skill-tree');
        container.innerHTML = '';
        this.createTree(container, Config.TAG_HIERARCHY.tags);
    }
}

// -------------------- App Bootstrap --------------------
class App {
    /**
     * Initializes the app:
     * - Loads repos & stories
     * - Renders initial tag tree
     */
    static init() {
        StoryService.loadReposAndStories();
    }
}

// Fire off the app when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
