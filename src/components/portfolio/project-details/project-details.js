import { subscribeSelectedProject } from '../../../modules/reactivity/signal-store';
import BaseShadowComponent from '../../base-shadow-component';
import { GitHubClient } from '../services/github';

import css from './project-details.css';
import templateHtml from './project-details.html';

class ProjectDetails extends BaseShadowComponent {
    constructor(debug = true) {
        super(templateHtml, css);
        this.debug = debug;
        this.client = new GitHubClient();
        if (this.debug) console.log('[ProjectDetails] Constructor initialized');
    }

    connectedCallback() {
        super.connectedCallback();
        this.togglePlaceholder(true); // show placeholder initially

        subscribeSelectedProject(async project => {
            if (!project) {
                this.renderTemplateData([]);
                return;
            }

            this.togglePlaceholder(true);

            try {
                // Destructure project object
                const { username, repo, file = 'story.json' } = project;

                // Fetch story.json from GitHub
                const raw = await this.client.fetchCodeFile(repo, file, username);

                // Parse JSON safely
                let story;
                try {
                    story = JSON.parse(raw);
                } catch (err) {
                    console.warn('Failed to parse story.json, using minimal fallback', err);
                    story = {
                        title: repo,
                        overview: `Repository by ${username}`
                    };
                }

                // Map story.json to ProjectDetails data
                const data = this.mapStoryToData(story);

                // Render mapped data
                this.renderTemplateData(data);
            } catch (err) {
                console.error('Failed to fetch story.json:', err);
                this.renderTemplateData({ title: project.repo, overview: 'Failed to load project details' });
            }
        });
    }

    renderTemplateData(items) {
        if (!items) return;
        super.renderTemplateData(items);

        const root = this.root;
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

    mapStoryToData(story) {
        if (!story) return {};

        return {
            title: story.title || story.summary || 'Untitled Project',
            overview: story.summary || story.overview?.architecture?.key_components?.join(', ') || '',
            keyFeatures: story.overview?.architecture?.key_components || [],
            pros: 'See impact metrics',
            cons: story.challenges?.join('; ') || '',
            techStack: story.tech_stack || [],
            tags: story.tags?.map(t => t.name) || [],
            problem: story.problem || '',
            solution: story.solution || '',
            timeline: story.timeline
                ? `${story.timeline.start || ''} - ${story.timeline.end || ''}`
                : '',
            impact: {
                metrics: story.impact?.metrics
                    ? Object.fromEntries(
                        Object.entries(story.impact.metrics).map(([k, v]) => [
                            k.replace(/_/g, ' '),
                            v
                        ])
                    )
                    : {},
                business_outcome: story.impact?.business_outcome || ''
            },
            codeSnippets: story.codeSnippets || {}
        };
    }
}

customElements.define('project-details', ProjectDetails);
