import { ProjectCardView } from '../views/project-card-view';

/**
 * ProjectListView
 * - Renders project cards into a shadow-root container
 * - Handles enter/exit animations and viewport sizing (exactly N cards visible)
 * - Defensive: normalizes whatever ProjectCardView.render returns (Element | DocumentFragment | string | null)
 *
 * Usage:
 *   const view = new ProjectListView(hostEl, { autoScrollOnUpdate: true, visibleCount: 2 });
 *   await view.renderProjects(reposArray);
 *   view.teardown();
 */
export class ProjectListView {
    #container;
    #cardView;
    #cleanupViewport = null;
    #mo = null;
    #resizeHandler = null;
    #autoScroll = false;
    #visibleCount = 2;

    /**
     * @param {HTMLElement} hostEl - custom element with shadowRoot
     * @param {Object} [opts]
     * @param {boolean} [opts.autoScrollOnUpdate=false] - scroll to top after updates
     * @param {number} [opts.visibleCount=2] - number of cards to show (min/max height)
     */
    constructor(hostEl, { autoScrollOnUpdate = false, visibleCount = 2 } = {}) {
        if (!(hostEl instanceof HTMLElement) || !hostEl.shadowRoot) {
            throw new Error('[ProjectListView] hostEl must be a custom element with a shadowRoot');
        }

        this.#container = hostEl.shadowRoot.querySelector('.projects-container');
        if (!this.#container) {
            throw new Error('[ProjectListView] .projects-container not found in shadow root');
        }

        const template = hostEl.shadowRoot.querySelector('#project-card-template');
        if (template) {
            // Note: ProjectCardView ensures it returns a single HTMLElement
            this.#cardView = new ProjectCardView(template);
        } else {
            console.warn('[ProjectListView] ⚠️ No #project-card-template found. Cards may not render.');
            this.#cardView = null;
        }

        this.#autoScroll = !!autoScrollOnUpdate;
        this.#visibleCount = Number.isFinite(visibleCount) && visibleCount > 0 ? Math.max(1, Math.floor(visibleCount)) : 2;

        this.#setupViewportObserver();
    }

    /* -----------------------------
       Basic states & helpers
       ----------------------------- */

    clear() {
        this.#container.textContent = '';
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
        this.#container.innerHTML = html;
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
            await this._animateReplace(repos);
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
                    // detach from fragment (it is not in DOM yet) and return
                    // ensure it has the class
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

    /**
     * Animate existing cards out, append new cards hidden, then animate them in with stagger.
     * Returns when in-animation has been started (and sizing updated).
     */
    async _animateReplace(repos) {
        // 1) animate existing out
        const existing = Array.from(this.#container.querySelectorAll('.project-card'));
        if (existing.length > 0) {
            const outPromises = existing.map((el) => this._animateOutElement(el));
            // Wait until all have settled or a fallback timeout
            await Promise.race([Promise.allSettled(outPromises), new Promise((res) => setTimeout(res, 520))]);
            existing.forEach((el) => {
                try {
                    el.remove();
                } catch (e) { }
            });
        }

        // 2) create new cards (hidden)
        const frag = document.createDocumentFragment();
        repos.forEach((repo, i) => {
            const raw = this.#cardView.render(repo);
            const card = this._normalizeCard(raw, repo);

            // ensure a class exists
            if (!card.classList.contains('project-card')) card.classList.add('project-card');

            // remove animation classes to ensure starting state
            card.classList.remove('animate-in', 'animate-out');

            // set CSS variables for stagger
            card.style.setProperty('--i', String(i));
            // inline fallback transitionDelay in ms
            card.style.transitionDelay = `${i * 60}ms`;

            frag.appendChild(card);
        });

        this.#container.appendChild(frag);

        // Force layout then trigger animate-in
        await new Promise(requestAnimationFrame);

        const newCards = Array.from(this.#container.querySelectorAll('.project-card'));
        newCards.forEach((el) => {
            try {
                el.classList.add('animate-in');
            } catch (e) {
                // ignore per-element errors
            }
        });

        // 3) update sizing now that new cards are present
        this._applyViewportSizing(this.#visibleCount);
    }

    /**
     * Animate a single element out. Resolves when transitionend or timeout.
     * @param {HTMLElement} el
     * @returns {Promise<boolean>}
     */
    _animateOutElement(el) {
        return new Promise((resolve) => {
            let finished = false;

            const cleanup = () => {
                try {
                    el.removeEventListener('transitionend', onEnd);
                } catch (e) { }
                clearTimeout(timeoutId);
            };

            const onEnd = (ev) => {
                // ensure the event target is the element itself (not a child)
                if (ev && ev.target && ev.target !== el) return;
                if (finished) return;
                finished = true;
                cleanup();
                resolve(true);
            };

            // Add class and listen for transition end
            try {
                el.classList.add('animate-out');
            } catch (e) {
                // if class add fails, bail
                cleanup();
                resolve(false);
                return;
            }

            // fallback timeout in case transitionend never fires
            const timeoutId = setTimeout(() => {
                if (!finished) {
                    finished = true;
                    cleanup();
                    resolve(false);
                }
            }, 520);

            // Listen for transitionend on the element (once true ensures one call)
            el.addEventListener('transitionend', onEnd, { once: true });
        });
    }

    /* -----------------------------
       Viewport sizing
       ----------------------------- */

    /**
     * Set container min/max height to fit exactly visibleCount cards (using first card height).
     * @param {number} visibleCount
     */
    _applyViewportSizing(visibleCount = 2) {
        const first = this.#container.querySelector('.project-card');
        if (!first) {
            this.#container.style.minHeight = '';
            this.#container.style.maxHeight = '';
            return;
        }

        // offsetHeight includes padding + border
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

        this.#mo = new MutationObserver(() => {
            requestAnimationFrame(() => this._applyViewportSizing(this.#visibleCount));
        });

        this.#mo.observe(this.#container, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });

        this.#cleanupViewport = () => {
            try {
                this.#mo?.disconnect();
            } catch (e) { }
            window.removeEventListener('resize', this.#resizeHandler);
            this.#mo = null;
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
            } catch (e) {
                // ignore per-element errors
            }
        });
    }

    _scrollToTop({ smooth = false } = {}) {
        try {
            if (typeof this.#container.scrollTo === 'function') {
                this.#container.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
            } else {
                this.#container.scrollTop = 0;
            }
        } catch (e) {
            /* ignore */
        }
    }

    teardown() {
        this._cancelAnimations();
        try {
            this.#cleanupViewport?.();
        } catch (e) { }
        this.clear();
        this.#container = null;
        this.#cardView = null;
        this.#cleanupViewport = null;
    }
}
