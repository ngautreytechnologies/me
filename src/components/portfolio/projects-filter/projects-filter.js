import BaseShadowComponent from '../../base-shadow-component';
import templateHtml from './projects-filter.html';
import css from './projects-filter.css';
import { tags } from '../data';
import { ProjectRenderer } from '../services/project';

export default class ProjectsFilter extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
        this.selectedCards = new Set(); // track multiple selected cards
    }

    connectedCallback() {
        super.connectedCallback();
        super.triggerTemplateRender(tags);
    }

    renderTemplateData(items, containerSelector = '[data-container]') {
        super.renderTemplateData(items, containerSelector);

        const cards = this.root.querySelectorAll('.tag-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const tag = items.find(t => t.id === card.id);
                if (!tag) return;

                // toggle selection
                if (this.selectedCards.has(card)) {
                    card.classList.remove('active');
                    this.selectedCards.delete(card);
                } else {
                    card.classList.add('active');
                    this.selectedCards.add(card);
                }

                // collect all selected topics (or ids)
                const selectedTopics = Array.from(this.selectedCards).map(c => {
                    const t = items.find(i => i.id === c.id);
                    return t?.topics || t?.id; // fallback to id if no topics
                }).flat();

                // render filtered projects
                const listContainer = document.querySelector('#projects-list');
                ProjectRenderer.renderProjectsForTopics(listContainer, selectedTopics);
            });
        });
    }
}

customElements.define('projects-filter', ProjectsFilter);
