// base-shadow-component.js
import { removeElements } from '../utils/dom.js';
import BaseComponent from './base-component.js';

export default class BaseShadowComponent extends BaseComponent {
    constructor(template = '', componentCss = '', dataAttrs = null) {
        // Shadow DOM => useShadow = true
        super(template, componentCss, dataAttrs, true);
    }

    renderData(items) {
        console.group(`[${this.constructor.name}] renderData (shadow)`);
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

            // Clear container only if we have data
            if (!items || (Array.isArray(items) && items.length === 0)) {
                console.log(`[${this.constructor.name}] No data to render, container cleared`);
                removeElements(container, 'template');
                console.groupEnd();
                return;
            }

            removeElements(container, 'template');
            const dataArray = Array.isArray(items) ? items : [items];
            console.log('Rendering data array:', dataArray);

            dataArray.forEach((item, index) => {
                console.groupCollapsed(`[Render] Item ${index} (${item?.id || 'no-id'})`);
                console.log('Original item data:', item);

                const clone = templateEl.content.cloneNode(true);
                console.log('Cloned template:', clone);

                // ✅ Set ID on the first element if present
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

                // Process each [data-field]
                clone.querySelectorAll('[data-field]').forEach(el => {
                    const field = el.dataset.field;
                    let value = null;

                    console.log(`Field "${field}"`);
                    if (item == null) {
                        value = null;
                        console.log('Item is null, field value set to null');
                    } else if (typeof item === 'object' && field in item) {
                        value = item[field];
                        console.log(`Field found in item:`, value);
                    } else if (typeof item !== 'object' && field === 'value') {
                        value = item;
                        console.log(`Primitive item, using value for field:`, value);
                    } else {
                        console.log('Field not found in item, value remains null');
                    }

                    // If value is a function, execute it
                    if (typeof value === 'function') {
                        value = value(item, index, el);
                        console.log('Field value was function, executed result:', value);
                    }

                    // Apply the value to the element
                    if (value == null || value === false) {
                        el.remove();
                        console.log('Value null or false → element removed');
                    } else if (typeof value === 'string' || typeof value === 'number') {
                        el.textContent = value;
                        console.log('Set textContent:', value);
                    } else if (value instanceof Node) {
                        el.innerHTML = '';
                        el.appendChild(value);
                        console.log('Appended Node:', value);
                    } else if (Array.isArray(value)) {
                        el.innerHTML = '';
                        value.forEach(v => el.appendChild(document.createTextNode(v + ' ')));
                        console.log('Appended array values as text nodes:', value);
                    } else if (typeof value === 'object') {
                        el.textContent = JSON.stringify(value);
                        console.log('Set JSON stringified object as textContent:', value);
                    } else {
                        el.textContent = String(value);
                        console.log('Fallback string conversion:', value);
                    }

                    // Special handling for status
                    if (field === 'status' && typeof value === 'string') {
                        el.classList.add(value.toLowerCase());
                        console.log(`Added status class: ${value.toLowerCase()}`);
                    }

                    console.groupEnd();
                });

                container.appendChild(clone);
                console.log('Appended cloned element to container');
                console.groupEnd();
            });

            console.log('Final container content:', container?.innerHTML);

            if (typeof this.onRender === 'function') {
                console.log('Calling onRender hook');
                this.onRender(dataArray);
            }

        } catch (err) {
            console.error(`[${this.constructor.name}] renderData error:`, err);
        } finally {
            console.groupEnd();
        }
    }
}