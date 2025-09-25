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
        this.togglePlaceholder(true);

        subscribeSelectedProject(async project => {
            console.group('[ProjectDetails] Selected project update');
            console.log('Received project:', project);

            // ✅ EARLY EXIT: Invalid project payload
            if (!project || !project.username || !project.repo) {
                console.warn('No valid project selected, clearing display.');
                this.clearProjectDetails();
                this.togglePlaceholder(true);
                console.groupEnd();
                return;
            }

            // ✅ Reset UI before loading new data
            this.clearProjectDetails();
            this.togglePlaceholder(true);

            try {
                const { username, repo, file = 'story.json' } = project;
                console.log(`Fetching ${file} from "${username}/${repo}"`);

                // ✅ Defensive: ensure fetch result is a string
                const raw = await this.client.fetchCodeFile(repo, file, username);
                if (!raw || typeof raw !== 'string') {
                    throw new Error('Invalid file content returned');
                }
                console.log('Raw story.json content (preview):', raw.slice(0, 200), '...');

                let story;
                try {
                    story = JSON.parse(raw);
                    console.log('Parsed story.json successfully');
                } catch (err) {
                    console.warn('Failed to parse story.json, falling back.', err);
                    story = { title: repo, overview: `Repository by ${username}` };
                }

                const data = this.mapStoryToData(story);
                console.log('Mapped data for rendering:', data);

                this.renderTemplateData(data);
            } catch (err) {
                console.error('Failed to fetch story.json:', err);
                this.renderTemplateData({
                    title: project.repo,
                    overview: 'Failed to load project details',
                });
            }

            console.groupEnd();
        });
    }

    /**
     * ✅ Clears all previously rendered project content
     */
    clearProjectDetails() {
        const root = this.root;
        [
            '[data-field="keyFeatures"]',
            '[data-field="techStack"]',
            '[data-field="tags"]',
            '[data-field="metrics"]',
            '[data-field="codeSnippets"]',
        ].forEach(sel => {
            const el = root.querySelector(sel);
            if (el) el.innerHTML = '';
        });
    }

    renderTemplateData(items) {
        if (!items) return;
        super.renderTemplateData(items);

        this.togglePlaceholder(false);

        const root = this.root;

        // ✅ Key Features
        const keyFeaturesEl = root.querySelector('[data-field="keyFeatures"]');
        if (keyFeaturesEl && Array.isArray(items.keyFeatures)) {
            const ul = document.createElement('ul');
            items.keyFeatures.forEach(f => {
                const li = document.createElement('li');
                li.textContent = f;
                ul.appendChild(li);
            });
            keyFeaturesEl.appendChild(ul);
        }

        // ✅ Tech Stack
        const techEl = root.querySelector('[data-field="techStack"]');
        if (techEl && Array.isArray(items.techStack)) {
            items.techStack.forEach((t, i) => {
                const badge = document.createElement('span');
                badge.className = 'tech-badge';
                badge.textContent = t;
                badge.style.animationDelay = `${i * 0.1}s`;
                techEl.appendChild(badge);
            });
        }

        // ✅ Tags
        const tagEl = root.querySelector('[data-field="tags"]');
        if (tagEl && Array.isArray(items.tags)) {
            items.tags.forEach((t, i) => {
                const badge = document.createElement('span');
                badge.className = 'tag';
                badge.textContent = t;
                badge.style.animationDelay = `${i * 0.1}s`;
                tagEl.appendChild(badge);
            });
        }

        // ✅ Metrics
        const metricsEl = root.querySelector('[data-field="metrics"]');
        if (metricsEl && items.impact?.metrics) {
            Object.entries(items.impact.metrics).forEach(([k, v]) => {
                const card = document.createElement('div');
                card.className = 'metric-card';
                card.innerHTML = `<div class="metric-value">${v}</div><div class="metric-title">${k}</div>`;
                metricsEl.appendChild(card);
            });
        }

        // ✅ Code Viewer
        if (items.codeSnippets) {
            this.setupCodeViewer(items.codeSnippets);
        }
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
            timeline: story.timeline ? `${story.timeline.start || ''} - ${story.timeline.end || ''}` : '',
            impact: {
                metrics: story.impact?.metrics
                    ? Object.fromEntries(
                        Object.entries(story.impact.metrics).map(([k, v]) => [
                            k.replace(/_/g, ' '),
                            v,
                        ])
                    )
                    : {},
                business_outcome: story.impact?.business_outcome || '',
            },
            codeSnippets: story.codeSnippets || {},
        };
    }
}

customElements.define('project-details', ProjectDetails);
