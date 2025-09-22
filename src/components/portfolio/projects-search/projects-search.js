import BaseShadowComponent from '../../base-shadow-component.js';
import css from './projects-search.css';
import templateHtml from './projects-search.html';
import { tags } from '../data.js';
import { setSelectedTechnologyTag } from '../../../utils/signal-store.js';

class ProjectsSearch extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
        this.currentLevel = tags;   // start with root level
        this.path = [];             // stack for breadcrumb/back
    }

    connectedCallback() {
        super.connectedCallback();
        this._renderLevel(this.currentLevel);
    }

    _renderLevel(levelData) {
        // Replace with new level
        this.currentLevel = levelData;
        super.triggerTemplateRender(levelData);
        super.triggerSupplementaryDataRender(levelData)

        // Wait until render is done
        Promise.resolve().then(() => {
            const tiles = this.root.querySelectorAll('.technology-tag');
            console.log('Found tiles after render:', tiles);

            tiles.forEach(tile => {
                tile.addEventListener('click', () => {
                    const id = tile.getAttribute('id');
                    const tag = this.currentLevel.find(s => s.id == id);

                    if (tag) {
                        console.log('Tile clicked, id:', id, tag);
                        setSelectedTechnologyTag(tag);

                        // If tag has children → drill down
                        if (tag.children && tag.children.length > 0) {
                            this.path.push(this.currentLevel);
                            this._renderLevel(tag.children);
                        } else {
                            console.log('Reached leaf tag:', tag);
                        }
                    }
                });
            });
        });
    }

    renderSupplementaryData(pathItems) {
        console.group(`[${this.constructor.name}] renderSupplementaryData (override)`);

        // Run base rendering first (if needed)
        super.renderSupplementaryData(pathItems);

        try {
            const breadcrumbList = this.root.querySelector('[data-field="breadcrumb-list"]');
            const backButton = this.root.querySelector('[data-action="back"]');

            if (!breadcrumbList) {
                console.warn(`[${this.constructor.name}] No breadcrumb list found`);
                return;
            }

            // Normalize to array: pathItems must represent the path from root to current
            const dataArray = Array.isArray(pathItems) ? pathItems : [pathItems];

            // Clear breadcrumbs
            breadcrumbList.innerHTML = '';

            // Always prepend "Home"
            const homeItem = { name: "Home", id: "root" };
            const fullPath = [homeItem, ...dataArray];

            fullPath.forEach((item, index) => {
                const li = document.createElement('li');
                li.classList.add('breadcrumb-item');

                const isLast = index === fullPath.length - 1;
                const isHome = index === 0;

                if (isLast) {
                    // Last item → plain text
                    li.textContent = item.name;
                } else if (isHome && fullPath.length === 1) {
                    // Home only, no link
                    li.textContent = item.name;
                } else {
                    // Clickable link
                    const a = document.createElement('a');
                    a.href = '#';
                    a.textContent = item.name;
                    a.dataset.id = item.id || '';
                    a.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.dispatchEvent(new CustomEvent('breadcrumbClick', {
                            detail: { item, index },
                            bubbles: true,
                            composed: true
                        }));
                    });
                    li.appendChild(a);
                }

                breadcrumbList.appendChild(li);
            });

            // Back button only visible beyond root
            if (backButton) {
                backButton.hidden = fullPath.length <= 1;
            }

            console.log(`[${this.constructor.name}] Breadcrumbs rendered:`, fullPath);
        } catch (err) {
            console.error(`[${this.constructor.name}] renderSupplementaryData breadcrumb error:`, err);
        } finally {
            console.groupEnd();
        }
    }


    // Optional: navigate back up
    goBack() {
        if (this.path.length > 0) {
            const prevLevel = this.path.pop();
            this._renderLevel(prevLevel);
        }
    }
}

customElements.define('projects-search', ProjectsSearch);
