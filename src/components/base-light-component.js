// base-light-component.js
import BaseComponent from './base-component.js';

export default class BaseLightComponent extends BaseComponent {
    constructor(template = '', componentCss = '', dataAttrs = null) {
        // Light DOM => useShadow = false
        super(template, componentCss, dataAttrs, false);
    }

    renderData(items) {
        super.renderData(items);
    }
}
