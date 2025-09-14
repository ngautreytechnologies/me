// Javascript
import './components/certifications/certifications.js';
import './components/education/education.js';
import './components/experience/experience.js';
import './components/header/header.js';
import './components/navbar/navbar.js';
import './components/summary/summary.js';

// CSS
import './styles/base.css';
import './styles/animations.css';
import './styles/typography.css';

document.addEventListener("DOMContentLoaded", async () => {
    const skillTree = document.querySelector("skill-tree");
    const projectList = document.querySelector("project-list");
    const projectDetail = document.querySelector("project-detail");

    // Load stories
    // await StoryService.loadReposAndStories();

    skillTree.addEventListener("tagSelected", async e => {
        const tag = e.detail;
        const filtered = StoryService.allStories.filter(s => s.tags?.some(t => t.name === tag));
        projectList.projects = filtered.length ? filtered : [{ title: "No projects found", summary: "" }];
    });

    projectList.addEventListener("projectSelected", e => {
        projectDetail.project = e.detail;
    });
});
