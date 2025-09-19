import BaseShadowComponent from '../../base-shadow-component.js';
import css from './project-details.css';
import templateHtml from './project-details.html';

const data = {
    title: "Contoso Energy - Serverless Event-Driven Architecture",
    summary: "Enterprise-grade event-driven platform for energy telemetry",
    tech_stack: ["C#", "Python", "FastAPI", "AWS Lambda", "Amazon Kinesis"],
    tags: [
        { name: "AI", summary: "Artificial intelligence applied to telemetry." },
        { name: "AWS", summary: "Cloud services backbone." }
    ],
    impact: {
        metrics: {
            processing_time_reduction: "40% faster",
            cost_savings: "30% lower cost"
        }
    },
    repo_name: "portfolio-serverless-event-architecture"
};

class ProjectDetails extends BaseShadowComponent {
    constructor(debug = true) {
        super(templateHtml, css);
        this.activeTab = 'overview';
        this.debug = debug;
        if (this.debug) console.log('[ProjectDetails] Constructor initialized');
    }

    connectedCallback() {
        if (this.debug) console.group('[ProjectDetails] connectedCallback start');
        this.data.set(data);
        super.connectedCallback();
        this.setupEventListeners();
        this.setupTabsForNewContent();
        this.setupTechBadges();
        this.setupTagBadges();
        this.setupMetricsCards();
        if (this.debug) console.groupEnd();
    }

    setupEventListeners() {
        if (this.debug) console.log('[ProjectDetails] Setting up event listeners');

        this.root.addEventListener('click', (e) => {
            const tabButton = e.target.closest('[data-tab]');
            if (tabButton) {
                if (this.debug) console.log(`[ProjectDetails] Tab clicked: ${tabButton.dataset.tab}`);
                this.switchTab(tabButton.dataset.tab);
            }
        });

        document.addEventListener('project-selected', (e) => {
            if (this.debug) console.log('[ProjectDetails] project-selected event received', e.detail);
            this.renderData(e.detail);
        });
    }

    switchTab(tabId) {
        if (this.activeTab === tabId) {
            if (this.debug) console.log(`[ProjectDetails] Tab ${tabId} is already active`);
            return;
        }

        const projectContent = this.root.querySelector('.project-content');
        if (!projectContent) {
            if (this.debug) console.warn('[ProjectDetails] No project content for tab switching');
            return;
        }

        projectContent.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        projectContent.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.dataset.pane === tabId);
        });

        if (this.debug) console.log(`[ProjectDetails] Tab switched from ${this.activeTab} → ${tabId}`);
        this.activeTab = tabId;
    }

    renderData(items) {
        if (this.debug) console.groupCollapsed('[ProjectDetails] renderData override');
        if (this.debug) console.log('Items received:', items);

        // Base render
        super.renderData(items);
    }

    setupTabsForNewContent() {
        this.activeTab = 'overview';
        const projectContent = this.root.querySelector('.project-content');
        if (!projectContent) return;

        if (this.debug) console.groupCollapsed('[ProjectDetails] Tabs setup');

        projectContent.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === 'overview');
        });

        projectContent.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.dataset.pane === 'overview');
        });

        if (this.debug) console.log('Tabs reset to overview');
        if (this.debug) console.groupEnd();
    }

    setupTechBadges() {
        const projectContent = this.root.querySelector('.project-content');
        if (!projectContent) return;

        const techStackEl = projectContent.querySelector('[data-tech-stack]');
        if (!techStackEl) return;

        const techStack = techStackEl.textContent?.split(',') || [];
        techStackEl.innerHTML = '';

        if (this.debug) console.groupCollapsed('[ProjectDetails] Tech badges setup');

        techStack.forEach((tech, i) => {
            const badge = document.createElement('span');
            badge.className = 'tech-badge';
            badge.textContent = tech.trim();
            badge.style.animationDelay = `${i * 0.1}s`;
            badge.style.background = `linear-gradient(135deg, hsl(${(i * 40) % 360},70%,60%), hsl(${(i * 40 + 30) % 360},70%,70%))`;
            techStackEl.appendChild(badge);

            if (this.debug) console.log(`Badge added: ${tech.trim()}`);
        });

        if (this.debug) console.groupEnd();
    }

    setupTagBadges() {
        const projectContent = this.root.querySelector('.project-content');
        if (!projectContent) return;

        const tagsEl = projectContent.querySelector('[data-tags]');
        if (!tagsEl) return;

        let tags = [];
        try {
            tags = JSON.parse(tagsEl.textContent || '[]');
        } catch (err) {
            if (this.debug) console.warn('[ProjectDetails] Failed to parse tags JSON', err);
        }

        tagsEl.innerHTML = '';
        if (this.debug) console.groupCollapsed('[ProjectDetails] Tag badges setup');

        tags.forEach((tag, i) => {
            const badge = document.createElement('span');
            badge.className = 'tech-badge';
            badge.textContent = tag.name;
            badge.title = tag.summary;
            badge.style.animationDelay = `${i * 0.15}s`;
            badge.style.background = `linear-gradient(135deg, hsl(${(i * 60) % 360},60%,50%), hsl(${(i * 60 + 40) % 360},60%,60%))`;
            tagsEl.appendChild(badge);

            if (this.debug) console.log(`Tag badge added: ${tag.name}`);
        });

        if (this.debug) console.groupEnd();
    }

    setupMetricsCards() {
        const projectContent = this.root.querySelector('.project-content');
        if (!projectContent) return;

        const metricsEl = projectContent.querySelector('[data-metrics]');
        if (!metricsEl) return;

        let metrics = {};
        try {
            metrics = JSON.parse(metricsEl.textContent || '{}');
        } catch (err) {
            if (this.debug) console.warn('[ProjectDetails] Failed to parse metrics JSON', err);
        }

        metricsEl.innerHTML = '';

        if (this.debug) console.groupCollapsed('[ProjectDetails] Metrics cards setup');

        Object.entries(metrics).forEach(([key, value]) => {
            const card = document.createElement('div');
            card.className = 'metric-card';
            card.innerHTML = `
                <div class="metric-value">${value}</div>
                <div class="metric-title">${key}</div>
            `;
            metricsEl.appendChild(card);

            if (this.debug) console.log(`Metric card added: ${key} = ${value}`);
        });

        if (this.debug) console.groupEnd();
    }
}

customElements.define('project-details', ProjectDetails);
