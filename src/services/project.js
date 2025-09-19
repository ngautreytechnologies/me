// projectRenderer.js
import { StoryService } from './storyService.js';
import { Utils } from './utils.js';

export class ProjectRenderer {
    static renderProjectsForTag(tagName) {
        const container = document.getElementById("github-projects");
        const detailsContainer = document.getElementById("github-project-details");
        container.textContent = "";
        detailsContainer.textContent = "";

        const filtered = StoryService.allStories.filter(story => story.tags?.some(t => t.name === tagName));
        if (!filtered.length) return container.innerHTML = "<p>No projects in this category.</p>";

        const fragment = document.createDocumentFragment();
        const scrollWrap = document.createElement("div");
        scrollWrap.className = "scrollable-projects";
        scrollWrap.style.display = "flex";
        scrollWrap.style.overflowX = "auto";
        scrollWrap.style.gap = "1rem";
        scrollWrap.style.padding = "1rem 0";

        filtered.forEach(story => {
            const card = document.createElement("div");
            card.className = "project-card";
            card.style.minWidth = "250px";
            card.innerHTML = `<div class="project-title">${Utils.escapeHtml(story.title)}</div>
                              <p class="project-summary">${Utils.escapeHtml(story.summary || "")}</p>`;
            card.addEventListener("click", () => this.showProjectDetails(story));
            scrollWrap.appendChild(card);
        });

        fragment.appendChild(scrollWrap);
        container.appendChild(fragment);
        scrollWrap.firstChild?.click();
    }

    static showProjectDetails(story) {
        const detailsContainer = document.getElementById("github-project-details");
        detailsContainer.textContent = "";
        const cardHtml = document.createElement("div");
        cardHtml.className = "project-detail active";
        cardHtml.innerHTML = `<div class="detail-header">
            <h3>🔧 ${Utils.escapeHtml(story.title)}</h3>
            <div class="project-tags">
            ${story.tags?.map(t => `<span class="tag">${Utils.escapeHtml(t.name)}</span>`).join(" ") || ""}
            </div></div>
            <div class="detail-content">
            <p><strong>Summary:</strong> ${Utils.escapeHtml(story.summary)}</p>
            <p><strong>Problem:</strong> ${Utils.escapeHtml(story.problem_short || story.problem)}</p>
            <p><strong>Solution:</strong> ${Utils.escapeHtml(story.solution_short || story.solution)}</p>
            <h4>Tech specifics:</h4>
            <ul>${story.tech_stack?.map(ts => `<li>${Utils.escapeHtml(ts)}</li>`).join("") || ""}</ul>
            </div>`;
        detailsContainer.appendChild(cardHtml);
    }
}
