import BaseLightComponent from '../base-light-component';

import templateHtml from './header.html';
import css from './header.css';

class HeaderContent extends BaseLightComponent {
    constructor() {
        super(templateHtml, css);
    }

    connectedCallback() {
        super.connectedCallback();

        const pdfBtn = this.root.querySelector('#pdf-btn');
        const ctaBtn = this.root.querySelector('#cta-btn');

        if (pdfBtn) pdfBtn.addEventListener('click', () => this.exportPDF());
        if (ctaBtn) ctaBtn.addEventListener('click', () => this.contactMe());
    }

    exportPDF() {
        window.print();
    }

    contactMe() {
        const email = 'ngautreytechnologies@gmail.com';
        const subject = encodeURIComponent('Reaching Out - Portfolio Website');
        const body = encodeURIComponent('I wanted to reach out regarding...');
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    }
}

customElements.define('header-content', HeaderContent);
