import { Config } from '../../../config';

export class TagManager {
    constructor({
        taxonomy = [],
        maxPerCategory = Config.MAX_TOPICS_PER_CATEGORY,
        urlSearchParams = window.location.search,
        randomFn = Math.random,        // inject for deterministic tests
        debug = true                  // toggle verbose logging
    } = {}) {
        this.taxonomy = taxonomy;
        this.maxPerCategory = maxPerCategory;
        this.randomFn = randomFn;
        this.debug = Boolean(debug);

        this.selectedTagIds = new Set();

        // Accept test-friendly urlSearchParams as either string or window.location.search
        this.urlParams = new URLSearchParams(
            typeof urlSearchParams === 'string' ? urlSearchParams : window.location.search
        );
        this.globalPriority = this.urlParams.get('t')?.toLowerCase() || null;
        console.log('sheeeeeeeeeeeeeeeeet', urlSearchParams, window.location.search);
        console.log('cunt', window.location.search);


        if (this.debug) console.log('[TagManager] init, globalPriority=', this.globalPriority);

        this._initTags();
    }

    /* --------------------- init --------------------- */
    _initTags() {
        this._allTags = this._flattenTaxonomy();
        if (this.debug) console.log('[TagManager] flattened tags:', this._allTags.length);

        // Apply selection to produce top tags (array)
        this._topTags = this._applyTopicSelection(this._allTags);
        if (this.debug) console.log('[TagManager] top tags selected:', this._topTags.length);
    }

    /* --------------------- flatten --------------------- */
    _flattenTaxonomy() {
        let counter = 0;
        // Ensure taxonomy iteration keeps stable ordering (array expected)
        return (Array.isArray(this.taxonomy) ? this.taxonomy : Object.values(this.taxonomy))
            .filter(cat => Array.isArray(cat.topics))
            .flatMap(category =>
                category.topics.map(topic => {
                    const { id, label, topics } = this._normalizeTopic(topic, counter++);
                    return {
                        id,
                        label,
                        topics,
                        category: category.name || category.title || ''
                    };
                })
            );
    }

    /* --------------------- selection driver --------------------- */
    _applyTopicSelection(allTags) {
        // Group tags by category
        const tagsByCategory = allTags.reduce((acc, tag) => {
            acc[tag.category] ||= [];
            acc[tag.category].push(tag);
            return acc;
        }, {});

        // For each category pick up to maxPerCategory, with priority bias
        const chosen = [];
        for (const [categoryName, tags] of Object.entries(tagsByCategory)) {
            const priority = this._determinePriority(categoryName);
            if (this.debug) console.log(`[TagManager] selecting category="${categoryName}" priority="${priority}" count=${tags.length}`);
            const selected = this._selectTopics(tags, this.maxPerCategory, priority);
            chosen.push(...selected);
        }

        // By design we return a flat array of chosen tags (shuffled with bias)
        return chosen;
    }

    /* --------------------- priority detection --------------------- */
    _determinePriority(categoryName = '') {
        if (this.globalPriority) {
            console.log('global prio exists', this.globalPriority);

            return this.globalPriority;
        }
        const name = String(categoryName).toLowerCase();
        console.log('name', name);

        if (/ai|ml|llm|agents/.test(name)) return 'ai';
        if (/cloud|serverless|aws/.test(name)) return 'aws';
        if (/programming|frameworks/.test(name)) return 'programming';
        return 'random';
    }

    /* --------------------- normalize topic --------------------- */
    _normalizeTopic(topic, index) {
        if (typeof topic === 'string') {
            return { id: `tag-${index}`, label: this._humanLabel(topic), topics: [topic] };
        }

        if (typeof topic === 'object' && topic !== null) {
            const tid = topic.id || `topic-${index}`;
            const ttopics = Array.isArray(topic.topics) && topic.topics.length ? topic.topics : [tid];
            return { id: `tag-${index}`, label: topic.label || this._humanLabel(tid), topics: ttopics };
        }

        const val = String(topic);
        return { id: `tag-${index}`, label: this._humanLabel(val), topics: [val] };
    }

