import { subscribeSelectedProject } from '../../../../reactivity';

import { GitHubService } from '../../instruments/services/github';

import css from '../styles/portfolio-details.css';
import templateHtml from './portfolio-details.html';

class PortfolioDetails extends BaseShadowComponent {
    constructor(debug = true) {
        super(templateHtml, css);
        this.debug = debug;
        this.client = new GitHubService();
        this._carousel = {
            container: null,
            pages: [],
            current: 0,
            touchStartX: 0,
            touchEndX: 0,
            isTouching: false,
        };
        this.currentPage = 1;
        if (this.debug) console.log('[PortfolioDetails] Constructor initialized');
    }

    connectedCallback() {
        super.connectedCallback();
        this.togglePlaceholder(true);
        this._initCarouselStructure();

        subscribeSelectedProject(async project => {
            console.group('[PortfolioDetails] Selected project update');
            console.log('Received project:', project);

            if (!project || !project.username || !project.repo) {
                console.warn('No valid project selected, clearing display.');
                this.clearPortfolioDetails();
                this.togglePlaceholder(true);
                console.groupEnd();
                return;
            }

            this.clearPortfolioDetails();
            this.togglePlaceholder(true);
            this._scrollToPage(0, false);

            try {
                const { username, repo, file = 'story.json' } = project;
                if (this.debug) console.log(`Fetching ${file} from "${username}/${repo}"`);

                const raw = await this.client.fetchCodeFile(repo, file, username);
                if (!raw || typeof raw !== 'string') throw new Error('Invalid file content returned');

                let story;
                try {
                    story = JSON.parse(raw);
                    if (this.debug) console.log('Parsed story.json successfully');
                } catch (err) {
                    console.error('Failed to parse story.json, falling back.', err);
                    story = { title: repo, overview: `Repository by ${username}` };
                }

                const data = this.mapStoryToData(story);
                if (this.debug) console.log('Mapped data for rendering:', data);

                this.renderTemplateData(data);
                this._scrollToPage(0, false);
                this.togglePlaceholder(false);
            } catch (err) {
                console.error('Failed to fetch story.json:', err);
                this.renderTemplateData({
                    title: project.repo,
                    overview: 'Failed to load project details',
                });
                this.togglePlaceholder(false);
            }

            console.groupEnd();
        });
    }

