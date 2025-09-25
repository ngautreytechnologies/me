import { escapeHtml } from '../../../modules/security/security';
import { GitHubClient } from './github';

export class ProjectRenderer {

    /**
     * Renders projects for the given topics into a container element.
     * @param {HTMLElement} listContainer - Element where the project cards should be rendered.
     * @param {HTMLElement} detailsContainer - Element where the project details will show.
     * @param {string[]|string} topics - Topic(s) to filter projects by.
     */
    static async renderProjectsForTopics(listContainer, detailsContainer, topics = []) {
        listContainer.textContent = '';
        detailsContainer.textContent = '';

        // Ensure topics is an array
        if (!Array.isArray(topics)) topics = [topics];

        if (!topics.length) {
            listContainer.innerHTML = "<p>No topics specified.</p>";
            return;
        }

        const client = new GitHubClient(); // assume no pipeline needed, or inject as needed
        let repos = [];
        try {
            repos = await client.searchRepositoriesByTopics(topics);
        } catch (err) {
            console.error('Failed to fetch repos from GitHub', err);
            listContainer.innerHTML = "<p>Error fetching projects from GitHub.</p>";
            return;
        }

        if (!repos.length) {
            listContainer.innerHTML = "<p>No projects found for this combination.</p>";
            return;
        }

        const scrollWrap = document.createElement('div');
        scrollWrap.className = 'scrollable-projects';
        scrollWrap.style.display = 'flex';
        scrollWrap.style.overflowX = 'auto';
        scrollWrap.style.gap = '1rem';
        scrollWrap.style.padding = '1rem 0';

        repos.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.style.minWidth = '250px';
            card.innerHTML = `
                <div class="project-title">${escapeHtml(repo.name)}</div>
                <p class="project-summary">${escapeHtml(repo.description || "")}</p>
            `;
            card.addEventListener('click', () => this.showProjectDetails(detailsContainer, repo));
            scrollWrap.appendChild(card);
        });

        listContainer.appendChild(scrollWrap);
        scrollWrap.firstChild?.click();
    }

    /**
     * Displays full details for a single project.
     * @param {HTMLElement} detailsContainer 
     * @param {object} repo 
     */
    static showProjectDetails(detailsContainer, repo) {
        detailsContainer.innerHTML = "";

        const cardHtml = document.createElement("div");
        cardHtml.className = "project-detail active";

        cardHtml.innerHTML = `
            <div class="detail-header">
                <h3>🔧 ${escapeHtml(repo.name)}</h3>
                <div class="project-tags">
                    ${repo.topics?.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join(" ") || ""}
                </div>
            </div>

            <div class="detail-content">
                <p><strong>Description:</strong> ${escapeHtml(repo.description || "N/A")}</p>
                <p><strong>Stars:</strong> ${repo.stargazers_count || 0}</p>
                <p><strong>Forks:</strong> ${repo.forks_count || 0}</p>
                ${repo.language ? `<p><strong>Language:</strong> ${escapeHtml(repo.language)}</p>` : ""}
                <div class="repo-link">
                    <a href="${escapeHtml(repo.html_url)}" target="_blank">🔗 View Repository</a>
                </div>
            </div>
        `;

        detailsContainer.appendChild(cardHtml);
    }
}
