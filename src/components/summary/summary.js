import BaseLightComponent from '../base-light-component';

import templateHtml from './summary.html';
import css from './summary.css';

class Summary extends BaseLightComponent {
    constructor() {
        super(templateHtml, css);
    }

    connectedCallback() {
        super.connectedCallback();
        // This component is purely static html
    }
}

customElements.define('cv-summary', Summary);
