// projects-filter.js
import BaseShadowComponent from '../../base-shadow-component';
import templateHtml from './projects-filter.html';
import css from './projects-filter.css';
import { technologyTaxonomy } from '../data';
import { ProjectRenderer } from '../services/project';

const LOG = (...args) => console.log('[ProjectsFilter]', ...args);

export default class ProjectsFilter extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
        this.selectedTagIds = new Set();
        this._allTags = []; // flattened: { id, label, topics }
        this._debounceTimer = null;
        this.maxPerCategory = 5;
    }

    connectedCallback() {
        super.connectedCallback();
        LOG('connectedCallback start');

        this._wireControls();

        const tags = this._getRenderableTagsFromTaxonomy(technologyTaxonomy);
        this._allTags = tags;

        super.triggerTemplateRender(tags);

        Promise.resolve().then(() => this._postRenderSetup(tags));

        LOG('connectedCallback complete');
    }

    /* -------------------------
       DOM Setup & Tag Wiring
       ------------------------- */
    _postRenderSetup(tags = []) {
        const container = this.root.querySelector('.tag-item-container');
        if (!container) {
            console.warn('projects-filter: .tag-item-container not found');
            return;
        }

        const cards = Array.from(container.querySelectorAll('.tag-card'));
        LOG('Found rendered tag cards:', cards.length);

        cards.forEach((card, idx) => {
            if (!card.id) {
                const idEl = card.querySelector('.tag-id');
                if (idEl?.textContent?.trim()) {
                    card.id = idEl.textContent.trim();
                } else if (tags[idx]?.id) {
                    card.id = tags[idx].id;
                } else {
                    card.id = `tag-auto-${idx}`;
                }
            }

            const labelEl = card.querySelector('.tag-label');
            if (!labelEl) {
                const span = document.createElement('span');
                span.className = 'tag-label';
                span.textContent = tags[idx]?.label || card.textContent.trim();
                card.prepend(span);
            }

            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-pressed', 'false');

            card.addEventListener('click', (e) => {
                e.preventDefault();
                this._toggleTag(card);
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this._toggleTag(card);
                }
            });
        });

        this._renderSelectedStrip();
    }

    /* -------------------------
       Selection Handling
       ------------------------- */
    _toggleTag(cardEl) {
        if (!cardEl?.id) return;
        const id = cardEl.id;

        if (this.selectedTagIds.has(id)) {
            this.selectedTagIds.delete(id);
            cardEl.classList.remove('active');
            cardEl.setAttribute('aria-pressed', 'false');
        } else {
            this.selectedTagIds.add(id);
            cardEl.classList.add('active');
            cardEl.setAttribute('aria-pressed', 'true');
        }

        this._renderSelectedStrip();
        this._updateProjectsForSelection();
    }

    _renderSelectedStrip() {
        const selectedContainer = this.root.querySelector('.selected-tags');
        if (!selectedContainer) return;

        selectedContainer.innerHTML = '';

        Array.from(this.selectedTagIds).forEach((tagId) => {
            const tagObj = this._allTags.find(t => t.id === tagId);
            const label = tagObj?.label || tagId;

            const chip = document.createElement('div');
            chip.className = 'selected-tag';
            chip.setAttribute('role', 'button');
            chip.setAttribute('tabindex', '0');
            chip.setAttribute('aria-pressed', 'true');
            chip.innerHTML = `
                <span class="tag-label">${this._escapeHtml(label)}</span>
                <button type="button" class="remove-tag" aria-label="Remove ${this._escapeHtml(label)}">×</button>
            `;

            chip.querySelector('.remove-tag').addEventListener('click', (e) => {
                e.preventDefault();
                this._deselectTag(tagId);
            });

            chip.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this._deselectTag(tagId);
                }
            });

            selectedContainer.appendChild(chip);
        });
    }

    _deselectTag(tagId) {
        const card = this.root.querySelector(`#${CSS.escape(tagId)}`);
        if (card) {
            card.classList.remove('active');
            card.setAttribute('aria-pressed', 'false');
        }

        this.selectedTagIds.delete(tagId);
        this._renderSelectedStrip();
        this._updateProjectsForSelection();
    }

    clearSelection() {
        this.selectedTagIds.clear();
        this.root.querySelectorAll('.tag-card').forEach(c => {
            c.classList.remove('active');
            c.setAttribute('aria-pressed', 'false');
        });
        this._renderSelectedStrip();
        this._updateProjectsForSelection();
        this._applySearch('');
    }

    /* -------------------------
       Search & Filtering
       ------------------------- */
    _wireControls() {
        const searchEl = this.root.querySelector('.tag-search');
        const clearBtn = this.root.querySelector('.clear-selection');

        if (searchEl) {
            searchEl.addEventListener('input', (e) => {
                clearTimeout(this._debounceTimer);
                const q = (e.target.value || '').trim().toLowerCase();
                this._debounceTimer = setTimeout(() => this._applySearch(q), 160);
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (searchEl) searchEl.value = '';
                this.clearSelection();
                this._applySearch('');
            });
        }
    }

    _applySearch(query) {
        const normalized = (query || '').trim().toLowerCase();
        const cards = Array.from(this.root.querySelectorAll('.tag-card'));

        cards.forEach(card => {
            const label = card.querySelector('.tag-label')?.textContent?.trim().toLowerCase() || '';
            const tagId = card.id?.toLowerCase() || '';

            // Find the tag object to get its category/topic info
            const tagObj = this._allTags.find(t => t.id === card.id);

            // Build a search string including label, topics, and inferred category name
            const topicsText = Array.isArray(tagObj?.topics)
                ? tagObj.topics.join(' ').toLowerCase()
                : '';
            const categoryText = tagObj?.category?.toLowerCase?.() || '';

            const combined = `${label} ${topicsText} ${categoryText} ${tagId}`;

            const match = !normalized || combined.includes(normalized);
            card.style.display = match ? '' : 'none';
        });

        // Hide container if nothing matches
        const container = this.root.querySelector('.tag-item-container');
        const visibleCount = cards.filter(c => c.style.display !== 'none').length;
        container.style.display = visibleCount > 0 ? '' : 'none';
    }

    /* -------------------------
       Project Filtering
       ------------------------- */
    _updateProjectsForSelection() {
        const topics = Array.from(this.selectedTagIds)
            .map(id => {
                const t = this._allTags.find(x => x.id === id);
                return t ? (Array.isArray(t.topics) ? t.topics : [t.topics]) : [];
            })
            .flat()
            .filter(Boolean);

        const uniq = [...new Set(topics)];
        const listContainer = document.querySelector('#projects-list');
        // ProjectRenderer.renderProjectsForTopics(listContainer, uniq);
    }

    /* -------------------------
       Taxonomy Flattening
       ------------------------- */
    _getRenderableTagsFromTaxonomy(taxonomy) {
        const out = [];
        let counter = 0;

        if (!taxonomy || typeof taxonomy !== 'object') return out;

        // ✅ Get priority from URL param (?t=aws, ?t=ai, ?t=programming)
        const params = new URLSearchParams(window.location.search);
        const globalPriority = params.get('t')?.toLowerCase() || null;

        Object.values(taxonomy).forEach((category) => {
            const topics = category.topics;
            if (!Array.isArray(topics)) return;

            // ✅ Choose priority: either from URL or category inference
            let priority = globalPriority;
            if (!priority) {
                if (/ai|ml|llm|agents/i.test(category.name)) priority = 'ai';
                else if (/cloud|serverless|aws/i.test(category.name)) priority = 'aws';
                else if (/programming|frameworks/i.test(category.name)) priority = 'programming';
                else priority = 'random';
            }

            const chosenTopics = this._selectTopics(topics, this.maxPerCategory, priority);
            console.log('shitfuck', priority, chosenTopics);

            chosenTopics.forEach((topic) => {
                let tagData;
                if (typeof topic === 'string') {
                    tagData = {
                        id: `tag-${counter++}`,
                        label: this._humanLabel(topic),
                        topics: [topic],
                        category: category.name || category.title || ''
                    };
                } else if (typeof topic === 'object') {
                    const tid = topic.id || `topic-${counter++}`;
                    tagData = {
                        id: `tag-${counter++}`,
                        label: topic.label || this._humanLabel(tid),
                        topics: topic.topics || [tid],
                        category: category.name || category.title || ''
                    };
                } else {
                    tagData = {
                        id: `tag-${counter++}`,
                        label: String(topic),
                        topics: [String(topic)],
                        category: category.name || category.title || ''
                    };
                }
                out.push(tagData);
            });
        });

        return out;
    }

    /**
     * Selects up to maxCount topics from a category with optional prioritisation
     * @param {Array} topics - list of topic objects { id, label }
     * @param {number} maxCount - maximum number of topics to return
     * @param {string} [priority] - optional: 'ai' | 'aws' | 'programming' | 'random'
     * @returns {Array} - selected topics
     */
    _selectTopics(topics, maxCount = 9, priority = 'random') {
        if (!Array.isArray(topics) || topics.length === 0) return [];

        const copy = [...topics];

        const regexMap = {
            ai: /(ai|ml|llm|agent|copilot)/i,
            aws: /(aws|lambda|s3|dynamodb|iam|eventbridge|kinesis|redshift|athena|quicksight|sagemaker|ecs)/i,
            programming: /(python|c#|csharp|go|javascript|typescript|react|angular|fastapi|flask)/i
        };

        const regex = regexMap[priority];

        // Sort by priority if applicable
        if (regex) {
            copy.sort((a, b) => {
                const aScore = regex.test(a.id) || regex.test(a.label) ? 1 : 0;
                const bScore = regex.test(b.id) || regex.test(b.label) ? 1 : 0;
                return bScore - aScore;
            });
        } else {
            // Fisher–Yates shuffle for random mode
            for (let i = copy.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [copy[i], copy[j]] = [copy[j], copy[i]];
            }
        }

        const selected = copy.slice(0, maxCount);

        // Light shuffle for variety even in priority modes
        for (let i = selected.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [selected[i], selected[j]] = [selected[j], selected[i]];
        }

        return selected;
    }


    /* -------------------------
       Utils
       ------------------------- */
    _humanLabel(str) {
        const acronyms = new Set(['ai', 'ml', 'llm', 'rag', 'api', 'db', 'ci', 'cd']);
        const cleaned = String(str).replace(/[_-]/g, ' ').trim();
        return acronyms.has(cleaned.toLowerCase())
            ? cleaned.toUpperCase()
            : cleaned.replace(/\b\w/g, c => c.toUpperCase());
    }

    _escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

customElements.define('projects-filter', ProjectsFilter);
