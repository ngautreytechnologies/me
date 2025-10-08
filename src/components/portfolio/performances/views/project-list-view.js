import { ProjectCardView } from './project-card-view';

/**
 * ProjectListView
 * - Renders project cards into a container found in the given host root
 * - Handles enter/exit animations and viewport sizing (exactly N cards visible)
 * - Defensive: normalizes whatever ProjectCardView.render returns (Element | DocumentFragment | string | null)
 *
 * constructor accepts either the component's ShadowRoot or the host HTMLElement (which may have a shadowRoot).
 */
export class ProjectListView {
    #container;         // container element (the .projects-container)
    #cardView = null;   // ProjectCardView instance (optional)
    #cleanupViewport = null;
    #mutationObserver = null;
    #resizeHandler = null;
    #autoScroll = false;
    #visibleCount = 2;

    /**
     * @param {ShadowRoot|HTMLElement} hostRoot - host's shadowRoot OR the host element itself
     * @param {Object} [opts]
     * @param {string} [opts.containerSelector='.projects-container']
     * @param {string} [opts.templateSelector='#project-card-template']
     * @param {boolean} [opts.autoScrollOnUpdate=false]
     * @param {number} [opts.visibleCount=2]
     */
    constructor(hostRoot, {
        containerSelector = '.projects-container',
        templateSelector = '#project-card-template',
        autoScrollOnUpdate = false,
        visibleCount = 2
    } = {}) {
        const rootNode = hostRoot instanceof ShadowRoot ? hostRoot : (hostRoot && hostRoot.shadowRoot) ? hostRoot.shadowRoot : hostRoot;
        if (!rootNode) {
            throw new TypeError('[ProjectListView] hostRoot must be a ShadowRoot or an HTMLElement (with or without shadowRoot)');
        }

        const container = rootNode.querySelector(containerSelector);
        if (!container) {
            throw new Error(`[ProjectListView] Container "${containerSelector}" not found within the provided host root`);
        }
        this.#container = container;

        const template = rootNode.querySelector(templateSelector);
        if (template instanceof HTMLTemplateElement) {
            try {
                this.#cardView = new ProjectCardView(template);
            } catch (err) {
                console.warn('[ProjectListView] Failed to construct ProjectCardView from template', err);
                this.#cardView = null;
            }
        } else {
            console.warn(`[ProjectListView] ⚠️ Template "${templateSelector}" not found or not an HTMLTemplateElement. Falling back to simple markup.`);
            this.#cardView = null;
        }

        this.#autoScroll = Boolean(autoScrollOnUpdate);
        this.#visibleCount = Number.isFinite(visibleCount) && visibleCount > 0 ? Math.max(1, Math.floor(visibleCount)) : 2;

        this.#setupViewportObserver();
    }

    /* -----------------------------
       Basic states & helpers
       ----------------------------- */

    clear() {
        // Remove all children that are not a <template> element
        Array.from(this.#container.childNodes).forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'template') return;
            node.remove();
        });

