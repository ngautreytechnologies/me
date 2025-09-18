import BaseShadowComponent from '../../base-shadow-component.js';
import templateHtml from './skill-details.html';
import css from './skill-details.css';
import { subscribeSelectedSkill } from '../../../utils/signal-store.js';

const data = [
    {
        id: "python",
        title: "Python / AI",
        tags: ['AI', 'Automation', 'LLM'],
        overview: "Python is my primary language for AI-enhanced workflows and API development. I leverage FastAPI and Flask for web services, and LangChain for building modular AI components.",
        keyFeatures: `<ul>
                        <li>FastAPI and Flask for lightweight, scalable APIs</li>
                        <li>LangChain for modular LLM workflows and automation</li>
                        <li>AI sidecar patterns for orchestration and task delegation</li>
                        <li>Rapid prototyping with Python and AI libraries</li>
                      </ul>`,
        pros: "Highly versatile, strong ecosystem, great for AI/ML workflows, quick development cycles.",
        cons: "Some runtime performance overhead, requires careful dependency management, async complexity in large projects."
    },
    {
        id: "csharp",
        title: "C# / .NET",
        tags: ['Backend', 'Enterprise', 'Microservices'],
        overview: "C# is my go-to for enterprise-grade backend applications, microservices, and Windows-based tools. I focus on maintainable, performant architecture with .NET Core and .NET 6+.",
        keyFeatures: `<ul>
                        <li>.NET Core for cross-platform backend services</li>
                        <li>Entity Framework for ORM and data access</li>
                        <li>ASP.NET Web APIs for enterprise integration</li>
                        <li>Strong type safety and maintainable architecture</li>
                      </ul>`,
        pros: "Stable, enterprise-ready, rich tooling, excellent IDE support.",
        cons: "Windows-centric legacy considerations, learning curve for .NET Core async patterns."
    },
];

class SkillDetails extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
    }

    connectedCallback() {
        // Render the first skill by default on page load
        if (data.length > 0) {
            this.renderData([data[0]]);
        }
        super.connectedCallback();

        // Subscribe to selected skill
        subscribeSelectedSkill(selectedSkill => {
            if (!selectedSkill) {
                console.log('[SkillDetails] No skill selected');
                this.renderData([]); // clear
                return;
            }
            console.log('[SkillDetails] Selected skill:', selectedSkill);

            const skill = data.find(s => s.id.toLowerCase() === selectedSkill.id.toLowerCase());
            if (!skill) {
                console.warn('[SkillDetails] Skill not found:', selectedSkill.id);
                this.renderData([]); // clear
                return;
            }
            console.log('[SkillDetails] Rendering skill details for:', skill);

            this.renderData([skill]);
        });
    }

    // Extend the base renderData for tags and keyFeatures only
    renderData(items) {
        super.renderData(items); // populate standard [data-field] fields

        if (!items || items.length === 0) return;

        const skill = items[0];

        // Render tags
        const tagsContainer = this.shadowRoot.querySelector('.skill-details-tags');
        if (tagsContainer && skill.tags?.length) {
            tagsContainer.innerHTML = '';
            skill.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = tag;
                tagsContainer.appendChild(span);
            });
        }

        // Render key features
        const featuresSlot = this.shadowRoot.querySelector('slot[name="keyFeatures"]');
        if (featuresSlot && skill.keyFeatures) {
            const container = document.createElement('div');
            container.innerHTML = skill.keyFeatures;
            featuresSlot.replaceWith(container);
        }
    }
}

customElements.define('skill-details', SkillDetails);
