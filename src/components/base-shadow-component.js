// base-shadow-component.js
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
                container.innerHTML = '';
                console.groupEnd();
                return;
            }

            container.innerHTML = '';
            const dataArray = Array.isArray(items) ? items : [items];
            console.log('Rendering data array:', dataArray);
            dataArray.forEach((item, index) => {
                const clone = templateEl.content.cloneNode(true);
                console.log(`Cloning template for item at index ${index}:`, item, clone);

                clone.querySelectorAll('[data-field]').forEach(el => {
                    const field = el.dataset.field;
                    let value = null;

                    // Determine value based on item type
                    if (item == null) {
                        console.log(`Item at index ${index} is null or undefined`);
                        value = null;
                    } else if (typeof item === 'object' && field in item) {
                        console.log(`Extracting field '${field}' from item at index ${index}`);
                        value = item[field];
                    } else if (typeof item !== 'object' && field === 'value') {
                        console.log(`Using item itself as value at index ${index}`);
                        value = item;
                    }

                    // Function support
                    if (typeof value === 'function') value = value(item, index, el);

                    // Render into element
                    if (value == null || value === false) {
                        console.log(`Removing element for null/false value of field '${field}' at index ${index}`);
                        el.remove();
                    } else if (typeof value === 'string' || typeof value === 'number') {
                        console.log(`Setting text for field '${field}' at index ${index}:`, value);
                        el.textContent = value;
                    } else if (value instanceof Node) {
                        console.log(`Appending Node for field '${field}' at index ${index}:`, value);
                        el.innerHTML = '';
                        el.appendChild(value);
                    } else if (Array.isArray(value)) {
                        console.log(`Rendering array for field '${field}' at index ${index}:`, value);
                        el.innerHTML = '';
                        value.forEach(v => el.appendChild(document.createTextNode(v + ' ')));
                    } else if (typeof value === 'object') {
                        console.log(`Stringifying object for field '${field}' at index ${index}:`, value);
                        el.textContent = JSON.stringify(value);
                    } else {
                        console.log(`Unhandled type for field '${field}' at index ${index}:`, value);
                        el.textContent = String(value);
                    }

                    // Optional status class
                    if (field === 'status' && typeof value === 'string') {
                        console.log(`Adding status class for field '${field}' at index ${index}:`, value.toLowerCase());
                        el.classList.add(value.toLowerCase());
                    }
                });

                console.log('Appending cloned element:', clone);
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