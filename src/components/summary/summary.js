import templateHtml from './summary.html';
import css from './summary.css';
import BaseLightComponent from '../base-light-component.js';

class Summary extends BaseLightComponent {
    constructor() {
        super(templateHtml, css);
    }

    connectedCallback() {
        super.connectedCallback();
    }
}

customElements.define('cv-summary', Summary);
