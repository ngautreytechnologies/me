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
        super.triggerRender(levelData);

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

    // Optional: navigate back up
    goBack() {
        if (this.path.length > 0) {
            const prevLevel = this.path.pop();
            this._renderLevel(prevLevel);
        }
    }
}

customElements.define('projects-search', ProjectsSearch);