        // reset sizing
        this.#container.style.minHeight = '';
        this.#container.style.maxHeight = '';
    }

    showLoading(msg = 'Loading projects...') {
        this._immediateReplaceWith(`<p class="loading">${this._escapeHtml(msg)}</p>`);
    }

    showError(msg = 'Something went wrong loading projects.') {
        this._immediateReplaceWith(`<p class="error">${this._escapeHtml(msg)}</p>`);
    }

    showEmpty(msg = 'No projects found. Try selecting different tags.') {
        this._immediateReplaceWith(`<p class="no-results">${this._escapeHtml(msg)}</p>`);
    }

    _immediateReplaceWith(html) {
        this._cancelAnimations();
        this.clear();
        this.#container.insertAdjacentHTML('beforeend', html);
        this._applyViewportSizing(this.#visibleCount);
        if (this.#autoScroll) this._scrollToTop({ smooth: false });
    }

    _escapeHtml(s) {
        if (s == null) return '';
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /* -----------------------------
       Public rendering
       ----------------------------- */

    /**
     * Render a full list of projects with animations.
     * @param {Array<object>} repos
     */
    async renderProjects(repos = []) {
        if (!Array.isArray(repos) || repos.length === 0) {
            this.showEmpty();
            return;
        }

        if (!this.#cardView) {
            // fallback: simple markup
            this._immediateReplaceWith(
                repos
                    .map(
                        (r) =>
                            `<div class="project-card"><h3>${this._escapeHtml(r.name || r.id || 'project')}</h3><p>${this._escapeHtml(
                                r.description || ''
                            )}</p></div>`
                    )
                    .join('')
            );
            return;
        }

        try {
            console.log('Card view exists -- replacing repos');

            await this._animateReplace(repos);

            console.log('Repos replaced');

            if (this.#autoScroll) this._scrollToTop({ smooth: true });
        } catch (err) {
            console.error('[ProjectListView] renderProjects failed', err);
            // fallback append (non-animated)
            this.clear();
            const frag = document.createDocumentFragment();
            for (const repo of repos) {
                const el = this._normalizeCard(this.#cardView.render(repo), repo);
                frag.appendChild(el);
            }
            this.#container.appendChild(frag);
            this._applyViewportSizing(this.#visibleCount);
            if (this.#autoScroll) this._scrollToTop({ smooth: false });
        }
    }

    /**
     * Append projects without clearing (no out-animation for existing cards).
     * New cards will animate-in with stagger.
     * @param {Array<object>} repos
     */
    async appendProjects(repos = []) {
        if (!Array.isArray(repos) || repos.length === 0) return;

        // create new cards hidden
        const frag = document.createDocumentFragment();
        repos.forEach((repo, i) => {
            const raw = this.#cardView ? this.#cardView.render(repo) : null;
            const card = this._normalizeCard(raw, repo);

            if (!card.classList.contains('project-card')) card.classList.add('project-card');
            card.classList.remove('animate-in', 'animate-out');

            // We use --i relative to current count to keep stagger consistent
            const currentCount = this.#container.querySelectorAll('.project-card').length;
            const idx = currentCount + i;
            card.style.setProperty('--i', String(idx));
            card.style.transitionDelay = `${idx * 60}ms`;
            frag.appendChild(card);
        });

        this.#container.appendChild(frag);

        // force layout then add animate-in to new cards only
        await new Promise(requestAnimationFrame);
        const newCards = Array.from(this.#container.querySelectorAll('.project-card')).slice(-repos.length);
        newCards.forEach((el) => {
            try { el.classList.add('animate-in'); } catch (e) { /* ignore per-element errors */ }
        });

        this._applyViewportSizing(this.#visibleCount);
    }

    /* -----------------------------
       Normalizer
       ----------------------------- */

    /**
     * Normalize the result of ProjectCardView.render into a single HTMLElement
     * Accepts Element | DocumentFragment | string | null | other
     */
    _normalizeCard(maybeNode, repo = {}) {
        try {
            if (!maybeNode) {
                const el = document.createElement('div');
                el.className = 'project-card';
                el.innerHTML = `<h3>${this._escapeHtml(repo.name || repo.id || 'project')}</h3><p>${this._escapeHtml(repo.description || '')}</p>`;
                return el;
            }

            if (maybeNode instanceof DocumentFragment) {
                // If fragment contains a single element, return that element
                const elementChildren = Array.from(maybeNode.children || []).filter(Boolean);
                if (elementChildren.length === 1) {
                    const only = elementChildren[0];
                    if (!only.classList.contains('project-card')) only.classList.add('project-card');
                    return only;
                }

                // multiple nodes -> wrap them
                const wrapper = document.createElement('div');
                wrapper.className = 'project-card';
                wrapper.appendChild(maybeNode);
                return wrapper;
            }

            if (maybeNode instanceof Element) {
                if (!maybeNode.classList.contains('project-card')) maybeNode.classList.add('project-card');
                return maybeNode;
            }

            if (typeof maybeNode === 'string') {
                const wrapper = document.createElement('div');
                wrapper.className = 'project-card';
                wrapper.innerHTML = maybeNode;
                return wrapper;
            }

            // unknown type: create a simple card with textual fallback
            const el = document.createElement('div');
            el.className = 'project-card';
            el.textContent = String(repo.name || repo.id || 'project');
            return el;
        } catch (e) {
            console.warn('[ProjectListView] _normalizeCard unexpected render return', e);
            const el = document.createElement('div');
            el.className = 'project-card';
            el.textContent = String(repo.name || repo.id || 'project');
            return el;
        }
    }

    /* -----------------------------
       Animate replace (out -> in)
       ----------------------------- */

    async _animateReplace(repos) {
        // animate existing out
        const existing = Array.from(this.#container.querySelectorAll('.project-card'));
        if (existing.length > 0) {
            const outPromises = existing.map((el) => this._animateOutElement(el));
            await Promise.race([Promise.allSettled(outPromises), new Promise((res) => setTimeout(res, 520))]);
            existing.forEach((el) => {
                try { el.remove(); } catch (e) { /* ignore */ }
            });
        }

        // create new cards (hidden)
        const frag = document.createDocumentFragment();
        repos.forEach((repo, i) => {
            const raw = this.#cardView ? this.#cardView.render(repo) : null;
            const card = this._normalizeCard(raw, repo);

            if (!card.classList.contains('project-card')) card.classList.add('project-card');
            card.classList.remove('animate-in', 'animate-out');
            card.style.setProperty('--i', String(i));
            card.style.transitionDelay = `${i * 60}ms`;
            frag.appendChild(card);
        });

        this.#container.appendChild(frag);

        // Force layout then trigger animate-in
        await new Promise(requestAnimationFrame);

        const newCards = Array.from(this.#container.querySelectorAll('.project-card'));
        newCards.forEach((el) => {
            try { el.classList.add('animate-in'); } catch (e) { /* ignore per-element errors */ }
        });

        // update sizing
        this._applyViewportSizing(this.#visibleCount);
    }

    _animateOutElement(el) {
        return new Promise((resolve) => {
            let finished = false;
            const onEnd = (ev) => {
                if (ev && ev.target && ev.target !== el) return;
                if (finished) return;
                finished = true;
                cleanup();
                resolve(true);
            };

            const cleanup = () => {
                try { el.removeEventListener('transitionend', onEnd); } catch (e) { /* ignore */ }
                clearTimeout(timeoutId);
            };

            try {
                el.classList.add('animate-out');
            } catch (e) {
                cleanup();
                resolve(false);
                return;
            }

            const timeoutId = setTimeout(() => {
                if (!finished) {
                    finished = true;
                    cleanup();
                    resolve(false);
                }
            }, 520);

            el.addEventListener('transitionend', onEnd, { once: true });
        });
    }

    /* -----------------------------
       Viewport sizing
       ----------------------------- */

    _applyViewportSizing(visibleCount = 2) {
        const first = this.#container.querySelector('.project-card');
        if (!first) {
            this.#container.style.minHeight = '';
            this.#container.style.maxHeight = '';
            return;
        }

        const cardHeight = first.offsetHeight;
        const style = getComputedStyle(this.#container);
        const gapStr = style.gap || style.rowGap || '16px';
        const gap = parseFloat(gapStr) || 16;
        const total = cardHeight * visibleCount + gap * Math.max(0, visibleCount - 1);

        this.#container.style.minHeight = `${Math.round(total)}px`;
        this.#container.style.maxHeight = `${Math.round(total)}px`;
    }

    /* -----------------------------
       Observe / cleanup
       ----------------------------- */

    #setupViewportObserver = () => {
        this.#resizeHandler = () => requestAnimationFrame(() => this._applyViewportSizing(this.#visibleCount));
        window.addEventListener('resize', this.#resizeHandler);

        this.#mutationObserver = new MutationObserver(() => {
            requestAnimationFrame(() => this._applyViewportSizing(this.#visibleCount));
        });

        this.#mutationObserver.observe(this.#container, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });

        this.#cleanupViewport = () => {
            try { this.#mutationObserver?.disconnect(); } catch (e) { /* ignore */ }
            window.removeEventListener('resize', this.#resizeHandler);
            this.#mutationObserver = null;
            this.#resizeHandler = null;
        };
    };

    _cancelAnimations() {
        const cards = Array.from(this.#container.querySelectorAll('.project-card.animate-in, .project-card.animate-out'));
        cards.forEach((c) => {
            try {
                c.classList.remove('animate-in', 'animate-out');
                c.style.transitionDelay = '';
                c.remove();
            } catch (e) { /* ignore per-element errors */ }
        });
    }

    _scrollToTop({ smooth = false } = {}) {
        try {
            if (typeof this.#container.scrollTo === 'function') {
                this.#container.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
            } else {
                this.#container.scrollTop = 0;
            }
        } catch (e) { /* ignore */ }
    }

    teardown() {
        this._cancelAnimations();
        try { this.#cleanupViewport?.(); } catch (e) { /* ignore */ }
        this.clear();
        this.#cardView = null;
        this.#cleanupViewport = null;
        this.#container = null;
    }
}
