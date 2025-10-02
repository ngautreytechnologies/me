import { SIGNAL_STORE_ID, subscribeTagsUpdated } from '../../../../modules/reactivity/signal-store';
import BaseShadowComponent from '../../../base-shadow-component';
import { ProjectRenderer } from '../../domain/project/project';

import css from './portfolio-list.css';
import templateHtml from './portfolio-list.html';

console.log('[ProjectsList] 🧭 Signal store ID:', SIGNAL_STORE_ID);

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
    }

    connectedCallback() {
        super.connectedCallback();

        // Cache container once
        this._projectsContainer = this.root.querySelector('.project-repositories-container');
        if (!this._projectsContainer) {
            console.error('[ProjectsList] ❌ Missing .projects-container element in template.');
            return;
        }

        // Subscribe to global tagsUpdated signal
        this._unsubscribe = subscribeTagsUpdated((payload) => {
            LOG('📡 tagsUpdated event received:', payload);
            if (!this._isReady) {
                this._eventQueue.push(payload);
                return;
            }

            this._renderProjects(payload || []);
        });

        this._isReady = true;

        // Replay any queued events that arrived before connection was complete
        if (this._eventQueue.length > 0) {
            console.log(`[ProjectsList] 📬 Flushing ${this._eventQueue.length} queued events...`);
            this._eventQueue.forEach((topics) => this._renderProjects(topics || []));
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
    }

    /**
     * 📦 Helper: Set loading, error, or empty state in the container
     */
    _setState(message, className = 'info') {
        if (this._projectsContainer) {
            this._projectsContainer.innerHTML = `<p class="${className}">${message}</p>`;
        }
    }

    /**
     * 🔄 Render projects for a given set of topics
     */
    async _renderProjects(payload) {
        console.log('📥 Topics payload:', payload);

        if (!this._projectsContainer) {
            console.error('[ProjectsList] ❌ No container found — aborting render.');
            return;
        }

        let topics = payload.topics;

        // Normalize topics
        if (!Array.isArray(topics)) {
            topics = [topics];
        }
        topics = topics.filter(Boolean);

        if (topics.length === 0) {
            this._setState('No topics selected. Please choose some tags or search for more.', 'empty');
            return;
        }

        // Guard: Ensure renderer exists
        if (!ProjectRenderer?.renderProjectsForTopics) {
            console.error('[ProjectsList] ❌ ProjectRenderer.renderProjectsForTopics is not defined!');
            this._setState('Internal error: renderer missing.', 'error');
            return;
        }

        try {
            // 🧪 Start loading
            this._setState('Loading projects...', 'loading');
            console.time('[ProjectsList] ⏱️ Render duration');

            // ✅ Render via shared ProjectRenderer
            await ProjectRenderer.renderProjectsForTopics(this._projectsContainer, topics);

            console.timeEnd('[ProjectsList] ⏱️ Render duration');
            console.log('✅ Projects rendered successfully');
        } catch (err) {
            console.error('[ProjectsList] 💥 Render error:', err);
            this._setState('Failed to load projects. Please try again later.', 'error');
        } finally {
        }
    }
}

customElements.define('projects-list', ProjectsList);
