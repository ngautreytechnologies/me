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
    tags: [
        { name: "AI", summary: "Artificial intelligence applied to telemetry." },
        { name: "AWS", summary: "Cloud services backbone." }
    ],
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
    repo: {
        name: "portfolio-serverless-event-architecture",
        description: "A full example of a serverless event-driven architecture for telemetry.",
        stars: 120,
        forks: 15,
        issues: 3,
        language: "Python",
        license: "MIT",
        updated: "2025-09-18"
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
    }

    setupEventListeners() {
        if (this.debug) console.log('[ProjectDetails] Setting up event listeners');

        this.root.addEventListener('click', (e) => {
            const tabButton = e.target.closest('[data-tab]');
            if (tabButton) this.switchTab(tabButton.dataset.tab);
        });

        document.addEventListener('project-selected', (e) => {
            if (this.debug) console.log('[ProjectDetails] project-selected event received', e.detail);
            this.renderData(e.detail);
        });
    }

    switchTab(tabId) {
        if (this.activeTab === tabId) return;

        const projectContent = this.root.querySelector('.project-content');
        if (!projectContent) return;

        projectContent.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        projectContent.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.dataset.pane === tabId);
        });

        this.activeTab = tabId;
    }

    renderData(items) {

        super.renderData(items);
        // Key Features
        const keyFeaturesSlot = root.querySelector('slot[name="keyFeatures"]');
        if (keyFeaturesSlot) {
            keyFeaturesSlot.innerHTML = '';
            items.keyFeatures.forEach(f => {
                const li = document.createElement('li');
                li.textContent = f;
                keyFeaturesSlot.appendChild(li);
            });
        }

        // Tech badges
        const techEl = root.querySelector('[data-tech-stack]');
        if (techEl) {
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
        const tagEl = root.querySelector('[data-tags]');
        if (tagEl) {
            tagEl.innerHTML = '';
            items.tags.forEach((t, i) => {
                const badge = document.createElement('span');
                badge.className = 'tech-badge';
                badge.textContent = t.name;
                badge.title = t.summary;
                badge.style.animationDelay = `${i * 0.1}s`;
                tagEl.appendChild(badge);
            });
        }

        // Metrics
        const metricsEl = root.querySelector('[data-metrics]');
        if (metricsEl) {
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

        // GitHub / Repo Info
        if (items.repo) {
            const repo = items.repo;
            if (root.querySelector('[data-field="repo_name"]')) root.querySelector('[data-field="repo_name"]').textContent = repo.name;
            if (root.querySelector('[data-field="repo_description"]')) root.querySelector('[data-field="repo_description"]').textContent = repo.description;
            if (root.querySelector('[data-field="repo_stars"]')) root.querySelector('[data-field="repo_stars"]').textContent = repo.stars;
            if (root.querySelector('[data-field="repo_forks"]')) root.querySelector('[data-field="repo_forks"]').textContent = repo.forks;
            if (root.querySelector('[data-field="repo_issues"]')) root.querySelector('[data-field="repo_issues"]').textContent = repo.issues;
            if (root.querySelector('[data-field="repo_language"]')) root.querySelector('[data-field="repo_language"]').textContent = repo.language;
            if (root.querySelector('[data-field="repo_license"]')) root.querySelector('[data-field="repo_license"]').textContent = repo.license;
            if (root.querySelector('[data-field="repo_updated"]')) root.querySelector('[data-field="repo_updated"]').textContent = repo.updated;
        }

        // Code Viewer
        this.setupCodeViewer(items.codeSnippets);

        // Default tab
        this.switchTab('overview');
    }

    setupCodeViewer(snippets) {
        const root = this.root;
        const codeContainer = root.querySelector('[data-code-snippets]');
        if (!codeContainer) return;

        codeContainer.innerHTML = '';

        const tabsNav = document.createElement('div');
        tabsNav.className = 'code-tabs-nav';
        const codeContent = document.createElement('div');
        codeContent.className = 'code-tabs-content';

        Object.entries(snippets).forEach(([lang, code], i) => {
            // tab button
            const btn = document.createElement('button');
            btn.textContent = lang.toUpperCase();
            btn.className = i === 0 ? 'active' : '';
            btn.dataset.tab = lang;
            btn.addEventListener('click', () => {
                // switch tabs
                tabsNav.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                codeContent.querySelectorAll('.code-block').forEach(b => b.classList.remove('active'));
                codeContent.querySelector(`.code-block[data-lang="${lang}"]`)?.classList.add('active');
            });
            tabsNav.appendChild(btn);

            // code block
            const pre = document.createElement('pre');
            pre.className = `code-block ${i === 0 ? 'active' : ''}`;
            pre.dataset.lang = lang;
            pre.textContent = code;
            codeContent.appendChild(pre);
        });

        codeContainer.appendChild(tabsNav);
        codeContainer.appendChild(codeContent);
    }
}

customElements.define('project-details', ProjectDetails);
