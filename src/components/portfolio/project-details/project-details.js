import BaseShadowComponent from '../../base-shadow-component.js';
import css from './project-details.css';
import templateHtml from './project-details.html';

const defaultData = {
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
    solution: "Serverless architecture using AWS Lambda and Kinesis for event-driven processing.",
    timeline: "Q1 2025 - Q2 2025",
    impact: {
        metrics: {
            "Processing Time Reduction": "40% faster",
            "Cost Savings": "30% lower cost"
        },
        business_outcome: "Improved system reliability and reduced operational costs."
    },
    codeSnippets: {
        html: `<div id="telemetry-dashboard"></div>`,
        js: `const lambdaHandler = async (event) => { console.log(event); };`,
        python: `def process_event(event): print("Processing", event)`
    }
};

export default class ProjectDetails extends BaseShadowComponent {
    constructor(debug = true) {
        super(templateHtml, css);
        this.activePageIndex = 0;
        this.pages = []; // Will store all project-detail-card elements
        this.debug = debug;
        if (this.debug) console.log('[ProjectDetails] Constructor initialized');
    }

    connectedCallback() {
        this.data.set(defaultData);
        super.connectedCallback();
        this.setupEventListeners();
        this.collectPages();
        this.showPage(0); // Show first page by default
    }

    setupEventListeners() {
        // Listen for code tab clicks
        this.root.addEventListener('click', (e) => {
            const tabButton = e.target.closest('[data-tab]');
            if (tabButton) this.switchCodeTab(tabButton.dataset.tab);
        });

        // Listen for project selection events
        document.addEventListener('project-selected', (e) => {
            if (this.debug) console.log('[ProjectDetails] project-selected', e.detail);
            this.renderData(e.detail);
        });

        // Page navigation
        const nextBtn = this.root.querySelector('[data-page-next]');
        const prevBtn = this.root.querySelector('[data-page-prev]');
        if (nextBtn) nextBtn.addEventListener('click', () => this.showPage(this.activePageIndex + 1));
        if (prevBtn) prevBtn.addEventListener('click', () => this.showPage(this.activePageIndex - 1));
    }

    collectPages() {
        this.pages = Array.from(this.root.querySelectorAll('.project-detail-card'));
    }

    showPage(index) {
        if (!this.pages || this.pages.length === 0) return;
        if (index < 0) index = 0;
        if (index >= this.pages.length) index = this.pages.length - 1;
        this.pages.forEach((el, i) => el.classList.toggle('active', i === index));
        this.activePageIndex = index;
    }

    renderData(items) {
        const root = this.root;
        if (!items) return;

        super.renderData(items); // BaseShadowComponent handles data-field injection

        // Key Features
        const keyFeaturesEl = root.querySelector('[data-field="keyFeatures"]');
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

        // Tech Stack
        const techEl = root.querySelector('[data-field="tech_stack"]');
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

        // Tags
        const tagEl = root.querySelector('[data-field="tags"]');
        if (tagEl && items.tags?.length) {
            tagEl.innerHTML = '';
            items.tags.forEach((t, i) => {
                const badge = document.createElement('span');
                badge.className = 'tag';
                badge.textContent = t;
                badge.style.animationDelay = `${i * 0.1}s`;
                tagEl.appendChild(badge);
            });
        }

        // Impact Metrics
        const metricsEl = root.querySelector('[data-field="metrics"]');
        if (metricsEl && items.impact?.metrics) {
            metricsEl.innerHTML = '';
            Object.entries(items.impact.metrics).forEach(([k, v]) => {
                const card = document.createElement('div');
                card.className = 'metric-card';
                card.innerHTML = `
                    <div class="metric-value">${v}</div>
                    <div class="metric-title">${k}</div>
                `;
                metricsEl.appendChild(card);
            });
        }

        // Code Viewer
        if (items.codeSnippets) this.setupCodeViewer(items.codeSnippets);

        // Update pages reference & show first page
        this.collectPages();
        this.showPage(0);
    }

    setupCodeViewer(snippets) {
        const codeContainer = this.root.querySelector('[data-field="codeSnippets"]');
        if (!codeContainer) return;

        codeContainer.innerHTML = '';
        const tabsNav = document.createElement('div');
        tabsNav.className = 'code-tabs-nav';
        const codeContent = document.createElement('div');
        codeContent.className = 'code-tabs-content';

        Object.entries(snippets).forEach(([lang, code], i) => {
            const btn = document.createElement('button');
            btn.textContent = lang.toUpperCase();
            btn.className = i === 0 ? 'active' : '';
            btn.dataset.tab = lang;
            btn.addEventListener('click', () => this.switchCodeTab(lang));
            tabsNav.appendChild(btn);

            const pre = document.createElement('pre');
            pre.className = `code-block ${i === 0 ? 'active' : ''}`;
            pre.dataset.lang = lang;
            pre.textContent = code;
            codeContent.appendChild(pre);
        });

        codeContainer.appendChild(tabsNav);
        codeContainer.appendChild(codeContent);
    }

    switchCodeTab(lang) {
        const codeContainer = this.root.querySelector('[data-field="codeSnippets"]');
        if (!codeContainer) return;

        codeContainer.querySelectorAll('.code-tabs-nav button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === lang);
        });
        codeContainer.querySelectorAll('.code-block').forEach(block => {
            block.classList.toggle('active', block.dataset.lang === lang);
        });
    }
}

customElements.define('project-details', ProjectDetails);
