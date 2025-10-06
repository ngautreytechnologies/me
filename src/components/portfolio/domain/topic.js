import { setSelectedTechnologyTopic } from '../../../reactivity';
import { escapeHtml } from '../../../modules/security/security';

/**
 * Renders tags as clickable cards or buttons in a container.
 */
export class TopicRenderer {
    /**
     * Render tags in a horizontal or vertical layout.
     * @param {HTMLElement} container - Element where tags will be rendered.
     * @param {Array} tags - Flat list of tags [{ id, name, summary, parentId }]
     * @param {Object} options - { layout: 'horizontal'|'vertical' }
     */ 
    static render(container, tags = [], options = { layout: 'horizontal' }) {
        if (!container) return;

        container.textContent = '';

        if (!tags || !tags.length) {
            container.innerHTML = `<p>No tags available.</p>`;
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = options.layout === 'horizontal'
            ? 'tags-wrapper-horizontal'
            : 'tags-wrapper-vertical';

        tags.forEach(tag => {
            const tagEl = document.createElement('div');
            tagEl.className = 'tag-card';
            tagEl.innerHTML = `
                <div class="tag-name">${escapeHtml(tag.name)}</div>
                <div class="tag-summary">${escapeHtml(tag.summary || '')}</div>
            `;

            tagEl.addEventListener('click', () => {
                setSelectedTechnologyTopic(tag); // signal-store subscription
            });

            wrapper.appendChild(tagEl);
        });

        container.appendChild(wrapper);
    }
}
