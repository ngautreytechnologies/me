import BaseShadowComponent from '../../base-shadow-component.js';
import css from './skills-grid.css';
import templateHtml from './skills-grid.html';
import { setSelectedSkill } from '../../../utils/signal-store.js'; // signal for selected skill

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

class SkillsGrid extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
    }

    connectedCallback() {
        this.data.set(data);
        super.connectedCallback();

        // ------------------------------
        // Register click handlers on tiles
        // ------------------------------
        const tiles = this.root.querySelectorAll('.skill-badge');
        console.log('Found tiles:', tiles);

        tiles.forEach(tile => {
            tile.addEventListener('click', () => {
                console.log('Tile clicked', tile);

                const skillId = tile.getAttribute('id');
                const skill = data.find(s => s.id === skillId);
                console.log('Found skill data:', skillId, skill);

                if (skill) {
                    console.log('Tile clicked, setting selected skill:', skillId);
                    setSelectedSkill(skill);
                }
            });
        });
    }
}

customElements.define('skills-grid', SkillsGrid);
