// base-shadow-component.js
import { removeElements } from '../utils/dom.js';
import BaseComponent from './base-component.js';

export default class BaseShadowComponent extends BaseComponent {
    constructor(template = '', componentCss = '', dataAttrs = null) {
        super(template, componentCss, dataAttrs, true);
    }

    renderTemplateData(items) {
        console.group(`[${this.constructor.name}] renderTemplateData (shadow)`);
        console.log('Input items:', items);

        try {
            const container = this.root.querySelector('[data-container]');
            const templateEl = this.root.querySelector('template');

            if (!container) {
                console.warn(`[${this.constructor.name}] No container found`);
                console.groupEnd();
                return;
            }

            if (!templateEl) {
                console.warn(`[${this.constructor.name}] No template found, skipping dynamic rendering`);
                console.groupEnd();
                return;
            }

            // Clear only previously rendered template nodes
            Array.from(container.querySelectorAll('[data-rendered]')).forEach(n => n.remove());
            console.log('Cleared previously rendered template nodes');

            if (!items || (Array.isArray(items) && items.length === 0)) {
                console.log(`[${this.constructor.name}] No data to render`);
                console.groupEnd();
                return;
            }

            const dataArray = Array.isArray(items) ? items : [items];
            console.log('Rendering data array:', dataArray);

            dataArray.forEach((item, index) => {
                console.groupCollapsed(`[Render] Item ${index} (${item?.id || 'no-id'})`);
                console.log('Original item data:', item);

                const clone = templateEl.content.cloneNode(true);

                // mark cloned nodes
                clone.childNodes.forEach(n => n.setAttribute?.('data-rendered', 'true'));

                // Set ID if present
                if (item && typeof item === 'object' && item.id) {
                    const firstEl = clone.firstElementChild;
                    if (firstEl) {
                        firstEl.id = item.id;
                        firstEl.setAttribute('id', item.id);
                        console.log(`Assigned ID "${item.id}" to first element`);
                    } else {
                        console.warn('First element missing, cannot set ID');
                    }
                }

                // Apply [data-field] values
                clone.querySelectorAll('[data-field]').forEach(el => {
                    const field = el.dataset.field;
                    let value = null;

                    if (item == null) {
                        value = null;
                    } else if (typeof item === 'object' && field in item) {
                        value = item[field];
                    } else if (typeof item !== 'object' && field === 'value') {
                        value = item;
                    }

                    if (typeof value === 'function') {
                        value = value(item, index, el);
                    }

                    if (value == null || value === false) {
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

                    if (field === 'status' && typeof value === 'string') {
                        el.classList.add(value.toLowerCase());
                    }
                });

                container.appendChild(clone);
                console.groupEnd();
            });

            console.log('Final container content:', container?.innerHTML);

            if (typeof this.onRender === 'function') {
                this.onRender(dataArray);
            }
        } catch (err) {
            console.error(`[${this.constructor.name}] renderTemplateData error:`, err);
        } finally {
            console.groupEnd();
        }
    }

    renderSupplementaryData(items) {
        console.group(`[${this.constructor.name}] renderSupplementaryData`);
        try {
            const containers = Array.from(this.root.querySelectorAll('[data-supplementary-container]'));
            if (!containers.length) {
                console.warn(`[${this.constructor.name}] No supplementary container found`);
                console.groupEnd();
                return;
            }

            const dataArray = Array.isArray(items) ? items : [items];
            console.log('Rendering supplementary data array:', dataArray);

            containers.forEach(container => {
                // Save original container HTML as template
                const templateHtml = container.innerHTML;

                // Remove previously rendered supplementary nodes
                Array.from(container.querySelectorAll('[data-rendered-supplementary]')).forEach(n => n.remove());

                dataArray.forEach((item, index) => {
                    // Create temporary container
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = templateHtml.trim();

                    // Mark nodes as rendered
                    tempDiv.querySelectorAll('*').forEach(n => n.setAttribute('data-rendered-supplementary', 'true'));

                    // Apply [data-field] bindings
                    tempDiv.querySelectorAll('[data-field]').forEach(el => {
                        const field = el.dataset.field;
                        let value = item[field];

                        if (typeof value === 'function') value = value(item, index, el);

                        if (value == null || value === false) {
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
                    });

                    // Append processed nodes into the container
                    Array.from(tempDiv.childNodes).forEach(n => container.appendChild(n));
                });

                console.log(`[${this.constructor.name}] Finished rendering supplementary data`);
            });
        } catch (err) {
            console.error(`[${this.constructor.name}] renderSupplementaryData error:`, err);
        } finally {
            console.groupEnd();
        }
    }

}
