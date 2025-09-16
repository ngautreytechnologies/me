import templateHtml from './summary.html'; // HTML file with your profile + contacts
import css from './summary.css'; // your CSS
import BaseLightComponent from '../base-light-component.js';

class Summary extends BaseLightComponent {
    constructor() {
        super(templateHtml, css); // Inject HTML and CSS into shadow DOM
    }

    connectedCallback() {
        super.connectedCallback();
        // For static HTML, nothing else is needed
    }
}

customElements.define('cv-summary', Summary);
