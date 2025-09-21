import BaseShadowComponent from '../../base-shadow-component.js';
import css from './projects-search.css';
import templateHtml from './projects-search.html';
import { setSelectedSkill } from '../../../utils/signal-store.js';
import { tags } from '../data.js';

class ProjectsSearch extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
    }

    connectedCallback() {
        // initialize
        this.data.set(tags);
        super.connectedCallback();

        // Render the hierarchy into tiles
        this.renderTags(tags.tags);

        // Register click handlers after render
        this.registerClickHandlers();
    }

    /**
     * Recursively traverse tags and render tiles
     */
    renderTags(tagNodes, parentEl) {
        const container = parentEl || this.root.querySelector('[data-container]');
        const template = this.root.querySelector('#project-item-template');

        tagNodes.forEach(tag => {
            const clone = template.content.cloneNode(true);
            const tile = clone.querySelector('[data-field="technology-tag"]');

            tile.textContent = tag.name;
            tile.classList.add('project-badge');
            tile.setAttribute('data-id', tag.name); // use name as unique ID for now

            container.appendChild(clone);

            // If tag has children → recursive render
            if (tag.children && tag.children.length > 0) {
                this.renderTags(tag.children, container);
            }
        });
    }

    /**
     * Hook up tile click events
     */
    registerClickHandlers() {
        const tiles = this.root.querySelectorAll('.project-badge');
        console.log('Found tiles:', tiles);

        tiles.forEach(tile => {
            tile.addEventListener('click', () => {
                const tagId = tile.getAttribute('data-id');
                const tagName = tile.textContent;

                console.log('Tile clicked:', tagId);

                // Look up tag in original tags object
                const project = this.findTag(tags.tags, tagName);

                if (project) {
                    console.log('Setting selected skill:', project.name);
                    setSelectedSkill(project);
                }
            });
        });
    }

    /**
     * Recursive tag lookup by name
     */
    findTag(nodes, name) {
        for (const node of nodes) {
            if (node.name === name) return node;
            if (node.children) {
                const found = this.findTag(node.children, name);
                if (found) return found;
            }
        }
        return null;
    }
}

customElements.define('projects-search', ProjectsSearch);
