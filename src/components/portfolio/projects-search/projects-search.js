import BaseShadowComponent from '../../base-shadow-component.js';
import css from './projects-search.css';
import templateHtml from './projects-search.html';
import { tags } from '../data.js';

class ProjectsSearch extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
    }

    connectedCallback() {
        // initialize
        this.data.set(tags);
        super.connectedCallback();

    }

    /**
     * Recursively traverse tags and render tiles
     */
    renderTags(items) {
        const container = parentEl || this.root.querySelector('[data-container]');
        const template = this.root.querySelector('#technology-item-template');

        const tags = TagTreeRenderer.render();
        console.log('shit', tags);

    }
}

customElements.define('projects-search', ProjectsSearch);
