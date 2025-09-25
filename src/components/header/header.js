import BaseLightComponent from '../base-light-component';

import templateHtml from './header.html'; // HTML file with your profile + contacts
import css from './header.css'; // your CSS

class HeaderContent extends BaseLightComponent {
    constructor() {
        super(templateHtml, css); // Inject HTML and CSS into shadow DOM
    }

    connectedCallback() {
        super.connectedCallback();
        // For static HTML, nothing else is needed
    }
}

customElements.define('header-content', HeaderContent);
