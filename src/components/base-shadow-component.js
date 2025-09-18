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
                const clone = templateEl.content.cloneNode(true);

                // ✅ If the item has an id, set it on the first element of the clone
                if (item && typeof item === 'object' && item.id) {
                    const firstEl = clone.firstElementChild;
                    if (firstEl) {
                        firstEl.id = item.id;
                        firstEl.setAttribute('id', item.id);
                    }
                }

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

                    if (field === 'status' && typeof value === 'string') {
                        el.classList.add(value.toLowerCase());
                    }
                });

                container.appendChild(clone);
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