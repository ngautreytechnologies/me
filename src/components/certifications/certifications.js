import BaseShadowComponent from '../base-shadow-component';
import BaseComponent from '../base-component.js';
import css from './certifications.css';
import templateHtml from './certifications.html';

const data = [
    { name: "Neo4j & LLM Fundamentals", issuer: "Neo4j", date: "Issued Apr 2024", credential: "1729e21e-3334-44cd-ae65-63316aab624f", status: "Current" },
    { name: "Graph Data Modeling Fundamentals", issuer: "Neo4j", date: "Issued Feb 2024", credential: "6ee6f1bc-3fcd-48f1-853a-84eefa5b5f83", status: "Current" },
    { name: "Neo4j Fundamentals", issuer: "Neo4j", date: "Issued Feb 2024", credential: "0c5f2e9a-a3af-4ffd-b140-256cca71f4a7", status: "Current" },
    { name: "AWS Certified Developer - Associate", issuer: "AWS", date: "Issued Oct 2019 · Expired Oct 2022", status: "Expired" },
    { name: "AWS Certified Solutions Architect - Associate", issuer: "AWS", date: "Issued Aug 2019 · Expired Aug 2022", status: "Expired" }
];

class Certifications extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
    }

    connectedCallback() {
        super.connectedCallback();
    }

    render() {
        const container = this.root.querySelector('[data-container]');
        const templateEl = this.root.querySelector('template');
        console.log('templateEl:', templateEl);

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
