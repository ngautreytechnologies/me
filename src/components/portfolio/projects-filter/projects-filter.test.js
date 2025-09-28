/**
 * @jest-environment jsdom
 */
import ProjectsFilter from './projects-filter'; // adjust import

describe('_getRenderableTagsFromTaxonomy', () => {
    let component;

    beforeEach(() => {
        // Fresh instance before each test
        component = new ProjectsFilter();
        component.maxPerCategory = 3;

        // Stub helper methods
        component._selectTopics = jest.fn((topics, max, priority) => topics.slice(0, max));
        component._humanLabel = jest.fn((val) => val.charAt(0).toUpperCase() + val.slice(1));

        // Reset URL params
        delete window.location;
        window.location = new URL('https://example.com');
    });

    test('returns [] if taxonomy is null or invalid', () => {
        expect(component._getRenderableTagsFromTaxonomy(null)).toEqual([]);
        expect(component._getRenderableTagsFromTaxonomy(undefined)).toEqual([]);
        expect(component._getRenderableTagsFromTaxonomy('not-an-object')).toEqual([]);
    });

    test('handles string topics and transforms them into tag objects', () => {
        const taxonomy = {
            Programming: {
                name: 'programming',
                topics: ['javascript', 'python', 'go']
            }
        };

        const result = component._getRenderableTagsFromTaxonomy(taxonomy);

        expect(result).toHaveLength(3);
        expect(result[0]).toMatchObject({
            id: 'tag-0',
            label: 'Javascript',
            topics: ['javascript'],
            category: 'programming'
        });
        expect(component._humanLabel).toHaveBeenCalledWith('javascript');
    });

    test('handles object topics and preserves label and topics array', () => {
        const taxonomy = {
            AI: {
                name: 'ai',
                topics: [
                    { id: 't1', label: 'GPT', topics: ['llm', 'agent'] },
                    { id: 't2', label: 'Copilot', topics: ['assistant'] }
                ]
            }
        };

        const result = component._getRenderableTagsFromTaxonomy(taxonomy);

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({
            id: 'tag-0',
            label: 'GPT',
            topics: ['llm', 'agent'],
            category: 'ai'
        });
    });

    test('skips categories with invalid or missing topics array', () => {
        const taxonomy = {
            Broken: { name: 'broken', topics: null },
            Valid: { name: 'valid', topics: ['tag1'] }
        };

        const result = component._getRenderableTagsFromTaxonomy(taxonomy);
        expect(result).toHaveLength(1);
        expect(result[0].topics).toEqual(['tag1']);
    });

    test('respects maxPerCategory and slices topics accordingly', () => {
        component._selectTopics.mockImplementation((topics, max) => topics.slice(0, max));

        const taxonomy = {
            Cloud: {
                name: 'cloud',
                topics: ['aws', 'lambda', 's3', 'dynamodb']
            }
        };

        const result = component._getRenderableTagsFromTaxonomy(taxonomy);
        expect(result).toHaveLength(3);
        expect(component._selectTopics).toHaveBeenCalledWith(
            ['aws', 'lambda', 's3', 'dynamodb'],
            3,
            'aws'
        );
    });

    test('infers priority based on category name if no query param is present', () => {
        const taxonomy = {
            AI: { name: 'ai-ml', topics: ['model'] },
            Cloud: { name: 'cloud-services', topics: ['lambda'] },
            Frameworks: { name: 'programming-frameworks', topics: ['react'] },
            Other: { name: 'misc', topics: ['thing'] }
        };

        component._getRenderableTagsFromTaxonomy(taxonomy);

        expect(component._selectTopics).toHaveBeenNthCalledWith(
            1,
            ['model'],
            3,
            'ai'
        );
        expect(component._selectTopics).toHaveBeenNthCalledWith(
            2,
            ['lambda'],
            3,
            'aws'
        );
        expect(component._selectTopics).toHaveBeenNthCalledWith(
            3,
            ['react'],
            3,
            'programming'
        );
        expect(component._selectTopics).toHaveBeenNthCalledWith(
            4,
            ['thing'],
            3,
            'random'
        );
    });

    test('overrides priority from URL param (?t=aws)', () => {
        window.location = new URL('https://example.com/?t=aws');

        const taxonomy = {
            AI: { name: 'ai', topics: ['ml'] }
        };

        component._getRenderableTagsFromTaxonomy(taxonomy);

        expect(component._selectTopics).toHaveBeenCalledWith(['ml'], 3, 'aws');
    });

    test('gracefully handles non-string, non-object topics', () => {
        const taxonomy = {
            Weird: {
                name: 'weird',
                topics: [42, true, null]
            }
        };

        const result = component._getRenderableTagsFromTaxonomy(taxonomy);
        expect(result).toHaveLength(3);
        expect(result[0]).toMatchObject({
            label: '42',
            topics: ['42']
        });
    });

    test('produces unique tag IDs across multiple categories', () => {
        const taxonomy = {
            A: { name: 'a', topics: ['tag1', 'tag2'] },
            B: { name: 'b', topics: ['tag3'] }
        };

        const result = component._getRenderableTagsFromTaxonomy(taxonomy);
        const ids = result.map((r) => r.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

});
