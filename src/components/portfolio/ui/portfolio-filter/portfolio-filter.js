import { Config } from '../../../../config';
import { setTagsUpdated } from '../../../../modules/reactivity/signal-store';

import BaseShadowComponent from '../../../base-shadow-component';

import { technologyTaxonomy } from '../../data';
import { TopicManager } from '../../domain/topic/taxonomy';

import css from './portfolio-filter.css';
import templateHtml from './portfolio-filter.html';

// Toggle logging by editing this helper (minimal/no-op by default)
const LOG = (...args) => {
    // console.log('[ProjectsFilter]', ...args);
    void args;
};

export default class ProjectsFilter extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);

        // TagManager instance
        this.topicManager = new TopicManager({
            taxonomy: technologyTaxonomy,
            maxPerCategory: Config.MAX_TOPICS_PER_CATEGORY,
            randomFn: Math.random,
            debug: true
        });

        // DOM / state helpers
        this._debounceTimer = null;
        this._cardListeners = [];
    }

    connectedCallback() {
        super.connectedCallback();

        // Wire inputs & controls first
        this._wireControls();

        // Initial render: ordered top tags (respect global priority)
        const tags = this.topicManager.orderTopTagsByPriority().getTopTags();
        const toRender = this._prepareRenderList(tags);

        super.triggerTemplateRender(toRender);

        // Post-render wiring after template applied to DOM
        Promise.resolve().then(() => this._postRenderSetup(toRender));
    }

    disconnectedCallback() {
        super.disconnectedCallback?.();
        // cleanup listeners
        this._cardListeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
        this._cardListeners = [];
    }

    /* -------------------------
       Prepare render list
       Ensure selected tags are included (preserve), keep unique, slice to visible limit
       ------------------------- */
    _prepareRenderList(tagsArray = []) {
        const maxVisible = Config.MAX_TOPICS_VISIBLE || 9;
        const selectedIds = new Set([...this.topicManager.selectedTagIds]);

        // Get selected tag objects (look in topTags then allTags)
        const selectedObjects = [...selectedIds]
            .map(id => this.topicManager.getTopTags().find(t => t.id === id) || this.topicManager.getAllTags().find(t => t.id === id))
            .filter(Boolean);

        // Merge with de-duplication; selected first so they stay visible
        const seen = new Set(selectedObjects.map(t => t.id));
        const merged = [...selectedObjects, ...tagsArray.filter(t => !seen.has(t.id))];

        return merged.slice(0, maxVisible);
    }

    /* -------------------------
       Post-render setup: wire each card (id, label, accessibility, events)
       ------------------------- */
    _postRenderSetup(renderedTags = []) {
        const container = this.root.querySelector('.tag-item-container');
        if (!container) {
            LOG('No .tag-item-container found');
            return;
        }

        // Remove previous listeners
        this._cardListeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
        this._cardListeners = [];

        const cards = Array.from(container.querySelectorAll('.tag-card'));
        LOG('Found cards:', cards.length, 'tags to wire:', renderedTags.length);

        // Map renderedTags by id for robust mapping
        const tagMap = new Map(renderedTags.map(t => [t.id, t]));

        cards.forEach((card, index) => {
            // Determine id for card: prefer existing id or data-id, else try match by position
            let id = card.id || card.getAttribute('data-id') || null;
            if (!id && renderedTags[index]) {
                id = renderedTags[index].id;
                card.id = id;
            }

            const tag = id ? (tagMap.get(id) || this.topicManager.getAllTags().find(tt => tt.id === id)) : null;
            if (!tag) {
                // hide unknown cards
                card.style.display = 'none';
                return;
            }
            card.style.display = '';

            // Ensure label exists and title for tooltip
            let labelEl = card.querySelector('.tag-label');
            if (!labelEl) {
                labelEl = document.createElement('span');
                labelEl.className = 'tag-label';
                card.prepend(labelEl);
            }
            labelEl.textContent = tag.label;
            labelEl.title = tag.label;

            // accessibility
            if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
            if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');

            // mark selected state if selected
            const isSelected = this.topicManager.selectedTagIds.has(tag.id);
            if (isSelected) {
                card.classList.add('active');
                card.setAttribute('aria-pressed', 'true');
            } else {
                card.classList.remove('active');
                card.setAttribute('aria-pressed', 'false');
            }

            // event handlers
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

            // save for cleanup
            this._cardListeners.push({ el: card, type: 'click', fn: activate });
            this._cardListeners.push({ el: card, type: 'keydown', fn: keyHandler });
        });
    }

    /* -------------------------
       Toggle selection for a tag-card
       Enforces selection limit; publishes tagsUpdated
       ------------------------- */
    _toggleTag(card) {
        if (!card || !card.id) return;

        const id = card.id;
        const isActive = this.topicManager.selectedTagIds.has(id);

        if (isActive) {
            this.topicManager.deselectTag(id);
            card.classList.remove('active');
            card.setAttribute('aria-pressed', 'false');
        } else {
            const res = this.topicManager.selectTag(id);
            if (res === false) {
                // visual feedback: briefly pulse or add class
                card.classList.add('limit-reached');
                setTimeout(() => card.classList.remove('limit-reached'), 700);
                // optionally show toast / UI feedback
                return;
            }
            card.classList.add('active');
            card.setAttribute('aria-pressed', 'true');
        }

        // Publish selection change for project list; projects are filtered with AND semantics
        const selectedTopics = this.topicManager.getSelectedTags().flatMap(t => t.topics || []);
        setTagsUpdated({ timestamp: Date.now(), topics: selectedTopics });
    }

    /* -------------------------
       Wire controls: search input, clear button, add-custom (+) button, suggestions
       ------------------------- */
    _wireControls() {
        const searchEl = this.root.querySelector('.tag-search');
        const clearBtn = this.root.querySelector('.clear-selection');
        const plusBtn = this.root.querySelector('.add-custom');
        const suggestionsContainer = this.root.querySelector('.tag-suggestions');

        // hide plus by default
        if (plusBtn) plusBtn.hidden = true;

        const renderSuggestions = (results = []) => {
            if (!suggestionsContainer) return;
            suggestionsContainer.innerHTML = '';
            if (!results.length) {
                suggestionsContainer.classList.remove('active');
                return;
            }
            suggestionsContainer.classList.add('active');
            results.slice(0, 6).forEach(t => {
                const el = document.createElement('div');
                el.className = 'suggestion';
                el.textContent = t.label;
                el.dataset.id = t.id;
                el.tabIndex = 0;
                el.addEventListener('click', () => {
                    if (searchEl) searchEl.value = t.label;
                    suggestionsContainer.innerHTML = '';
                    suggestionsContainer.classList.remove('active');
                });
                el.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (searchEl) searchEl.value = t.label;
                        suggestionsContainer.innerHTML = '';
                        suggestionsContainer.classList.remove('active');
                    }
                });
                suggestionsContainer.appendChild(el);
            });
        };

        const onInput = (e) => {
            clearTimeout(this._debounceTimer);
            const raw = (e.target.value || '').trim();
            const query = raw.toLowerCase();

            // toggle plus button visibility: show only when >=3 chars and not duplicate
            if (plusBtn) {
                const dup = this.topicManager.getAllTags().some(t => t.label.toLowerCase() === raw.toLowerCase());
                plusBtn.hidden = (raw.length < 3 || dup);
            }

            // debounce search suggestions (non-destructive)
            this._debounceTimer = setTimeout(() => {
                const results = this.topicManager.searchTags(query); // returns array from allTags (non-apply)
                renderSuggestions(results);
            }, 160);
        };

        if (searchEl) {
            searchEl.addEventListener('input', onInput);

            // Enter applies the search (mutates topTags while preserving selections)
            searchEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const q = (searchEl.value || '').trim().toLowerCase();
                    this._applySearch(q);
                }
            });

            // blur hides suggestions after small delay so clicks can register
            searchEl.addEventListener('blur', () => {
                setTimeout(() => {
                    if (suggestionsContainer) {
                        suggestionsContainer.innerHTML = '';
                        suggestionsContainer.classList.remove('active');
                    }
                }, 150);
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (searchEl) searchEl.value = '';
                // clear selections
                this.topicManager.clearSelection();
                // reset UI cards
                this.root.querySelectorAll('.tag-card').forEach(card => {
                    card.classList.remove('active');
                    card.setAttribute('aria-pressed', 'false');
                });
                // re-render default top tags
                this._applySearch('');
                // publish reset selection
                setTagsUpdated({ timestamp: Date.now(), topics: [] });
            });
        }

        if (plusBtn) {
            plusBtn.addEventListener('click', () => {
                const v = (searchEl && searchEl.value || '').trim();
                if (!v || v.length < 3) return;
                try {
                    const tag = this.topicManager.addCustomTag(v);
                    // try to select immediately (may be rejected if limit reached)
                    const res = this.topicManager.selectTag(tag.id);
                    if (res === false) {
                        // optionally show UI hint - limit reached
                    }
                    // Re-render tags and wire up
                    const tags = this.topicManager.orderTopTagsByPriority().getTopTags();
                    const toRender = this._prepareRenderList(tags);
                    super.triggerTemplateRender(toRender);
                    Promise.resolve().then(() => this._postRenderSetup(toRender));
                    // notify consumers about selection (if selected)
                    const selectedTopics = this.topicManager.getSelectedTags().flatMap(t => t.topics || []);
                    setTagsUpdated({ timestamp: Date.now(), topics: selectedTopics });
                } catch (err) {
                    LOG('addCustomTag error', err);
                }
            });
        }
    }

    /* -------------------------
       Apply search: apply=true so topTags replaced (but selected preserved)
       Then re-render and wire cards
       ------------------------- */
    _applySearch(query = '') {
        // Mutate TagManager._topTags via apply: true. This ensures selected are preserved first.
        this.topicManager.searchTags(query, { apply: true });

        // Re-order according to priority
        this.topicManager.orderTopTagsByPriority();

        // Prepare render list ensuring selected preserved and slice to MAX visible
        const tags = this.topicManager.getTopTags();
        const toRender = this._prepareRenderList(tags);

        // Render template and wire up
        super.triggerTemplateRender(toRender);
        Promise.resolve().then(() => this._postRenderSetup(toRender));
    }

    /* -------------------------
       Optional convenience: update projects directly (publishes tagsUpdated)
       ------------------------- */
    _updateProjects() {
        const selectedTopics = this.topicManager.getSelectedTags().flatMap(t => t.topics || []);
        setTagsUpdated({ timestamp: Date.now(), topics: selectedTopics });
        LOG('Selected topics for project filtering:', selectedTopics);
    }
}

customElements.define('projects-filter', ProjectsFilter);
