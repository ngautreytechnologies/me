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
    techStack: ["C#", "Python", "FastAPI", "AWS Lambda", "Amazon Kinesis"],
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

class ProjectDetails extends BaseShadowComponent {
    constructor(debug = true) {
        super(templateHtml, css);
        this.activeTab = 'overview';
        this.debug = debug;
        if (this.debug) console.log('[ProjectDetails] Constructor initialized');
    }

    connectedCallback() {
        this.data.set(data);
        super.connectedCallback();
        this.setupEventListeners();
        // Show first project immediately
        this.renderData(data);
        this.togglePlaceholder(false);
    }

    setupEventListeners() {
        document.addEventListener('project-selected', (e) => {
            if (this.debug) console.log('[ProjectDetails] project-selected event', e.detail);
            this.renderData(e.detail);
        });
    }

    renderData(items) {
        if (!items) return;
        super.renderData(items);

        const root = this.root;

        // 🔥 Hide placeholder once real project data comes in
        this.togglePlaceholder(false);

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
        const techEl = root.querySelector('[data-field="techStack"]');
        if (techEl && items.techStack?.length) {
            techEl.innerHTML = '';
            items.techStack.forEach((t, i) => {
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

        // Metrics
        const metricsEl = root.querySelector('[data-field="metrics"]');
        if (metricsEl && items.impact?.metrics) {
            metricsEl.innerHTML = '';
            Object.entries(items.impact.metrics).forEach(([k, v]) => {
                const card = document.createElement('div');
                card.className = 'metric-card';
                card.innerHTML = `<div class="metric-value">${v}</div><div class="metric-title">${k}</div>`;
                metricsEl.appendChild(card);
            });
        }

        // Code Viewer
        if (items.codeSnippets) this.setupCodeViewer(items.codeSnippets);
    }

    setupCodeViewer(snippets) {
        const container = this.root.querySelector('[data-field="codeSnippets"]');
        if (!container) return;

        container.innerHTML = '';
        const tabsNav = document.createElement('div');
        tabsNav.className = 'code-tabs-nav';
        const codeContent = document.createElement('div');
        codeContent.className = 'code-tabs-content';

        Object.entries(snippets).forEach(([lang, code], i) => {
            const btn = document.createElement('button');
            btn.textContent = lang.toUpperCase();
            btn.className = i === 0 ? 'active' : '';
            btn.dataset.tab = lang;
            btn.addEventListener('click', () => {
                tabsNav.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                codeContent.querySelectorAll('.code-block').forEach(b => b.classList.remove('active'));
                codeContent.querySelector(`.code-block[data-lang="${lang}"]`)?.classList.add('active');
            });
            tabsNav.appendChild(btn);

            const pre = document.createElement('pre');
            pre.className = i === 0 ? 'code-block active' : 'code-block';
            pre.dataset.lang = lang;
            pre.textContent = code;
            codeContent.appendChild(pre);
        });

        container.appendChild(tabsNav);
        container.appendChild(codeContent);
    }

    togglePlaceholder(show) {
        const placeholder = this.root.querySelector('[data-placeholder]');
        const detailsContent = this.root.querySelector('.project-details-body, [data-code-snippets]');
        if (placeholder) placeholder.style.display = show ? 'flex' : 'none';
        if (detailsContent) detailsContent.style.display = show ? 'none' : 'grid';
    }
}

customElements.define('project-details', ProjectDetails);
