import BaseShadowComponent from '../../base-shadow-component';
import { setSelectedSkill } from '../../../reactivity'

import css from './skills-grid.css';
import templateHtml from './skills-grid.html';

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
        super.connectedCallback();
        super.triggerTemplateRender(data);

        // Wait until render has run
        Promise.resolve().then(() => {
            const tiles = this.root.querySelectorAll('.skill-badge');
            console.log('Found tiles after render:', tiles);

            tiles.forEach(tile => {
                console.log('Tile click handler registrered', tile);

                tile.addEventListener('click', () => {
                    const skillId = tile.getAttribute('id');
                    const skill = data.find(s => s.id === skillId);
                    console.log('Tile clicked, setting selected skill:', skillId);
                    setSelectedSkill(skill);
                });
            });
        });
    }
}

customElements.define('skills-grid', SkillsGrid);
