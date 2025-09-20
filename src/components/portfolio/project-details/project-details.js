import BaseShadowComponent from '../../base-shadow-component.js';
import css from './project-details.css';
import templateHtml from './project-details.html';

const data = {
    title: "Contoso Energy - Serverless Event-Driven Architecture",
    overview: "Enterprise-grade event-driven platform for energy telemetry",
    keyFeatures: [
        "Real-time telemetry ingestion using AWS Kinesis",
        "Serverless compute with AWS Lambda for scalable processing",
        "Python & C# microservices orchestrated via FastAPI",
        "Event-driven alerts and logging for operational insight"
    ],
    pros: "Highly scalable, low operational cost, real-time processing",
    cons: "Requires AWS expertise, vendor lock-in risk",
    tech_stack: ["C#", "Python", "FastAPI", "AWS Lambda", "Amazon Kinesis"],
    tags: ['AWS', 'Python', 'C#', 'Serverless', 'Event-Driven'],
    problem: "Legacy systems were unable to handle real-time energy telemetry at scale.",
    solution: "Serverless architecture using AWS Lambda and Kinesis for event-driven processing."
};

export default class ProjectDetails extends BaseShadowComponent {
    constructor(debug = true) {
        super(templateHtml, css);
        this.activePage = 1;
        this.debug = debug;
        if (this.debug) console.log('[ProjectDetails] Constructor initialized');
    }

    connectedCallback() {
        this.data.set(data);
        super.connectedCallback();
        this.setupNavigation();
    }

    setupNavigation() {
        const prevBtn = this.root.querySelector('.page-prev');
        const nextBtn = this.root.querySelector('.page-next');

        prevBtn?.addEventListener('click', () => this.showPage(this.activePage - 1));
        nextBtn?.addEventListener('click', () => this.showPage(this.activePage + 1));
    }

    renderData(items) {
        // First, let BaseShadowComponent populate [data-field] automatically
        super.renderData(items);

        // Key Features -> <ul><li>…</li></ul>
        const keyFeaturesEl = this.root.querySelector('[data-field="keyFeatures"]');
        if (keyFeaturesEl && items.keyFeatures?.length) {
            keyFeaturesEl.innerHTML = '';
            const ul = document.createElement('ul');
            items.keyFeatures.forEach(f => {
                const li = document.createElement('li');
                li.textContent = f;
                ul.appendChild(li);
            });
            keyFeaturesEl.appendChild(ul);
        }

        // Tech Stack badges
        const techEl = this.root.querySelector('[data-field="tech_stack"]');
        if (techEl && items.tech_stack?.length) {
            techEl.innerHTML = '';
            items.tech_stack.forEach((t, i) => {
                const badge = document.createElement('span');
                badge.className = 'tech-badge';
                badge.textContent = t;
                badge.style.animationDelay = `${i * 0.1}s`;
                techEl.appendChild(badge);
            });
        }

        // Setup pages
        this.pages = Array.from(this.root.querySelectorAll('.project-detail-card'));
        this.showPage(0);
    }

    showPage(index) {
        if (!this.pages || index < 0 || index >= this.pages.length) return;

        this.pages.forEach((p, i) => p.classList.toggle('active', i === index));
        this.activePage = index;
    }
}

customElements.define('project-details', ProjectDetails);
