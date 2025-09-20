import BaseShadowComponent from '../../base-shadow-component.js';
import css from './projects-search.css';
import templateHtml from './projects-search.html';
import { setSelectedSkill } from '../../../utils/signal-store.js'; // signal for selected project

const data = [
    { id: "python", label: "Python" },
    { id: "csharp", label: "C#" },
    { id: "aws", label: "AWS" },
    { id: "angular", label: "Angular" },
    { id: "fullstack", label: "Full Stack Development" },
    { id: "systems-design", label: "Systems Design and Architecture" },
    { id: "sql", label: "SQL" },
    { id: "nosql", label: "NoSQL" },
    { id: "neo4j", label: "Neo4j" }
];

class ProjectsSearch extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
    }

    connectedCallback() {
        this.data.set(data);
        super.connectedCallback();

        // ------------------------------
        // Register click handlers on tiles
        // ------------------------------
        const tiles = this.root.querySelectorAll('.project-badge');
        console.log('Found tiles:', tiles);

        tiles.forEach(tile => {
            tile.addEventListener('click', () => {
                console.log('Tile clicked', tile);

                const projectId = tile.getAttribute('id');
                const project = data.find(s => s.id === projectId);
                console.log('Found project data:', projectId, project);

                if (project) {
                    console.log('Tile clicked, setting selected project:', projectId);
                    setSelectedSkill(project);
                }
            });
        });
    }
}

customElements.define('projects-search', ProjectsSearch);
