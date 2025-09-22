import BaseShadowComponent from '../base-shadow-component.js';
import css from './education.css';
import templateHtml from './education.html';

const data = [
    {
        degree: "Bachelor's Degree, Software Engineering",
        institution: "University of Northampton",
        period: "2009 - 2012",
        grade: "Grade: First Honours",
        description: `
            <ul>
                <li>Completed a 3-year programme with a focus on software engineering in the final two years</li>
                <li>Studied programming, systems design, software architecture, database technologies, and artificial intelligence</li>
                <li>Proactively learned C# outside of the curriculum to enhance employability.</li>
                <li>Recognised for strong academic performance, fast learning, and a passionate approach to software development</li>
            </ul>
            `
    },
    {
        degree: "A2 Level, Applied ICT Double Award",
        institution: "Northampton College",
        period: "2007 - 2009",
        grade: "Grade: CC"
    }
];

/**
 * Education Component
 * ------------------
 * Renders a list of educational qualifications.
 * Uses BaseComponent’s reactive data binding.
 */
class Education extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
    }

    connectedCallback() {
        super.connectedCallback();
        super.triggerTemplateRender(data);
    }

    renderTemplateData(items) {
        // Call parent method first
        super.renderTemplateData(items);

        // Then handle custom rendering (slot replacement)
        const container = this.root.querySelector('[data-container]');
        if (!container) return;

        const itemElements = container.querySelectorAll('.education-item');

        items.forEach((item, index) => {
            const el = itemElements[index];
            if (!el) return;

            if (item.description) {
                const descEl = document.createElement('div');
                descEl.className = 'education-description';
                descEl.innerHTML = item.description;

                const slot = el.querySelector('slot[name="description"]');
                if (slot) slot.replaceWith(descEl);
            }
        });
    }
}

customElements.define('education-list', Education);
