import { escapeHtml } from '../../../modules/security/security';
import { GitHubClient } from './github';
import { setSelectedProject } from '../../../modules/reactivity/signal-store';

export class ProjectRenderer {
    /**
     * Render only project cards in a vertical stack.
     * @param {HTMLElement} listContainer - Element where project cards should be appended.
     * @param {string[]|string} topics - Topic(s) to filter projects by.
     */
    static async renderProjectsForTopics(listContainer, topics = []) {
        listContainer.textContent = '';

        if (!Array.isArray(topics)) topics = [topics];

        if (!topics.length) {
            listContainer.innerHTML = "<p>No topics specified.</p>";
            return;
        }

        const client = new GitHubClient();
        let repos = [];
        try {
            repos = await client.searchRepositoriesByTopics(topics);
        } catch (err) {
            console.error('Failed to fetch repos from GitHub', err);
            listContainer.innerHTML = "<p>Error fetching projects from GitHub.</p>";
            return;
        }

        if (!repos.length) {
            listContainer.innerHTML = "<p>No projects found.</p>";
            return;
        }

        // Render project cards vertically
        repos.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-title">${escapeHtml(repo.name)}</div>
                <p class="project-summary">${escapeHtml(repo.description || "")}</p>
            `;

            // Add click listener to set the selected project
            card.addEventListener('click', () => {
                setSelectedProject({
                    username: repo.owner.login,
                    repo: repo.name,
                    file: 'story.json', // default
                });
            });

            listContainer.appendChild(card);
        });
    }
}
