import BaseComponent from './base-component';
import { TemplateRenderer as DefaultRenderer } from './template-renderer';

export default class BaseShadowComponent extends BaseComponent {
    constructor(template = '', componentCss = '', dataAttrs = null, renderer = DefaultRenderer) {
        super(template, componentCss, dataAttrs, true);
        this._renderer = renderer;
    }

    renderTemplateData(items, containerSelector = '[data-container]') {
        const container = this._find(containerSelector);
        if (!container) {
            console.warn('[BaseShadowComponent] renderTemplateData: container not found for selector', containerSelector);
            return false;
        }

        console.log('[BaseShadowComponent] Rendering items into container');

        this._renderer.render(container, items, {
            templateSelector: 'template',
            renderFlag: 'data-rendered'
        });

        console.log('[BaseShadowComponent] Render complete');

        return true;
    }

    renderSupplementaryData(items) {
        const containers = this._findAll('[data-supplementary-container]');
        if (!containers.length) {
            console.warn('[BaseShadowComponent] renderSupplementaryData: no supplementary containers found');
            return false;
        }

        const dataArray = Array.isArray(items) ? items : [items];
        console.log('[BaseShadowComponent] Rendering supplementary data', dataArray, 'into', containers);

        containers.forEach(container => {
            const templateHtml = container.innerHTML;
            this._renderer.render(container, dataArray, {
                templateHtml,
                renderFlag: 'data-rendered-supplementary'
            });
            console.log('[BaseShadowComponent] Rendered supplementary container', container);
        });

        return true;
    }

    _find(selector) {
        const el = this.root?.querySelector(selector);
        console.log('[BaseShadowComponent] _find', selector, '->', el);
        return el;
    }

    _findAll(selector) {
        const els = Array.from(this.root?.querySelectorAll(selector) || []);
        console.log('[BaseShadowComponent] _findAll', selector, '->', els.length, 'elements');
        return els;
    }
}
