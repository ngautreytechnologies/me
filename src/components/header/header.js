import BaseComponent from '../base-component.js';
import css from './certifications.css';
import templateHtml from './certifications.html';

const data = {
    name: "Nicholas Gautrey",
    roles: ["Principal Engineer", "DendriFlow", "AI Innovator"],
    image: "./images/profile.jfif",
    contacts: [
        { type: "email", url: "mailto:ngautreytechnologies@gmail.com", label: "ngautreytechnologies@gmail.com", icon: "fa-solid fa-envelope" },
        { type: "github", url: "https://github.com/ngautreytechnologies/DendriFlow", label: "ngautreytechnologies/DendriFlow", icon: "fa-brands fa-github" },
        { type: "linkedin", url: "https://www.linkedin.com/in/nicholas-gautrey-5b0b17378/", label: "linkedin.com/in/nicholas-gautrey-5b0b17378/", icon: "fa-brands fa-linkedin" }
    ]
};

class Certifications extends BaseComponent {
    constructor() {
        super(templateHtml, css);

        // Initialize reactive data
        this.data.set(data);
    }

    connectedCallback() {
        super.connectedCallback();
        this.render();
    }

    render() {
        const container = this.shadow.querySelector('[data-container]');
        const templateEl = this.shadow.querySelector('template');
        if (!container || !templateEl) return;

        // Clear existing content 
        container.innerHTML = '';

        this.data.get().forEach(cert => {
            const clone = templateEl.content.cloneNode(true);

            // Fill standard fields
            clone.querySelectorAll('[data-field]').forEach(el => {
                const field = el.dataset.field;
                if (cert[field]) el.textContent = cert[field];
            });
            container.appendChild(clone);
        });
    }
}

customElements.define('certification-list', Certifications);
