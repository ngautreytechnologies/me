// base-light-component.js
import BaseComponent from './base-component.js';

/**
 * BaseLightComponent
 * ------------------
 * Extends BaseComponent but disables Shadow DOM usage.
 * - Template HTML is injected directly into the element.
 * - CSS is injected into <head> once (not scoped).
 * - No adoptedStyleSheets — uses global styles.
 */
export default class BaseLightComponent extends BaseComponent {
    constructor(template = '', componentCss = '', dataAttrs = null) {
        // Light DOM => useShadow = false
        super(template, componentCss, dataAttrs, false);
    }

    /**
     * Override renderData for light components.
     * - Still handles [data-container] + <template> if present
     * - Falls back gracefully if no template is used
     */
    renderData(items) {
        console.log(`[${this.constructor.name}] renderData (light DOM)`, items);

        try {
            const container = this.querySelector('[data-container]') || this;
            const templateEl = this.querySelector('template');

            if (!container) {
                console.warn(`[${this.constructor.name}] No container found`);
                return;
            }

            // ✅ If no items, don't wipe out static HTML
            if (!items || items.length === 0) {
                console.log(`[${this.constructor.name}] No data → keeping static HTML`);
                return;
            }

            // Clear only if rendering dynamic data
            container.innerHTML = '';

            if (templateEl) {
                items.forEach(item => {
                    const clone = templateEl.content.cloneNode(true);

                    clone.querySelectorAll('[data-field]').forEach(el => {
                        const value = item[el.dataset.field];
                        if (value !== undefined && value !== null) {
                            el.textContent = value;
                        } else {
                            el.remove();
                        }

                        if (el.dataset.field === 'status' && value) {
                            el.classList.add(value.toLowerCase());
                        }
                    });

                    container.appendChild(clone);
                });
            } else {
                // Fallback: simple list rendering
                items.forEach(item => {
                    const el = document.createElement('div');
                    el.textContent = typeof item === 'object'
                        ? JSON.stringify(item)
                        : String(item);
                    container.appendChild(el);
                });
            }

            if (typeof this.onRender === 'function') {
                this.onRender(items);
            }
        } catch (err) {
            console.error(`[${this.constructor.name}] renderData error:`, err);
        }
    }

}
