import BaseShadowComponent from '../../base-shadow-component.js';
import templateHtml from './skill-details.html';
import css from './skill-details.css';
import { subscribeSelectedSkill } from '../../../utils/signal-store.js';
import { data } from '../data.js';
import { removeElements } from '../../../utils/dom.js';

class SkillDetails extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
    }

    connectedCallback() {
        this.renderTemplateData([data[0]]);
        super.connectedCallback();

        // Subscribe to selected skill
        subscribeSelectedSkill(selectedSkill => {
            if (!selectedSkill) {
                console.log('[SkillDetails] No skill selected');
                this.renderTemplateData([]); // clear
                return;
            }
            console.log('[SkillDetails] Selected skill:', selectedSkill);

            const skill = data.find(s => s.id.toLowerCase() === selectedSkill.id.toLowerCase());
            if (!skill) {
                console.warn('[SkillDetails] Skill not found:', selectedSkill.id);
                this.renderTemplateData([]); // clear
                return;
            }
            console.log('[SkillDetails] Rendering skill details for:', skill);

            this.renderTemplateData([skill]);
        });
    }

    // Extend the base renderTemplateData for tags and keyFeatures only
    renderTemplateData(items) {

        if (!items || items.length === 0) return;
        // We only expect one item for details -- default to the first
        const skill = items[0];

        super.renderTemplateData([skill]); // populate standard [data-field] fields

        // Render tags
        const tagsContainer = this.root.querySelector('.skill-details-tags');
        if (tagsContainer && skill.tags?.length) {
            tagsContainer.innerHTML = '';
            removeElements(tagsContainer, 'template');
            skill.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = tag;
                tagsContainer.appendChild(span);
            });
        }

        // Render key features
        const featuresSlot = this.root.querySelector('slot[name="keyFeatures"]');
        if (featuresSlot && skill.keyFeatures) {
            const container = document.createElement('div');
            container.innerHTML = skill.keyFeatures;
            featuresSlot.replaceWith(container);
        }
    }
}

customElements.define('skill-details', SkillDetails);
