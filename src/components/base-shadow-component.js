import BaseComponent from './base-component';
import { TemplateRenderer as DefaultRenderer } from './template-renderer';

export default class BaseShadowComponent extends BaseComponent {
    /**
     * @param {string} template 
     * @param {string} componentCss 
     * @param {Object|null} dataAttrs 
     * @param {object} renderer - Optional dependency injection for TemplateRenderer (for testing)
     */
    constructor(template = '', componentCss = '', dataAttrs = null, renderer = DefaultRenderer) {
        super(template, componentCss, dataAttrs, true);
        this._renderer = renderer;
    }

    /**
     * Render main template data into a container
     * @param {any} items 
     * @param {string} containerSelector 
     */
    renderTemplateData(items, containerSelector = '[data-container]') {
        const container = this._find(containerSelector);
        if (!container) return false;

        this._renderer.render(container, items, {
            templateSelector: 'template',
            renderFlag: 'data-rendered'
        });

        return true;
    }

    /**
     * Render supplementary data into any container with [data-supplementary-container]
     * @param {any} items 
     */
    renderSupplementaryData(items) {
        const containers = this._findAll('[data-supplementary-container]');
        if (!containers.length) return false;

        const dataArray = Array.isArray(items) ? items : [items];

        containers.forEach(container => {
            const templateHtml = container.innerHTML;
            this._renderer.render(container, dataArray, {
                templateHtml,
                renderFlag: 'data-rendered-supplementary'
            });
        });

        return true;
    }

    // -----------------------
    // Internal DOM query helpers (easy to mock in tests)
    // -----------------------

    _find(selector) {
        return this.root?.querySelector(selector);
    }

    _findAll(selector) {
        return Array.from(this.root?.querySelectorAll(selector) || []);
    }
}
