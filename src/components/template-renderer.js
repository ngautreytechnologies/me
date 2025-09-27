export class TemplateRenderer {
    /**
     * Render data into a container
     * @param {HTMLElement} container - target container
     * @param {Array|Object} items - data to render
     * @param {Object} options - optional settings
     *   options: {
     *      templateSelector: string (CSS selector for <template>)
     *      renderFlag: string (default: 'data-rendered')
     *      supplementary: boolean (default: false)
     *      allowMultipleContainers: boolean (default: false)
     *   }
     */
    static render(container, items, options = {}) {
        if (!container) return;

        const {
            templateSelector = 'template',
            renderFlag = 'data-rendered',
            supplementary = false,
            allowMultipleContainers = false
        } = options;

        const templateEl = container.querySelector(templateSelector);

        if (!templateEl) {
            console.warn(`[TemplateRenderer] No template found in container`, container);
            return;
        }

        // Clear previously rendered nodes
        Array.from(container.querySelectorAll(`[${renderFlag}]`)).forEach(n => n.remove());

        if (!items || (Array.isArray(items) && items.length === 0)) return;

        const dataArray = Array.isArray(items) ? items : [items];

        dataArray.forEach((item, index) => {
            const clone = templateEl.content.cloneNode(true);

            // Mark rendered nodes
            clone.querySelectorAll('*').forEach(n => n.setAttribute?.(renderFlag, 'true'));

            // Apply [data-field] and {{}} bindings
            TemplateRenderer.applyBindings(clone, item, index);

            container.appendChild(clone);
        });
    }

    /**
     * Apply [data-field] attributes and {{}} bindings
     */
    static applyBindings(root, item, index = 0) {
        const nodes = root.querySelectorAll('[data-field]');
        nodes.forEach(el => {
            const field = el.dataset.field;
            let value = item && field in item ? item[field] : null;

            if (typeof value === 'function') value = value(item, index, el);

            TemplateRenderer.setElementValue(el, value);
        });

        // Support {{property}} bindings in text nodes
        TemplateRenderer.bindMustache(root, item);
    }

    /**
     * Bind {{property}} in text nodes
     */
    static bindMustache(root, item) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        textNodes.forEach(node => {
            const matches = node.nodeValue.match(/\{\{(.+?)\}\}/g);
            if (!matches) return;

            let text = node.nodeValue;
            matches.forEach(match => {
                const prop = match.replace(/\{\{|\}\}/g, '').trim();
                const value = item && prop in item ? item[prop] : '';
                text = text.replace(match, String(value));
            });
            node.nodeValue = text;
        });
    }

    /**
     * Set element content based on type
     */
    static setElementValue(el, value) {
        if (value === null || value === false) {
            el.remove();
        } else if (typeof value === 'string' || typeof value === 'number') {
            el.textContent = value;
        } else if (value instanceof Node) {
            el.innerHTML = '';
            el.appendChild(value);
        } else if (Array.isArray(value)) {
            el.innerHTML = '';
            value.forEach(v => el.appendChild(document.createTextNode(v + ' ')));
        } else if (typeof value === 'object') {
            el.textContent = JSON.stringify(value);
        } else {
            el.textContent = String(value);
        }
    }
}
