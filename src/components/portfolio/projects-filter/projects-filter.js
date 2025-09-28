import BaseShadowComponent from '../../base-shadow-component';
import templateHtml from './projects-filter.html';
import css from './projects-filter.css';
import { technologyTaxonomy } from '../data';
import { TagManager } from '../services/taxonomy';
import { ProjectRenderer } from '../services/project';
import { Config } from '../../../config';

const LOG = (...args) => {
    // Toggle verbose logging: comment out to silence
    console.log('[ProjectsFilter]', ...args);
};

export default class ProjectsFilter extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
        this.tagManager = new TagManager({ taxonomy: technologyTaxonomy });
        this._debounceTimer = null;
        this._cardListeners = []; // keep refs if you want to remove listeners on disconnect
    }

    connectedCallback() {
        super.connectedCallback();

        this._wireControls();

        const tags = this.tagManager.orderTopTagsByPriority().getTopTags();

        console.log('fjiogjogo', tags);

        // Prefer top tags (the weighted selection). Fall back to all tags if top list missing.
        const toRender = tags.slice(0, Config.MAX_TOPICS_VISIBLE || tags.length);

        // triggerTemplateRender expects the data shape that matches your template (id/label)
        super.triggerTemplateRender(toRender);

        // Wait a microtask so TemplateRenderer has applied the template into the DOM.
        Promise.resolve().then(() => this._postRenderSetup(toRender));
    }

    disconnectedCallback() {
        super.disconnectedCallback?.();
        // Optional: remove listeners if you registered them and want to avoid leaks
        this._cardListeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
        this._cardListeners = [];
    }

    /* -------------------------
       Post-render setup (robust)
       ------------------------- */
    _postRenderSetup(renderedTags = []) {
        const container = this.root.querySelector('.tag-item-container');
        if (!container) {
            LOG('No .tag-item-container found');
            return;
        }

        const cards = Array.from(container.querySelectorAll('.tag-card'));
        LOG('Found cards:', cards.length, 'tags to wire:', renderedTags.length);

        // Ensure we don't assume 1:1 length — map by index but guard
        cards.forEach((card, idx) => {
            const tag = renderedTags[idx];
            if (!tag) {
                LOG('No tag data for card index', idx, '- skipping wiring for this card');
                return;
            }

            // Only set id if not already present
            if (!card.id) card.id = tag.id;

            // Add label only if missing (don't clobber existing markup)
            if (!card.querySelector('.tag-label')) {
                const span = document.createElement('span');
                span.className = 'tag-label';
                span.textContent = tag.label;
                card.prepend(span);
            } else {
                // ensure label text matches tag.label (optional)
                const labelEl = card.querySelector('.tag-label');
                if (labelEl && labelEl.textContent.trim() === '') labelEl.textContent = tag.label;
            }

            // Accessibility: set only if absent so we don't override author-provided values
            if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
            if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
            if (!card.hasAttribute('aria-pressed')) card.setAttribute('aria-pressed', 'false');

            // Lightweight event listeners (saved so they can be removed)
            const activate = (e) => {
                if (e && typeof e.preventDefault === 'function') e.preventDefault();
                this._toggleTag(card);
            };

            const keyHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activate(e);
                }
            };

            card.addEventListener('click', activate);
            card.addEventListener('keydown', keyHandler);

            // store refs for cleanup later
            this._cardListeners.push({ el: card, type: 'click', fn: activate });
            this._cardListeners.push({ el: card, type: 'keydown', fn: keyHandler });
        });
    }

    /* -------------------------
       Tag selection toggle
       ------------------------- */
    _toggleTag(card) {
        if (!card || !card.id) return;
        const isActive = this.tagManager.selectedTagIds.has(card.id);

        if (isActive) {
            this.tagManager.deselectTag(card.id);
            card.classList.remove('active');
            card.setAttribute('aria-pressed', 'false');
        } else {
            this.tagManager.selectTag(card.id);
            card.classList.add('active');
            card.setAttribute('aria-pressed', 'true');
        }

        this._updateProjects();
    }

    /* -------------------------
       Project filtering (calls out to ProjectRenderer)
       ------------------------- */
    _updateProjects() {
        const topics = this.tagManager.getSelectedTags().flatMap(t => t.topics || []);
        // Uncomment below when you want to render project list
        // ProjectRenderer.renderProjectsForTopics(document.querySelector('#projects-list'), topics);
        LOG('Selected topics for project filtering:', topics);
    }

    /* -------------------------
       Controls: search + clear
       ------------------------- */
    _wireControls() {
        const searchEl = this.root.querySelector('.tag-search');
        const clearBtn = this.root.querySelector('.clear-selection');

        if (searchEl) {
            searchEl.addEventListener('input', (e) => {
                clearTimeout(this._debounceTimer);
                const query = (e.target.value || '').trim().toLowerCase();
                this._debounceTimer = setTimeout(() => this._applySearch(query), 160);
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (searchEl) searchEl.value = '';
                this.tagManager.clearSelection();
                this.root.querySelectorAll('.tag-card').forEach(card => {
                    card.classList.remove('active');
                    card.setAttribute('aria-pressed', 'false');
                });
                this._applySearch('');
                this._updateProjects();
            });
        }
    }

    /* -------------------------
       Search/filter tags
       ------------------------- */
    _applySearch(query) {
        const visibleTagIds = this.tagManager.searchTags(query).map(t => t.id);
        this.root.querySelectorAll('.tag-card').forEach(card => {
            // If card has no id (unexpected) treat as hidden
            card.style.display = visibleTagIds.includes(card.id) ? '' : 'none';
        });
    }
}

customElements.define('projects-filter', ProjectsFilter);
