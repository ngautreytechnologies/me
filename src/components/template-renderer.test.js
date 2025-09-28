// src/template-renderer.unit.test.js
import { TemplateRenderer } from './template-renderer.js';

describe('TemplateRenderer', () => {
    let container;

    beforeEach(() => {
        document.body.innerHTML = `
      <div id="test-container">
        <template>
          <div class="item">
            <span data-field="name"></span>
            <span data-field="status"></span>
            <p>{{description}}</p>
            <span data-field="extra"></span>
          </div>
        </template>
      </div>
    `;
        container = document.getElementById('test-container');
    });

    function render(data) {
        // Always reset container before render to avoid leftover DOM
        container.querySelectorAll('.item').forEach(el => el.remove());
        TemplateRenderer.render(container, data);
    }

    function getItem(index = 0) {
        const items = Array.from(container.querySelectorAll('.item'));

        if (items.length === 0) {
            throw new Error(`No .item elements rendered — check template or data.`);
        }

        if (index >= items.length) {
            throw new Error(`Requested index ${index} but only ${items.length} items rendered.`);
        }

        return items[index];
    }

    /**
     * Combined helper for convenience — keeps your existing calls valid.
     */
    function renderAndGetItem(data, index = 0) {
        render(data);
        return getItem(index);
    }

    test('renders basic data correctly', () => {
        const data = { name: 'Alice', status: 'active', description: 'Test desc' };
        const item = renderAndGetItem(data);

        expect(item.querySelector('[data-field="name"]').textContent).toBe('Alice');
        expect(item.querySelector('[data-field="status"]').textContent).toBe('active');
        expect(item.querySelector('p').textContent).toBe('Test desc');
    });

    test('renders array of items', () => {
        const data = [
            { name: 'Alice', status: 'active', description: 'Desc 1' },
            { name: 'Bob', status: 'inactive', description: 'Desc 2' }
        ];

        const first = renderAndGetItem(data, 0);
        const second = renderAndGetItem(data, 1);

        expect(first.querySelector('[data-field="name"]').textContent).toBe('Alice');
        expect(second.querySelector('[data-field="name"]').textContent).toBe('Bob');
    });

    test('supports function values', () => {
        const data = { name: (item) => `Name: ${item.actual}`, actual: 'Charlie' };
        const item = renderAndGetItem(data);

        expect(item.querySelector('[data-field="name"]').textContent).toBe('Name: Charlie');
    });

    test('supports array and object values', () => {
        const data = { name: ['A', 'B'], extra: { key: 'value' } };
        const item = renderAndGetItem(data);

        expect(item.querySelector('[data-field="name"]').textContent).toBe('A B ');
        expect(item.querySelector('[data-field="extra"]').textContent).toBe(JSON.stringify({ key: 'value' }));
    });

    test('supports mustache {{}} bindings', () => {
        const data = { description: 'Dynamic text' };
        const item = renderAndGetItem(data);

        expect(item.querySelector('p').textContent).toBe('Dynamic text');
    });

    test('clears previously rendered nodes', () => {
        const data1 = { name: 'Alice', status: 'active', description: 'Desc 1' };
        TemplateRenderer.render(container, data1);

        const data2 = { name: 'Bob', status: 'inactive', description: 'Desc 2' };
        const item2 = renderAndGetItem(data2);

        const items = container.querySelectorAll('.item');
        expect(items.length).toBe(1);
        expect(item2.querySelector('[data-field="name"]').textContent).toBe('Bob');
    });

    test('removes null/false values', () => {
        const data = { name: null, status: false, description: 'Keep me' };
        const item = renderAndGetItem(data);

        expect(item.querySelector('[data-field="name"]')).toBeNull();
        expect(item.querySelector('[data-field="status"]')).toBeNull();
        expect(item.querySelector('p').textContent).toBe('Keep me');
    });

    test('renders Node values', () => {
        const strong = document.createElement('strong');
        strong.textContent = 'Bold';
        const data = { name: strong };
        const item = renderAndGetItem(data);

        const el = item.querySelector('[data-field="name"]');
        expect(el.querySelector('strong').textContent).toBe('Bold');
    });
});

describe('TemplateRenderer - tag rendering', () => {
    let container;

    beforeEach(() => {
        document.body.innerHTML = `
          <div id="test-container">
            <template id="tag-item-template">
              <div class="tag-card" data-field="name"></div>
            </template>
          </div>
        `;
        container = document.getElementById('test-container');
    });

    function renderTags(tags) {
        // Clear previously rendered
        container.querySelectorAll('.tag-card').forEach(el => el.remove());
        TemplateRenderer.render(container, tags, { templateSelector: 'template', renderFlag: 'data-rendered' });
    }

    function getTag(index = 0) {
        const nodes = Array.from(container.querySelectorAll('.tag-card'));
        if (!nodes.length) throw new Error('No tag-card elements rendered');
        if (index >= nodes.length) throw new Error(`Requested index ${index} exceeds ${nodes.length}`);
        return nodes[index];
    }

    test('renders single tag correctly', () => {
        const tags = [{ id: 'tag-1', name: 'Artificial Intelligence' }];
        renderTags(tags);

        const tag = getTag();
        expect(tag.textContent).toBe('Artificial Intelligence');
        expect(tag.getAttribute('data-rendered')).toBe('true');
    });

    test('renders multiple tags correctly', () => {
        const tags = [
            { id: 'tag-1', name: 'AI' },
            { id: 'tag-2', name: 'AWS' },
            { id: 'tag-3', name: 'Python' }
        ];
        renderTags(tags);

        const tag0 = getTag(0);
        const tag1 = getTag(1);
        const tag2 = getTag(2);

        expect(tag0.textContent).toBe('AI');
        expect(tag1.textContent).toBe('AWS');
        expect(tag2.textContent).toBe('Python');
    });

    test('handles function values for tag names', () => {
        const tags = [{ id: 'tag-1', name: t => `Tag: ${t.id}` }];
        renderTags(tags);

        const tag = getTag();
        expect(tag.textContent).toBe('Tag: tag-1');
    });

    test('clears previously rendered tags', () => {
        const first = [{ id: 'tag-1', name: 'AI' }];
        const second = [{ id: 'tag-2', name: 'AWS' }];

        renderTags(first);
        expect(container.querySelectorAll('.tag-card').length).toBe(1);

        renderTags(second);
        const tags = container.querySelectorAll('.tag-card');
        expect(tags.length).toBe(1);
        expect(tags[0].textContent).toBe('AWS');
    });

    test('renders tags with mustache style bindings', () => {
        const tags = [{ id: 'tag-1', name: '{{id}}' }];
        renderTags(tags);

        const tag = getTag();
        expect(tag.textContent).toBe('tag-1');
    });
});