    _initCarouselStructure() {
        const root = this.root;
        if (!root) return;

        // Clone template content
        const template = root.querySelector('template');
        if (!template) return;

        const track = template.content.querySelector('.carousel-track');
        if (!track) return;

        const pageNodes = Array.from(track.querySelectorAll('.project-details[data-page]'));
        if (!pageNodes.length) {
            console.warn('No pages found in template.');
            return;
        }

        let carousel = root.querySelector('.project-details-carousel');
        if (!carousel) {
            carousel = document.createElement('div');
            carousel.className = 'project-details-carousel';
            Object.assign(carousel.style, {
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
            });
            root.insertBefore(carousel, root.firstChild);
        }

        // Append pages
        pageNodes.forEach(pg => {
            pg.style.scrollSnapAlign = 'start';
            pg.style.minWidth = '100%';
            pg.style.boxSizing = 'border-box';
            carousel.appendChild(pg);
        });

        this._carousel.container = carousel;
        this._updatePagesList();

        // Wire buttons
        const prevBtn = root.querySelector('[data-page-prev]');
        const nextBtn = root.querySelector('[data-page-next]');
        if (prevBtn) prevBtn.addEventListener('click', () => this._scrollToPage(this._carousel.current - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => this._scrollToPage(this._carousel.current + 1));

        // Wheel support
        carousel.addEventListener('wheel', e => {
            if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
                e.preventDefault();
                carousel.scrollLeft += e.deltaY;
            }
        }, { passive: false });

        // Debounced scroll
        let scrollTimeout = null;
        carousel.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const idx = this._getNearestPageIndex();
                this._setCurrentIndex(idx);
            }, 80);
        });

        // Touch swipe
        carousel.addEventListener('touchstart', e => {
            this._carousel.isTouching = true;
            this._carousel.touchStartX = e.touches[0]?.clientX || 0;
        }, { passive: true });
        carousel.addEventListener('touchmove', e => {
            this._carousel.touchEndX = e.touches[0]?.clientX || 0;
        }, { passive: true });
        carousel.addEventListener('touchend', () => {
            this._carousel.isTouching = false;
            const dx = this._carousel.touchStartX - this._carousel.touchEndX;
            const threshold = 40;
            if (dx > threshold) this._scrollToPage(this._carousel.current + 1);
            else if (dx < -threshold) this._scrollToPage(this._carousel.current - 1);
            else this._scrollToPage(this._getNearestPageIndex());
            this._carousel.touchStartX = 0;
            this._carousel.touchEndX = 0;
        }, { passive: true });

        // Keyboard
        root.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') this._scrollToPage(this._carousel.current + 1);
            else if (e.key === 'ArrowLeft') this._scrollToPage(this._carousel.current - 1);
        });

        // Init first page
        this._scrollToPage(0, false);
    }

    _updatePagesList() {
        const carousel = this._carousel.container;
        if (!carousel) {
            this._carousel.pages = Array.from(this.root.querySelectorAll('.project-details[data-page]'));
        } else {
            this._carousel.pages = Array.from(carousel.querySelectorAll('.project-details[data-page]'));
        }
        if (this._carousel.current >= this._carousel.pages.length) this._carousel.current = 0;

        this._updateNavButtons();
    }

    _scrollToPage(index = 0, animate = true) {
        if (this.debug) console.log('[_scrollToPage] Called with:', { index, animate });

        this._updatePagesList();

        const carousel = this._carousel.container;
        const pages = this._carousel.pages;
        if (!carousel || !pages.length) {
            console.warn('[_scrollToPage] No carousel or pages found.', carousel, pages);
            return;
        }

        index = Math.max(0, Math.min(pages.length - 1, index));
        const target = pages[index];
        if (!target) return;

        if (animate) carousel.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
        else carousel.scrollLeft = target.offsetLeft;

        this._carousel.current = index;
        pages.forEach((p, i) => p.classList.toggle('active', i === index));

        this._updateNavButtons();
    }

    _getNearestPageIndex() {
        const carousel = this._carousel.container;
        if (!carousel || !this._carousel.pages.length) return 0;
        const width = carousel.clientWidth || 1;
        return Math.max(0, Math.min(this._carousel.pages.length - 1, Math.round(carousel.scrollLeft / width)));
    }

    _setCurrentIndex(idx) {
        idx = Math.max(0, Math.min(this._carousel.pages.length - 1, idx));
        this._carousel.current = idx;
        this._carousel.pages.forEach((p, i) => p.classList.toggle('active', i === idx));
        this._updateNavButtons();
    }

    _updateNavButtons() {
        const root = this.root;
        const prevBtn = root.querySelector('[data-page-prev]');
        const nextBtn = root.querySelector('[data-page-next]');
        const total = this._carousel.pages.length;
        const idx = this._carousel.current;
        if (prevBtn) prevBtn.disabled = idx <= 0;
        if (nextBtn) nextBtn.disabled = idx >= total - 1;
    }

    clearPortfolioDetails() {
        const root = this.root;
        [
            '[data-field="keyFeatures"]',
            '[data-field="techStack"]',
            '[data-field="tags"]',
            '[data-field="metrics"]',
            '[data-field="codeSnippets"]',
            '[data-field="gallery"]',
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

        // Key Features
        const keyFeaturesEl = root.querySelector('[data-field="keyFeatures"]');
        if (keyFeaturesEl && Array.isArray(items.keyFeatures)) {
            const ul = document.createElement('ul');
            items.keyFeatures.forEach(f => { const li = document.createElement('li'); li.textContent = f; ul.appendChild(li); });
            keyFeaturesEl.appendChild(ul);
        }

        // Tech Stack
        const techEl = root.querySelector('[data-field="techStack"]');
        if (techEl && Array.isArray(items.techStack)) {
            items.techStack.forEach((t, i) => {
                const badge = document.createElement('span');
                badge.className = 'tech-badge';
                badge.textContent = t;
                badge.style.animationDelay = `${i * 0.06}s`;
                techEl.appendChild(badge);
            });
        }

        // Tags
        const tagEl = root.querySelector('[data-field="tags"]');
        if (tagEl && Array.isArray(items.tags)) {
            items.tags.forEach((t, i) => {
                const badge = document.createElement('span');
                badge.className = 'tag';
                badge.textContent = t;
                badge.style.animationDelay = `${i * 0.06}s`;
                tagEl.appendChild(badge);
            });
        }

        // Metrics
        const metricsEl = root.querySelector('[data-field="metrics"]');
        if (metricsEl && items.impact?.metrics) {
            Object.entries(items.impact.metrics).forEach(([k, v]) => {
                const card = document.createElement('div');
                card.className = 'metric-card';
                card.innerHTML = `<div class="metric-value">${v}</div><div class="metric-title">${k}</div>`;
                metricsEl.appendChild(card);
            });
        }

        // Gallery
        const galleryEl = root.querySelector('[data-field="gallery"]');
        if (galleryEl && Array.isArray(items.media)) {
            items.media.forEach(m => {
                const wrapper = document.createElement('div');
                wrapper.style.marginBottom = '0.5rem';
                if (m.type?.startsWith('image') || m.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    const img = document.createElement('img');
                    img.src = m.url;
                    img.alt = m.caption || '';
                    img.style.maxWidth = '100%';
                    img.style.borderRadius = '8px';
                    wrapper.appendChild(img);
                    if (m.caption) {
                        const cap = document.createElement('div');
                        cap.style.fontSize = '0.85rem';
                        cap.style.color = 'var(--text-secondary)';
                        cap.textContent = m.caption;
                        wrapper.appendChild(cap);
                    }
                } else if (m.type === 'diagram' || m.url) {
                    const a = document.createElement('a');
                    a.href = m.url;
                    a.textContent = m.caption || m.url;
                    a.target = '_blank';
                    wrapper.appendChild(a);
                }
                galleryEl.appendChild(wrapper);
            });
        }

        // Code Snippets
        if (items.codeSnippets && typeof items.codeSnippets === 'object') {
            this.setupCodeViewer(items.codeSnippets);
        }

        this._updatePagesList();
        this._scrollToPage(0);
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
        const placeholder = this.root.querySelector('[data-placeholder]') || this.root.querySelector('.project-placeholder');
        const pages = Array.from(this._carousel.pages || []);
        if (placeholder) placeholder.style.display = show ? 'flex' : 'none';
        pages.forEach(p => p.style.display = show ? 'none' : '');
        if (this._carousel.container) this._carousel.container.style.display = show ? 'none' : 'flex';
    }

    mapStoryToData(story) {
        if (!story) return {};
        const result = {
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
                        Object.entries(story.impact.metrics).map(([k, v]) => [k.replace(/_/g, ' '), v])
                    )
                    : {},
                business_outcome: story.impact?.business_outcome || '',
            },
            codeSnippets: story.codeSnippets || {},
            media: story.media || story.media_items || story.gallery || [],
        };
        console.log('Mapped story', result);

        return result;
    }
}

customElements.define('project-details', PortfolioDetails);