    /* --------------------- select topics (shuffle all, bias priority) ---------------------
     * Approach:
     *  1. Determine which topics match the priority regex.
     *  2. Assign weight = 1 for priority, 0 for others.
     *  3. Shuffle entire list using injected randomFn.
     *  4. Stable-sort by weight descending so priority-ish topics prefer the front.
     *  5. Slice to maxCount and return those tag objects.
     * This ensures every topic is shuffled but priority topics are biased forward.
     */
    _selectTopics(topics, maxCount, priority = 'random') {
        if (!Array.isArray(topics) || topics.length === 0 || maxCount <= 0) return [];

        const regexMap = {
            ai: /(ai|ml|llm|agent|copilot|rag)/i,
            aws: /(aws|lambda|s3|dynamodb|iam|eventbridge|kinesis|redshift|athena|quicksight|sagemaker|ecs)/i,
            programming: /(python|c#|csharp|go|javascript|typescript|react|angular|fastapi|flask)/i
        };

        const regex = regexMap[priority] || null;

        // Build list with weights
        const weighted = topics.map(tag => {
            const nameToTest = (tag.label || tag.id || '').toString();
            const weight = regex && regex.test(nameToTest) ? 1 : 0;
            return { tag, weight, idx: Math.random() }; // idx used only for stable shuffle, later replaced
        });

        // Shuffle: use injected randomFn for deterministic tests if provided
        const shuffle = arr => {
            // Fisher-Yates shuffle using randomFn
            const a = arr.slice();
            for (let i = a.length - 1; i > 0; i--) {
                const r = Math.floor(this.randomFn() * (i + 1));
                [a[i], a[r]] = [a[r], a[i]];
            }
            return a;
        };

        const shuffled = shuffle(weighted);

        // Stable sort by weight descending (priority first), but keep shuffled order within same weight
        shuffled.sort((a, b) => b.weight - a.weight);

        // Pick up to maxCount
        const selected = shuffled.slice(0, Math.min(maxCount, shuffled.length)).map(w => w.tag);

        if (this.debug) {
            const selectedIds = selected.map(t => t.id);
            console.log(`[TagManager] _selectTopics(priority=${priority}) selected ${selectedIds.length}/${topics.length}:`, selectedIds);
        }

        return selected;
    }

    /* --------------------- random util (kept for other code paths) --------------------- */
    _pickRandom(array, count) {
        if (!Array.isArray(array) || count <= 0) return [];
        if (array.length <= count) return [...array];

        // Use injected randomFn
        const a = array.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const r = Math.floor(this.randomFn() * (i + 1));
            [a[i], a[r]] = [a[r], a[i]];
        }
        return a.slice(0, count);
    }

    /* --------------------- human label --------------------- */
    _humanLabel(str) {
        const acronyms = new Set(['ai', 'ml', 'llm', 'rag', 'api', 'db', 'ci', 'cd']);
        const cleaned = String(str).replace(/[_-]/g, ' ').trim();
        return acronyms.has(cleaned.toLowerCase())
            ? cleaned.toUpperCase()
            : cleaned.replace(/\b\w/g, c => c.toUpperCase());
    }

    /* --------------------- fluent selection API --------------------- */
    selectTag(tagId) {
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

    // place inside TagManager class
    _categoryKind(categoryName = '') {
        const name = String(categoryName).toLowerCase();
        if (/ai|ml|llm|agents/.test(name)) return 'ai';
        if (/cloud|serverless|aws/.test(name)) return 'aws';
        if (/programming|frameworks/.test(name)) return 'programming';
        return 'random';
    }

    getSelectedTags() {
        if (!this._topTags) return [];
        return [...this.selectedTagIds].map(id => this._topTags.find(t => t.id === id)).filter(Boolean);
    }

    /* --------------------- searching (returns results, not fluent) --------------------- */
    searchTags(query = '') {
        if (!this._topTags) return [];
        const normalized = String(query).trim().toLowerCase();
        const results = this._topTags.filter(tag =>
            `${tag.label} ${tag.topics.join(' ')} ${tag.category} ${tag.id}`.toLowerCase().includes(normalized)
        );
        if (this.debug) console.log(`[TagManager] searchTags("${query}") => ${results.length}`);
        return results;
    }

    orderTopTagsByPriority() {
        if (!this._topTags) return this; // fluent

        // ensure array form
        const tags = Array.isArray(this._topTags) ? [...this._topTags] : Object.values(this._topTags);

        const global = this.globalPriority; // may be null
        const baseOrder = ['ai', 'aws', 'programming', 'random'];

        // given a category name, return a numeric index: lower = higher priority
        const priorityIndexForCategory = (categoryName) => {
            const kind = this._categoryKind(categoryName);

            if (global) {
                // global group is index 0, everything else shifted by +1 in baseOrder order
                if (kind === global) return 0;
                const rest = baseOrder.filter(p => p !== global);
                const idx = rest.indexOf(kind);
                return idx === -1 ? Infinity : 1 + idx;
            }

            // no global: follow baseOrder
            const idx = baseOrder.indexOf(kind);
            return idx === -1 ? Infinity : idx;
        };

        // stable sort by computed index, fallback keep original index
        const withIdx = tags.map((t, i) => ({ t, i }));
        withIdx.sort((a, b) => {
            const pa = priorityIndexForCategory(a.t.category);
            const pb = priorityIndexForCategory(b.t.category);
            if (pa !== pb) return pa - pb;
            return a.i - b.i;
        });

        this._topTags = withIdx.map(x => x.t);
        if (this.debug) {
            console.log('[TagManager] orderTopTagsByPriority ->', this._topTags.map(t => `${t.id}@${t.category}`));
        }

        return this; // fluent
    }

    /* --------------------- accessors --------------------- */
    getTopTags() {
        return Array.isArray(this._topTags) ? [...this._topTags] : (this._topTags ? Object.values(this._topTags) : []);
    }

    getAllTags() {
        return Array.isArray(this._allTags) ? [...this._allTags] : (this._allTags ? Object.values(this._allTags) : []);
    }

    /* --------------------- helpers for tests ---------------------
     * setRandomFn allows tests to inject a deterministic RNG (e.g. () => 0.5)
     */
    setRandomFn(randomFn) {
        this.randomFn = randomFn;
        return this;
    }
}
