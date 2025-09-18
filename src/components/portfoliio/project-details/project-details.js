import BaseShadowComponent from '../../base-shadow-component.js';
import templateHtml from './project-details.html';
import css from './project-details.css';
import { subscribeSelectedSkill } from '../../../utils/signal-store.js';
import { data } from '../data.js';
import { removeElements } from '../../../utils/dom.js';

class ProjectDetails extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
    }

    connectedCallback() {
        this.renderData([data[0]]);
        super.connectedCallback();

        // Subscribe to selected project
        subscribeSelectedSkill(selectedSkill => {
            if (!selectedSkill) {
                console.log('[SkillDetails] No project selected');
                this.renderData([]); // clear
                return;
            }
            console.log('[SkillDetails] Selected project:', selectedSkill);

            const project = data.find(s => s.id.toLowerCase() === selectedSkill.id.toLowerCase());
            if (!project) {
                console.warn('[SkillDetails] Skill not found:', selectedSkill.id);
                this.renderData([]); // clear
                return;
            }
            console.log('[SkillDetails] Rendering project details for:', project);

            this.renderData([project]);
        });
    }

    // Extend the base renderData for tags and keyFeatures only
    renderData(items) {

        if (!items || items.length === 0) return;
        // We only expect one item for details -- default to the first
        const project = items[0];

        super.renderData([project]); // populate standard [data-field] fields

        // Render tags
        const tagsContainer = this.root.querySelector('.project-details-tags');
        if (tagsContainer && project.tags?.length) {
            tagsContainer.innerHTML = '';
            removeElements(tagsContainer, 'template');
            project.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = tag;
                tagsContainer.appendChild(span);
            });
        }

        // Render key features
        const featuresSlot = this.root.querySelector('slot[name="keyFeatures"]');
        if (featuresSlot && project.keyFeatures) {
            const container = document.createElement('div');
            container.innerHTML = project.keyFeatures;
            featuresSlot.replaceWith(container);
        }
    }
}

customElements.define('project-details', ProjectDetails);
