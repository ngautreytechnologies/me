import BaseShadowComponent from '../../base-shadow-component.js';
import css from './skills-grid.css';
import templateHtml from './skills-grid.html';
const skillsData = [
    { "skill-id": "Python" },
    { "skill-id": "C#" },
    { "skill-id": "AWS" },
    { "skill-id": "Angular" },
    { "skill-id": "Full Stack Development" },
    { "skill-id": "CI/CD" },
    { "skill-id": "SQL" },
    { "skill-id": "NoSQL" },
    { "skill-id": "Neo4j" }
];

class SkillsGrid extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
        console.log('SkillsGrid component initialized', templateHtml, css);

        // Initialize reactive data
        this.data.set(skillsData);
    }

    connectedCallback() {
        super.connectedCallback();
    }
}

customElements.define('skills-grid', SkillsGrid);
