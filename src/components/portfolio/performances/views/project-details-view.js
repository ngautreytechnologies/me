export class ProjectDetailsView {
    #root;
    #carousel = {
        container: null,
        pages: [],
        current: 0
    };

    /**
     * @param {ShadowRoot|HTMLElement} root - root of the details component
     */
    constructor(root) {
        this.#root = root instanceof ShadowRoot ? root : root?.shadowRoot || root;
        if (!this.#root) throw new Error('[ProjectDetailsView] Root element required');
    }

    /* -----------------------------
       Lifecycle
    ----------------------------- */

    initCarousel() {
        const template = this.#root.querySelector('template');
        if (!template) return;

        const track = template.content.querySelector('.carousel-track');
        if (!track) return;

        const pageNodes = Array.from(track.querySelectorAll('.project-details[data-page]'));
        if (!pageNodes.length) return;

        let carousel = this.#root.querySelector('.project-details-carousel');
        if (!carousel) {
            carousel = document.createElement('div');
            carousel.className = 'project-details-carousel';
            Object.assign(carousel.style, {
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch'
            });
            this.#root.insertBefore(carousel, this.#root.firstChild);
        }

        pageNodes.forEach(pg => {
            pg.style.scrollSnapAlign = 'start';
            pg.style.minWidth = '100%';
            carousel.appendChild(pg);
        });

        this.#carousel.container = carousel;
        this.#updatePagesList();

        this.#bindCarouselEvents();
        this.scrollToPage(0, false);
    }

    #bindCarouselEvents() {
        const root = this.#root;
        const prevBtn = root.querySelector('[data-page-prev]');
        const nextBtn = root.querySelector('[data-page-next]');
        if (prevBtn) prevBtn.addEventListener('click', () => this.scrollToPage(this.#carousel.current - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.scrollToPage(this.#carousel.current + 1));

        let scrollTimeout = null;
        this.#carousel.container.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const idx = this.#getNearestPageIndex();
                this.#setCurrentIndex(idx);
            }, 80);
        });
    }

    /* -----------------------------
       Public view API
    ----------------------------- */

    clear() {
        [
            '[data-field="keyFeatures"]',
            '[data-field="techStack"]',
            '[data-field="tags"]',
            '[data-field="metrics"]',
            '[data-field="codeSnippets"]',
            '[data-field="gallery"]',
        ].forEach(sel => {
            const el = this.#root.querySelector(sel);
            if (el) el.innerHTML = '';
        });
    }

    togglePlaceholder(show) {
        const placeholder = this.#root.querySelector('[data-placeholder]') || this.#root.querySelector('.project-placeholder');
        const pages = Array.from(this.#carousel.pages || []);
        if (placeholder) placeholder.style.display = show ? 'flex' : 'none';
        pages.forEach(p => p.style.display = show ? 'none' : '');
        if (this.#carousel.container) this.#carousel.container.style.display = show ? 'none' : 'flex';
    }

    render(data) {
        if (!data) return;
        this.clear();
        this.togglePlaceholder(false);

        this.#renderKeyFeatures(data.keyFeatures);
        this.#renderTechStack(data.techStack);
        this.#renderTags(data.tags);
        this.#renderMetrics(data.impact?.metrics);
        this.#renderGallery(data.media);
        this.#renderCodeSnippets(data.codeSnippets);

        this.#updatePagesList();
        this.scrollToPage(0);
    }

    /* -----------------------------
       Render helpers
    ----------------------------- */

    #renderKeyFeatures(features) {
        const el = this.#root.querySelector('[data-field="keyFeatures"]');
        if (!el || !Array.isArray(features)) return;
        const ul = document.createElement('ul');
        features.forEach(f => {
            const li = document.createElement('li');
            li.textContent = f;
            ul.appendChild(li);
        });
        el.appendChild(ul);
    }

    #renderTechStack(techStack) {
        const el = this.#root.querySelector('[data-field="techStack"]');
        if (!el || !Array.isArray(techStack)) return;
        techStack.forEach((t, i) => {
            const badge = document.createElement('span');
            badge.className = 'tech-badge';
            badge.textContent = t;
            badge.style.animationDelay = `${i * 0.06}s`;
            el.appendChild(badge);
        });
    }

    #renderTags(tags) {
        const el = this.#root.querySelector('[data-field="tags"]');
        if (!el || !Array.isArray(tags)) return;
        tags.forEach((t, i) => {
            const badge = document.createElement('span');
            badge.className = 'tag';
            badge.textContent = t;
            badge.style.animationDelay = `${i * 0.06}s`;
            el.appendChild(badge);
        });
    }

    #renderMetrics(metrics) {
        const el = this.#root.querySelector('[data-field="metrics"]');
        if (!el || !metrics) return;
        Object.entries(metrics).forEach(([k, v]) => {
            const card = document.createElement('div');
            card.className = 'metric-card';
            card.innerHTML = `<div class="metric-value">${v}</div><div class="metric-title">${k}</div>`;
            el.appendChild(card);
        });
    }

    #renderGallery(media) {
        const el = this.#root.querySelector('[data-field="gallery"]');
        if (!el || !Array.isArray(media)) return;
        media.forEach(m => {
            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = '0.5rem';
            if (m.type?.startsWith('image') || m.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                const img = document.createElement('img');
                img.src = m.url;
                img.alt = m.caption || '';
                img.style.maxWidth = '100%';
                wrapper.appendChild(img);
            } else if (m.url) {
                const a = document.createElement('a');
                a.href = m.url;
                a.textContent = m.caption || m.url;
                a.target = '_blank';
                wrapper.appendChild(a);
            }
            el.appendChild(wrapper);
        });
    }

    #renderCodeSnippets(snippets) {
        const container = this.#root.querySelector('[data-field="codeSnippets"]');
        if (!container || typeof snippets !== 'object') return;
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

    /* -----------------------------
       Carousel utils
    ----------------------------- */

    #updatePagesList() {
        const carousel = this.#carousel.container;
        this.#carousel.pages = Array.from(carousel?.querySelectorAll('.project-details[data-page]') || []);
        if (this.#carousel.current >= this.#carousel.pages.length) this.#carousel.current = 0;
    }

    scrollToPage(index = 0, animate = true) {
        const carousel = this.#carousel.container;
        const pages = this.#carousel.pages;
        if (!carousel || !pages.length) return;

        index = Math.max(0, Math.min(pages.length - 1, index));
        const target = pages[index];
        if (!target) return;

        if (animate) carousel.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
        else carousel.scrollLeft = target.offsetLeft;

        this.#carousel.current = index;
        pages.forEach((p, i) => p.classList.toggle('active', i === index));
    }

    #getNearestPageIndex() {
        const carousel = this.#carousel.container;
        if (!carousel || !this.#carousel.pages.length) return 0;
        const width = carousel.clientWidth || 1;
        return Math.max(0, Math.min(this.#carousel.pages.length - 1, Math.round(carousel.scrollLeft / width)));
    }

    #setCurrentIndex(idx) {
        idx = Math.max(0, Math.min(this.#carousel.pages.length - 1, idx));
        this.#carousel.current = idx;
        this.#carousel.pages.forEach((p, i) => p.classList.toggle('active', i === idx));
    }
}
