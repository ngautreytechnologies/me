import BaseShadowComponent from '../../base-shadow-component.js';
import templateHtml from './skills-expertise.html';
import css from './skills-expertise.css';

const skillExpertiseData = [
    {
        id: "Python-details",
        title: "Python / AI",
        tags: ["AI", "Automation", "LLM"],
        overview: "Python is my primary language for AI-enhanced workflows and API development. I leverage FastAPI and Flask for web services, and LangChain for building modular AI components.",
        keyFeatures: [
            "FastAPI and Flask for lightweight, scalable APIs",
            "LangChain for modular LLM workflows and automation",
            "AI sidecar patterns for orchestration and task delegation",
            "Rapid prototyping with Python and AI libraries"
        ],
        pros: "Highly versatile, strong ecosystem, great for AI/ML workflows, quick development cycles.",
        cons: "Some runtime performance overhead, requires careful dependency management, async complexity in large projects."
    }
    // Add more skills here
];

class SkillExpertiseDetails extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
        this.data.set(skillExpertiseData);
    }

    connectedCallback() {
        super.connectedCallback();
        this.render();
    }

    render() {
        const container = this.root.querySelector('[data-container]');
        const templateEl = this.root.querySelector('template');
        if (!container || !templateEl) return;

        container.innerHTML = '';

        this.data.get().forEach(skill => {
            const clone = templateEl.content.cloneNode(true);

            // Fill fields using data-field
            clone.querySelectorAll('[data-field]').forEach(el => {
                const field = el.dataset.field;

                if (field === 'tags' && skill.tags) {
                    el.innerHTML = '';
                    skill.tags.forEach(tag => {
                        const span = document.createElement('span');
                        span.className = 'tag';
                        span.textContent = tag;
                        el.appendChild(span);
                    });
                } else if (field === 'keyFeatures' && skill.keyFeatures) {
                    el.innerHTML = '';
                    skill.keyFeatures.forEach(f => {
                        const li = document.createElement('li');
                        li.textContent = f;
                        el.appendChild(li);
                    });
                } else if (skill[field]) {
                    el.innerHTML = skill[field];
                }
            });

            container.appendChild(clone);
        });
    }
}

customElements.define('skill-expertise-details', SkillExpertiseDetails);
