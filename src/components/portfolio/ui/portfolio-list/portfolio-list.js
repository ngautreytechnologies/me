import { subscribeTagsUpdated } from '../../../../modules/reactivity/signal-store';
import BaseShadowComponent from '../../../base-shadow-component';
import { ProjectRenderer } from '../../domain/project/project-renderer';
import css from './portfolio-list.css';
import templateHtml from './portfolio-list.html';

const LOG = (...args) => {
    if (window?.DEBUG_PROJECTS) console.log('[ProjectsList]', ...args);
};

export default class ProjectsList extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
        this._unsubscribe = null;
        this._projectsContainer = null;
        this._eventQueue = [];
        this._isReady = false;
        this._renderer = null;
        this._abortController = null;
    }

    connectedCallback() {
        super.connectedCallback();

        this._projectsContainer = this.root.querySelector('.projects-container');
        if (!this._projectsContainer) {
            console.error('[ProjectsList] ❌ Missing .projects-container element in template.');
            return;
        }

        // Create the renderer instance once DOM is ready
        this._renderer = new ProjectRenderer(this, {
            logger: (...args) => console.log('[ProjectsList]', ...args),
        });

        // Subscribe to global tagsUpdated signal
        this._unsubscribe = subscribeTagsUpdated((payload) => {
            LOG('📡 tagsUpdated event received:', payload);
            if (!this._isReady) {
                this._eventQueue.push(payload);
                return;
            }
            this._handleTagsUpdated(payload || {});
        });

        this._isReady = true;

        // Process queued events
        if (this._eventQueue.length > 0) {
            LOG(`📬 Flushing ${this._eventQueue.length} queued events...`);
            this._eventQueue.forEach((payload) => this._handleTagsUpdated(payload || {}));
            this._eventQueue = [];
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback?.();
        this._isReady = false;
        if (typeof this._unsubscribe === 'function') {
            this._unsubscribe();
            this._unsubscribe = null;
        }
        if (this._abortController) {
            this._abortController.abort();
            this._abortController = null;
        }
    }

    /**
     * Handle new topics update signal
     * @param {Object} payload
     */
    _handleTagsUpdated(payload) {
        const topics = payload?.topics || [];
        LOG('🔄 Processing topics:', topics);

        if (!topics || topics.length === 0) {
            this._setState('No topics selected. Please choose some tags or search for more.', 'empty');
            return;
        }

        this._renderProjects(topics);
    }

    /**
     * 📦 Helper: Set loading, error, or empty state
     */
    _setState(message, className = 'info') {
        if (this._projectsContainer) {
            this._projectsContainer.innerHTML = `<p class="${className}">${message}</p>`;
        }
    }

    /**
     * 🔄 Render projects for a given set of topics using the new ProjectRenderer
     */
    async _renderProjects(topics) {
        if (!this._renderer) {
            console.error('[ProjectsList] Renderer not initialized.');
            return;
        }

        // cancel any previous render in-flight
        if (this._abortController) {
            LOG('⚠️ Aborting previous render...');
            this._abortController.abort();
        }

        this._abortController = new AbortController();

        try {
            console.time('[ProjectsList]Render duration');
            await this._renderer.renderProjectsForTopics(topics, {
                signal: this._abortController.signal,
            });
            console.timeEnd('[ProjectsList] Render duration');
            LOG('✅ Projects rendered successfully');
        } catch (err) {
            if (err?.name === 'AbortError') {
                LOG('Render aborted (new request triggered)');
                return;
            }
            console.error('[ProjectsList] Render error:', err);
            this._setState('Failed to load projects. Please try again later.', 'error');
        }
    }
}

customElements.define('projects-list', ProjectsList);
