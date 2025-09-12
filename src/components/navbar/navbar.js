import BaseComponent from '../base-component.js';
import templateHtml from './navbar.html'; // HTML file with your profile + contacts
import css from './navbar.css'; // your CSS

class Navbar extends BaseComponent {
    constructor() {
        super(templateHtml, css); // Inject HTML and CSS into shadow DOM
    }

    connectedCallback() {
        super.connectedCallback();
        // For static HTML, nothing else is needed
    }
}

customElements.define('navigation-bar', Navbar);
