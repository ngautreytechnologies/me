// src/components/portfolio-list.js
import BaseComponent from '../../../base-component.js';
import { PortfolioComposer } from '../../composers/portfolio-composer.js';

import cssText from '../styles/portfolio-list.css';
import templateHtml from './portfolio-list.html';

/**
 * <portfolio-list>
 * - Extends BaseComponent (handles style injection + template injection)
 * - Instantiates PortfolioComposer which finds .projects-container and #project-card-template
 * - Exposes public API: renderTopics(topics), updateProjects(repos), clear(), teardown()
 *
 * Attributes:
 * - topics: comma-separated list of topics (reactive)
 */
export default class PortfolioList extends BaseComponent {
    static get observedAttributes() {
        // merge BaseComponent observedAttributes with 'topics' if BaseComponent supports it
        return [...new Set([...'topics'.split(',')].concat(BaseComponent._observedAttrs || []))];
    }

    constructor() {
        // pass templateHtml & cssText into BaseComponent which will inject into this.root (shadow)
        // dataAttrs left null because we handle attribute updates manually
        super(templateHtml, cssText, /* dataAttrs */ null, /* useShadow */ true);

        /** @type {PortfolioComposer|null} */
        this._composer = null;

        /** @type {AbortController|null} */
        this._abortController = null;

        // initial topics parsed from attribute (may be empty)
        this._pendingTopics = (this.getAttribute('topics') || '').split(',').map(t => t.trim()).filter(Boolean);

        // Bind methods for clarity
        this.renderTopics = this.renderTopics.bind(this);
        this.updateProjects = this.updateProjects.bind(this);
        this.clear = this.clear.bind(this);
        this.teardown = this.teardown.bind(this);
    }

    /**
     * onConnect hook invoked by BaseComponent after template injection.
     */
    onConnect() {
        // Create composer with the component's root (shadowRoot)
        try {
            this._composer = new PortfolioComposer(this.root, {
                // composer will find .projects-container and #project-card-template inside this.root
                autoScrollOnUpdate: true,
                visibleCount: 2
            });
        } catch (err) {
            console.error('[PortfolioList] Failed to initialize PortfolioComposer', err);
            return;
        }

        // If initial topics exist, trigger a render
        if (this._pendingTopics && this._pendingTopics.length > 0) {
            // fire-and-forget; errors logged inside composer flow
            this.renderTopics(this._pendingTopics).catch(err => {
                if (err?.name !== 'AbortErgror') console.error('[PortfolioList] initial render failed', err);
            });
        } else {
            // show empty state explicitly
            try { this._composer.clear(); } catch (e) { /* ignore */ }
        }
    }

    /**
     * Observe attribute changes (topics).
     * BaseComponent already implements attributeChangedCallback; we override to react immediately.
     */
    attributeChangedCallback(name, oldValue, newValue) {
        // Call BaseComponent's implementation for logging/reactions
        try {
            super.attributeChangedCallback?.(name, oldValue, newValue);
        } catch (e) { /* ignore */ }

        if (name === 'topics' && oldValue !== newValue) {
            const topics = (newValue || '').split(',').map(t => t.trim()).filter(Boolean);
            // Cancel any in-flight renders and start new one
            this.renderTopics(topics).catch(err => {
                if (err?.name !== 'AbortError') console.error('[PortfolioList] render after attribute change failed', err);
            });
        }
    }

    /**
     * Public API: render topics (cancellable)
     * @param {string[]|string} topics
     * @returns {Promise<Array<object>>} repos
     */
    async renderTopics(topics = []) {
        if (!this._composer) {
            throw new Error('[PortfolioList] Composer not initialized yet');
        }

        // normalize topics
        if (!Array.isArray(topics)) topics = topics ? [topics] : [];
        topics = topics.filter(Boolean);

        // abort previous request if present
        if (this._abortController) {
            try { this._abortController.abort(); } catch (e) { /* ignore */ }
            this._abortController = null;
        }

        this._abortController = new AbortController();
        const { signal } = this._abortController;

        try {
            const repos = await this._composer.renderProjectsForTopics(topics, { signal });
            return repos;
        } catch (err) {
            if (err?.name === 'AbortError') {
                // aborted: expose as such to callers if they want to handle it
                throw err;
            }
            // other errors already cause composer to showError; rethrow for external handling
            throw err;
        } finally {
            // clear the controller if not aborted (we still clear to avoid leaks)
            if (this._abortController && !signal.aborted) {
                this._abortController = null;
            }
        }
    }

    /**
     * Public API: updateProjects - directly replace current view with provided repos.
     * This bypasses fetch and uses composer.view rendering.
     * @param {Array<object>} repos
     */
    updateProjects(repos = []) {
        if (!this._composer) {
            throw new Error('[PortfolioList] Composer not initialized yet');
        }
        if (!Array.isArray(repos)) throw new TypeError('updateProjects expects an array');

        // Use composer to clear and append the provided repos
        try {
            this._composer.clear();
            // use appendProjects so the cards animate-in
            this._composer.appendProjects(repos);
        } catch (err) {
            console.error('[PortfolioList] updateProjects failed', err);
        }
    }

    /**
     * Public API: clear view
     */
    clear() {
        try {
            this._composer?.clear();
        } catch (err) {
            console.error('[PortfolioList] clear failed', err);
        }
    }

    /**
     * Public API: teardown composer & cleanup
     */
    teardown() {
        try {
            // abort any in-flight fetch
            if (this._abortController) {
                try { this._abortController.abort(); } catch (e) { /* ignore */ }
                this._abortController = null;
            }

            this._composer?.teardown?.();
            this._composer = null;
        } catch (err) {
            console.error('[PortfolioList] teardown failed', err);
        }
    }

    /**
     * disconnectedCallback ensures we cleanup composer + abort controllers and call BaseComponent disconnected
     */
    disconnectedCallback() {
        // Call BaseComponent's disconnected to preserve its disposables behavior
        try {
            super.disconnectedCallback?.();
        } catch (e) { /* ignore */ }

        // Teardown composer, cancel requests
        this.teardown();
    }
}

customElements.define('portfolio-list', PortfolioList);
