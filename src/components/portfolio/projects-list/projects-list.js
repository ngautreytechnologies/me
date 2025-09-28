import { technologyTaxonomy } from '../data';
import BaseShadowComponent from '../../base-shadow-component';
import { setSelectedTechnologyTopic } from '../../../modules/reactivity/signal-store';
import { ProjectRenderer } from '../services/project';

import templateHtml from './projects-list.html';
import css from './projects-list.css';

class ProjectsSearch extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
        this.roottechnologyTaxonomy = technologyTaxonomy;
        this.currentLevel = technologyTaxonomy;
        this.path = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this._renderLevel(this.roottechnologyTaxonomy);
    }

    _renderLevel(levelData) {
        this.currentLevel = levelData;
        super.triggerTemplateRender(levelData, '.technology-tiles-container');

        // Handle tile clicks
        Promise.resolve().then(() => {
            const tiles = this.root.querySelectorAll('.technology-tag');
            tiles.forEach(tile => {
                tile.addEventListener('click', async () => {
                    const id = tile.getAttribute('id');
                    const tag = this.currentLevel.find(t => t.id === id);
                    if (!tag) return;

                    setSelectedTechnologyTopic(tag);

                    if (tag.children && tag.children.length > 0) {
                        this.path.push(tag);
                        this._renderLevel(tag.children);
                    } else {
                        // Leaf node — just add tag to path
                        if (!this.path.includes(tag)) this.path.push(tag);
                    }

                    this.renderSupplementaryData();
                });
            });
        });

        this.renderSupplementaryData();
    }

    renderSupplementaryData() {
        console.group(`[${this.constructor.name}] renderSupplementaryData`);
        try {
            const breadcrumbList = this.root.querySelector('[data-field="breadcrumb-list"]');
            const backButton = this.root.querySelector('[data-action="back"]');
            const projectsContainer = this.root.querySelector('.project-repositories-container');
            const projectsList = this.root.querySelector('#projects-list');

            if (!breadcrumbList) return;

            breadcrumbList.innerHTML = '';
            const depth = this.path.length;

            const homeLi = document.createElement('li');
            homeLi.classList.add('breadcrumb-item');
            if (depth === 0) {
                homeLi.textContent = 'Home';
            } else {
                const homeLink = document.createElement('a');
                homeLink.href = '#';
                homeLink.textContent = 'Home';
                homeLink.addEventListener('click', e => {
                    e.preventDefault();
                    this.path = [];
                    this._renderLevel(this.roottechnologyTaxonomy);
                });
                homeLi.appendChild(homeLink);
            }
            breadcrumbList.appendChild(homeLi);

            this.path.forEach((tag, i) => {
                const li = document.createElement('li');
                li.classList.add('breadcrumb-item');

                if (i === this.path.length - 1) {
                    li.textContent = tag.name;
                } else {
                    const link = document.createElement('a');
                    link.href = '#';
                    link.textContent = tag.name;
                    link.addEventListener('click', e => {
                        e.preventDefault();
                        this.path = this.path.slice(0, i + 1);
                        this._renderLevel(tag.children || []);
                    });
                    li.appendChild(link);
                }
                breadcrumbList.appendChild(li);
            });

            if (backButton) {
                backButton.hidden = depth === 0;
                if (!backButton.hidden) {
                    backButton.onclick = () => {
                        this.path.pop();
                        if (this.path.length === 0) {
                            this._renderLevel(this.roottechnologyTaxonomy);
                        } else {
                            const last = this.path[this.path.length - 1];
                            this._renderLevel(last.children || []);
                        }
                    };
                }
            }

            const topics = this.path.map(tag => tag.name);
            console.log('Topics for repo query:', topics);

            if (projectsContainer && projectsList) {
                ProjectRenderer.renderProjectsForTopics(
                    projectsList,
                    topics
                );
            }

        } catch (err) {
            console.error(`[${this.constructor.name}] renderSupplementaryData error:`, err);
        } finally {
            console.groupEnd();
        }
    }
}

customElements.define('projects-list', ProjectsSearch);
