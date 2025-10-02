import { Config } from '../../../../config';

export class TopicManager {
    constructor({
        taxonomy = [],
        maxPerCategory = Config.MAX_TOPICS_PER_CATEGORY,
        urlSearchParams = window.location.search,
        randomFn = Math.random,
        debug = false,
        maxSelected = 9
    } = {}) {
        this.taxonomy = taxonomy || [];
        this.maxPerCategory = Number(maxPerCategory) || 0;
        this.randomFn = typeof randomFn === 'function' ? randomFn : Math.random;
        this.debug = Boolean(debug);
        this.MAX_SELECTED = Number(maxSelected) || 9;

        this.selectedTagIds = new Set();
        this._renderCallback = null;

        this.urlParams = new URLSearchParams(
            typeof urlSearchParams === 'string' ? urlSearchParams : window.location.search
        );
        this.globalPriority = this.urlParams.get('t')?.toLowerCase() || null;

        // cached regexes for performance
        this._regexMap = {
            ai: /(ai|ml|llm|agent|copilot|rag)/i,
            aws: /(aws|lambda|s3|dynamodb|iam|eventbridge|kinesis|redshift|athena|quicksight|sagemaker|ecs)/i,
            programming: /(python|c#|csharp|go|javascript|typescript|react|angular|fastapi|flask)/i
        };

        // ordering base
        this._baseOrder = ['ai', 'aws', 'programming', 'random'];

        if (this.debug) console.log('[TagManager] init', { globalPriority: this.globalPriority, maxPerCategory: this.maxPerCategory });

        // load custom tags from storage
        this._customTags = [];
        this._loadCustomTags();

        // suggestion cache (used for renderCallback when typing)
        this._suggestedTags = [];

        this._initTags();
    }

    /* ---------------- public helpers ---------------- */

    setGlobalPriority(p) {
        this.globalPriority = p ? String(p).toLowerCase() : null;
        return this;
    }

    setRandomFn(fn) {
        if (typeof fn === 'function') this.randomFn = fn;
        return this;
    }

    /**
     * Register a render callback. The callback will receive:
     * - when suggestions: an object { suggestions: [...] }
     * - when apply true: the topTags array
     */
    setRenderCallback(fn) {
        this._renderCallback = typeof fn === 'function' ? fn : null;
        return this;
    }

    refresh() {
        this._initTags();
        // call render callback with updated topTags
        if (this._renderCallback) {
            try { this._renderCallback(this.getTopTags()); } catch (err) { if (this.debug) console.error('[TagManager] renderCallback error', err); }
        }
        return this;
    }

    /* ---------------- initialization ---------------- */

    _initTags() {
        this._allTags = this._flattenTaxonomy();

        // include custom tags at the end of allTags to be searchable
        if (this._customTags && this._customTags.length) {
            this._allTags = [...this._allTags, ...this._customTags];
        }

        this._topTags = this._applyTopicSelection(this._allTags);
        if (this.debug) console.log('[TagManager] flattened/all/top', this._allTags.length, this._topTags.length);
    }

    /* ---------------- flatten taxonomy ---------------- */

    _flattenTaxonomy() {
        let counter = 0;
        const source = Array.isArray(this.taxonomy) ? this.taxonomy : Object.values(this.taxonomy);
        return source
            .filter(cat => Array.isArray(cat.topics))
            .flatMap(cat =>
                cat.topics.map(topic => {
                    const { id, label, topics } = this._normalizeTopic(topic, counter++);
                    return { id, label, topics, category: cat.name || cat.title || '' };
                })
            );
    }

    /* ---------------- category kind (no global override) ---------------- */

    _categoryKind(categoryName = '') {
        const n = String(categoryName || '').toLowerCase();
        if (/ai|ml|llm|agents/.test(n)) return 'ai';
        if (/cloud|serverless|aws/.test(n)) return 'aws';
        if (/programming|frameworks/.test(n)) return 'programming';
        return 'random';
    }

    /* ---------------- selection driver - bias + shuffle ---------------- */

    _applyTopicSelection(allTags = []) {
        // group by category preserving insertion order
        const groups = allTags.reduce((acc, t) => {
            (acc[t.category] ||= []).push(t);
            return acc;
        }, {});

        const chosen = [];
        for (const [category, tags] of Object.entries(groups)) {
            const kind = this._categoryKind(category);
            if (this.debug) console.log('[TagManager] selecting', { category, kind, count: tags.length });
            chosen.push(...this._selectTopics(tags, this.maxPerCategory, kind));
        }

        return chosen;
    }

    _selectTopics(topics = [], maxCount = 0, priorityKind = 'random') {
        if (!Array.isArray(topics) || topics.length === 0 || maxCount <= 0) return [];

        const regex = this._regexMap[priorityKind] || null;

        // compute weight and random key (r) using injected randomFn
        const weighted = topics.map(tag => {
            const name = String(tag.label || tag.id || '');
            const weight = regex && regex.test(name) ? 1 : 0;
            return { tag, weight, r: this.randomFn() };
        });

        // sort: priority weight desc, then by random key (stable-ish)
        weighted.sort((a, b) => {
            if (b.weight !== a.weight) return b.weight - a.weight;
            return a.r - b.r;
        });

        const selected = weighted.slice(0, Math.min(maxCount, weighted.length)).map(w => w.tag);
        if (this.debug) console.log('[TagManager] _selectTopics', { priorityKind, requested: maxCount, selected: selected.map(t => t.id) });

        return selected;
    }

    /* ---------------- normalize/topic helpers ---------------- */

    _normalizeTopic(topic, index) {
        if (typeof topic === 'string') {
            return { id: `tag-${index}`, label: this._humanLabel(topic), topics: [topic] };
        }
        if (topic && typeof topic === 'object') {
            const tid = topic.id || `topic-${index}`;
            const ttopics = Array.isArray(topic.topics) && topic.topics.length ? topic.topics : [tid];
            return { id: `tag-${index}`, label: topic.label || this._humanLabel(tid), topics: ttopics };
        }
        const val = String(topic);
        return { id: `tag-${index}`, label: this._humanLabel(val), topics: [val] };
    }

    _humanLabel(str) {
        const acronyms = new Set(['ai', 'ml', 'llm', 'rag', 'api', 'db', 'ci', 'cd']);
        const cleaned = String(str || '').replace(/[_-]/g, ' ').trim();
        return acronyms.has(cleaned.toLowerCase()) ? cleaned.toUpperCase() : cleaned.replace(/\b\w/g, c => c.toUpperCase());
    }

    /* ---------------- custom tags (localStorage) ---------------- */

    _customKey() {
        return 'tag-manager:custom-tags:v1';
    }

    _loadCustomTags() {
        try {
            const json = localStorage.getItem(this._customKey());
            const arr = json ? JSON.parse(json) : [];
            this._customTags = (arr || []).map((t, i) => ({
                id: t.id || `custom-${Date.now()}-${i}`,
                label: t.label,
                topics: t.topics || [t.label],
                category: 'custom'
            }));
        } catch (err) {
            if (this.debug) console.error('[TagManager] loadCustomTags error', err);
            this._customTags = [];
        }
        return this._customTags;
    }

    _saveCustomTags() {
        try {
            const payload = (this._customTags || []).map(t => ({ id: t.id, label: t.label, topics: t.topics }));
            localStorage.setItem(this._customKey(), JSON.stringify(payload));
        } catch (err) {
            if (this.debug) console.error('[TagManager] saveCustomTags error', err);
        }
    }

    addCustomTag(label) {
        const clean = String(label || '').trim();
        if (clean.length < 3) throw new Error('Custom tag must be at least 3 characters');

        if (!this._customTags) this._loadCustomTags();
        const existing = this._customTags.find(t => t.label.toLowerCase() === clean.toLowerCase());
        if (existing) return existing;

        const id = `custom-${Date.now()}-${Math.floor(this.randomFn() * 10000)}`;
        const tag = { id, label: this._humanLabel(clean), topics: [clean], category: 'custom' };
        this._customTags.push(tag);
        this._saveCustomTags();

        // Inject into master lists and refresh ordering
        this._allTags = [...(this._allTags || []), tag];
        this._topTags = [...(this._topTags || []), tag];

        // keep ordering consistent
        this.orderTopTagsByPriority();

        // notify UI (render callback) with updated topTags
        if (this._renderCallback) {
            try { this._renderCallback(this.getTopTags()); } catch (err) { if (this.debug) console.error('[TagManager] renderCallback error', err); }
        }

        if (this.debug) console.log('[TagManager] addCustomTag', tag.id, tag.label);
        return tag;
    }

    getCustomTags() {
        if (!this._customTags) this._loadCustomTags();
        return [...this._customTags];
    }

    /* ---------------- suggestions helper ----------------
     * Return a small ranked list of candidate tags for suggestions UI
     */
    getSuggestions(query = '', limit = 8) {
        const q = String(query || '').trim().toLowerCase();
        if (q === '') return [];

        const pool = this._allTags || this._flattenTaxonomy();
        const results = pool
            .map(tag => {
                const hay = `${tag.label} ${tag.topics.join(' ')} ${tag.category} ${tag.id}`.toLowerCase();
                const contains = hay.includes(q);
                // score: +2 if priority regex matches tag label (gives bias to relevant categories)
                let score = contains ? 1 : 0;
                for (const [k, rx] of Object.entries(this._regexMap)) {
                    if (rx.test(tag.label) && q.length > 0 && this._categoryKind(tag.category) === k) {
                        score += 2;
                        break;
                    }
                }
                return { tag, score, contains };
            })
            .filter(x => x.contains || x.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(x => x.tag);

        return results.slice(0, Math.max(0, Number(limit) || 8));
    }

    /* ---------------- search (over allTags) ----------------
     * searchTags(query, { apply = false })
     * - default: returns results array (does not mutate topTags)
     *   but WILL update suggestion cache and call renderCallback({ suggestions }) so UI can show suggestions
     * - apply: sets _topTags = union(selectedTags, results) and returns this (fluent). Calls ordering + renderCallback
     */
    searchTags(query = '', { apply = false } = {}) {
        if (!this._allTags) this._allTags = this._flattenTaxonomy();

        const q = String(query || '').trim().toLowerCase();

        if (q === '') {
            // empty query: if apply -> restore default topTags; else return all tags (for suggestions)
            if (apply) {
                this._topTags = this._applyTopicSelection(this._allTags);
                this.orderTopTagsByPriority();
                if (this._renderCallback) {
                    try { this._renderCallback(this.getTopTags()); } catch (err) { if (this.debug) console.error(err); }
                }
                return this;
            }
            // suggestions: all tags
            const all = [...this._allTags];
            this._suggestedTags = all;
            if (this._renderCallback) {
                try { this._renderCallback({ suggestions: this._suggestedTags }); } catch (err) { if (this.debug) console.error(err); }
            }
            return all;
        }

        // perform search across _allTags
        const results = (this._allTags || []).filter(tag => {
            const hay = `${tag.label} ${tag.topics.join(' ')} ${tag.category} ${tag.id}`.toLowerCase();
            return hay.includes(q);
        });

        // update suggestion cache and notify UI (non-destructive)
        this._suggestedTags = results;
        if (this._renderCallback) {
            try { this._renderCallback({ suggestions: this._suggestedTags }); } catch (err) { if (this.debug) console.error(err); }
        }

        if (!apply) {
            if (this.debug) console.log('[TagManager] searchTags (suggestions) found', results.length, 'for', q);
            return results;
        }

        // apply: merge selected tags first, then search results (preserve selected)
        const selected = this.getSelectedTags(); // array of tag objects
        const selectedIds = new Set(selected.map(t => t.id));
        const merged = [...selected, ...results.filter(t => !selectedIds.has(t.id))];

        this._topTags = merged;

        // reorder according to priority
        this.orderTopTagsByPriority();

        // render callback with final topTags
        if (this._renderCallback) {
            try { this._renderCallback(this.getTopTags()); } catch (err) { if (this.debug) console.error('[TagManager] renderCallback error', err); }
        }

        if (this.debug) console.log('[TagManager] searchTags.apply -> topTags length', this._topTags.length);
        return this;
    }

    /* ---------------- selection API ---------------- */

    getSelectedTags() {
        if (!this.selectedTagIds || this.selectedTagIds.size === 0) return [];
        const ids = new Set([...this.selectedTagIds]);
        // search in topTags, then allTags, then customTags
        const results = [];
        const searchPools = [this._topTags || [], this._allTags || [], this._customTags || []];
        for (const pool of searchPools) {
            for (const t of pool) {
                if (ids.has(t.id)) {
                    results.push(t);
                    ids.delete(t.id);
                }
            }
            if (ids.size === 0) break;
        }
        return results;
    }

    selectTag(tagId) {
        if (!tagId) return this;
        if (this.selectedTagIds.has(tagId)) return this;

        if (this.selectedTagIds.size >= this.MAX_SELECTED) {
            if (this.debug) console.warn('[TagManager] selectTag limit reached', this.MAX_SELECTED);
            return false;
        }

        this.selectedTagIds.add(tagId);
        if (this.debug) console.log('[TagManager] selectTag', tagId);
        return this;
    }

    deselectTag(tagId) {
        this.selectedTagIds.delete(tagId);
        if (this.debug) console.log('[TagManager] deselectTag', tagId);
        return this;
    }

    clearSelection() {
        this.selectedTagIds.clear();
        if (this.debug) console.log('[TagManager] clearSelection');
        return this;
    }

    /* ---------------- ordering by priority (fluent) ----------------
     * Promotes the globalPriority group (if set) to the front while preserving stable order.
     */
    orderTopTagsByPriority() {
        if (!this._topTags) return this;

        const tags = Array.isArray(this._topTags) ? [...this._topTags] : Object.values(this._topTags || []);
        const global = this.globalPriority;
        const base = this._baseOrder;
        const order = global ? [global, ...base.filter(x => x !== global)] : base;

        const priorityIndex = (categoryName) => {
            const k = this._categoryKind(categoryName);
            const idx = order.indexOf(k);
            return idx === -1 ? Infinity : idx;
        };

        // stable sort by priority index, then original index
        const withIdx = tags.map((t, i) => ({ t, i }));
        withIdx.sort((a, b) => {
            const pa = priorityIndex(a.t.category);
            const pb = priorityIndex(b.t.category);
            if (pa !== pb) return pa - pb;
            return a.i - b.i;
        });

        this._topTags = withIdx.map(x => x.t);
        if (this.debug) console.log('[TagManager] orderTopTagsByPriority ->', this._topTags.map(t => `${t.id}@${t.category}`));
        return this;
    }

    /* ---------------- accessors ---------------- */

    getTopTags() {
        return Array.isArray(this._topTags) ? [...this._topTags] : (this._topTags ? Object.values(this._topTags) : []);
    }

    getAllTags() {
        return Array.isArray(this._allTags) ? [...this._allTags] : (this._allTags ? Object.values(this._allTags) : []);
    }
}
