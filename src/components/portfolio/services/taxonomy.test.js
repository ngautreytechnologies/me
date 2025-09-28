/**
 * @jest-environment jsdom
 */
import { TagManager } from './taxonomy';

const sampleTaxonomy = {
    ai: {
        name: 'AI & ML',
        topics: [
            'ai',
            { id: 'llm', label: 'LLM', topics: ['llm', 'transformers'] },
            { id: 'copilot', label: 'GitHub Copilot', topics: ['copilot'] },
            'agentic'
        ]
    },
    aws: {
        name: 'Cloud & AWS',
        topics: ['lambda', 's3', 'eventbridge', 'iam']
    },
    programming: {
        name: 'Programming Frameworks',
        topics: ['javascript', 'react', 'fastapi', { id: 'py', label: 'Python', topics: ['python'] }]
    }
};

describe('TagManager', () => {
    beforeEach(() => {
        // reset URL state
        delete window.location;
        window.location = new URL('http://localhost');
    });

    it('initializes with flattened tags and applies topic selection', () => {
        const manager = new TagManager({ taxonomy: sampleTaxonomy, maxPerCategory: 2 });

        const allTags = manager._allTags;
        expect(allTags).toBeDefined();
        expect(allTags.length).toBeGreaterThan(0);
        expect(allTags[0]).toHaveProperty('id');
        expect(allTags[0]).toHaveProperty('label');
        expect(allTags[0]).toHaveProperty('topics');
        expect(allTags[0]).toHaveProperty('category');

        const topTags = manager.getTopTags();
        expect(topTags.length).toBeGreaterThan(0);
        expect(topTags.every(t => t.id && t.label)).toBe(true);
    });

    it('flattens taxonomy with proper metadata', () => {
        const manager = new TagManager({ taxonomy: sampleTaxonomy });
        const flat = manager._flattenTaxonomy();
        expect(flat.some(t => t.category === 'AI & ML')).toBe(true);
        expect(flat.some(t => t.category === 'Cloud & AWS')).toBe(true);
        expect(flat.some(t => t.category === 'Programming Frameworks')).toBe(true);
    });

    it('respects global priority via URL parameter', () => {
        window.location = new URL('http://localhost/?t=aws');
        const manager = new TagManager({
            taxonomy: sampleTaxonomy, maxPerCategory: 3,
            urlSearchParams: '?t=aws'
        });
        const priorityCategory = manager._determinePriority('AI & ML');
        expect(priorityCategory).toBe('aws');
    });

    it('infers priority from category name', () => {
        const manager = new TagManager({ taxonomy: sampleTaxonomy });
        expect(manager._determinePriority('AI & ML')).toBe('ai');
        expect(manager._determinePriority('Cloud')).toBe('aws');
        expect(manager._determinePriority('Programming Languages')).toBe('programming');
        expect(manager._determinePriority('Unknown')).toBe('random');
    });

    describe('_normalizeTopic', () => {
        const manager = new TagManager({ taxonomy: {} });

        it('handles string topic', () => {
            const topic = manager._normalizeTopic('python', 1);
            expect(topic.label).toBe('Python');
            expect(topic.topics).toContain('python');
        });

        it('handles object topic', () => {
            const topic = manager._normalizeTopic({ id: 'id1', label: 'Test', topics: ['t'] }, 1);
            expect(topic.id).toBe('tag-1');
            expect(topic.label).toBe('Test');
            expect(topic.topics).toContain('t');
        });

        it('handles fallback cases', () => {
            const topic = manager._normalizeTopic(42, 1);
            expect(topic.label).toBe('42');
            expect(topic.topics).toContain('42');
        });
    });

    describe('_selectTopics', () => {
        const manager = new TagManager({ taxonomy: {} });

        const topics = [
            { id: 'ai', label: 'AI' },
            { id: 'lambda', label: 'Lambda' },
            { id: 'react', label: 'React' },
            { id: 'python', label: 'Python' },
            { id: 'copilot', label: 'Copilot' }
        ];

        it('selects weighted topics by priority', () => {
            const result = manager._selectTopics(topics, 4, 'ai');
            expect(result.length).toBe(4);
            const priorityMatches = result.filter(t => /(ai|llm|agent|copilot)/i.test(t.label));
            expect(priorityMatches.length).toBeGreaterThan(0);
        });

        it('returns empty array if no topics provided', () => {
            const result = manager._selectTopics([], 5, 'aws');
            expect(result).toEqual([]);
        });
    });

    describe('Tag selection API', () => {
        let manager;
        beforeEach(() => {
            manager = new TagManager({ taxonomy: sampleTaxonomy });
        });

        it('selects and deselects tags', () => {
            const tag = manager.getTopTags()[0];
            manager.selectTag(tag.id);
            expect(manager.getSelectedTags()[0].id).toBe(tag.id);
            manager.deselectTag(tag.id);
            expect(manager.getSelectedTags()).toHaveLength(0);
        });

        it('clears selection', () => {
            const tag = manager.getTopTags()[0];
            manager.selectTag(tag.id);
            manager.clearSelection();
            expect(manager.getSelectedTags()).toHaveLength(0);
        });
    });

    describe('searchTags()', () => {
        let manager;
        beforeEach(() => {
            manager = new TagManager({ taxonomy: sampleTaxonomy });
        });

        it('returns matching tags', () => {
            const results = manager.searchTags('python');
            expect(results.some(t => /python/i.test(t.label) || t.topics.includes('python'))).toBe(true);
        });

        it('is case-insensitive', () => {
            // override _pickRandom to always return all items (no randomness)
            manager._pickRandom = (array) => array;
            const results = manager.searchTags('PYTHON');
            expect(results.length).toBeGreaterThan(0);
        });

        it('returns empty array for no match', () => {
            const results = manager.searchTags('nonexistent');
            expect(results).toEqual([]);
        });
    });
});

test('orderTopTagsByPriority respects global t param and puts that group first', () => {
    const manager = new TagManager({
        taxonomy: sampleTaxonomy,
        maxPerCategory: 5,
        urlSearchParams: '?t=aws',
        randomFn: () => 0.42, // deterministic shuffle
        debug: false
    });

    // ensure tags exist
    const before = manager.getTopTags();
    expect(before.length).toBeGreaterThan(0);

    // apply ordering
    manager.orderTopTagsByPriority();
    const ordered = manager.getTopTags();

    // first chunk should be AWS/cloud-derived categories
    const firstCategoryKinds = ordered.slice(0, 2).map(t => manager._categoryKind(t.category));
    expect(firstCategoryKinds.every(kind => kind === 'aws')).toBe(true);
});
