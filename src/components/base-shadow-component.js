// base-shadow-component.js
import BaseComponent from './base-component.js';

export default class BaseShadowComponent extends BaseComponent {
    constructor(template = '', componentCss = '', dataAttrs = null) {
        // Shadow DOM => useShadow = true
        super(template, componentCss, dataAttrs, true);
    }

    renderData(items) {
        super.renderData(items);
    }
}
