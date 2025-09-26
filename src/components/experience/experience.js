import BaseShadowComponent from '../base-shadow-component';

import css from './experience.css';
import templateHtml from './experience.html'; // optional template file

const data = [
    {
        title: "Founder & Architect",
        company: "DendriFlow (Open-Source Software Venture)",
        period: "Jul 2025 - Present",
        description: `
            <p>I have initiated DendriFlow, an experimental development tool and AI automation platform designed to adapt to individual needs.</p>
            <p>I will apply UNIX design philosophies to create developer-friendly abstractions for AI-driven workflows. This includes a declarative YAML configuration, a focus on local-first data privacy, and reflective learning tools.</p>
            <p>DendriFlow will be a polyglot system that integrates multiple programming languages and frameworks, emphasizing flexible architecture and composability for seamless workflow integration.</p>
            <p>Currently, the project is in early development with a focus on core architecture and foundational features.</p>
        `
    },
    {
        title: "Principal Software Engineer",
        company: "Alchem Technologies Ltd",
        period: "Mar 2024 - July 2025",
        description: `
            <p>Leading solution architecture and software development initiatives using Python and design patterns. Providing platform and architectural guidance to drive technical excellence and innovation.</p>
            <p>Focusing on scalable system design and mentoring engineering teams to adopt best practices in software architecture and development methodologies.</p>
        `
    },
    {
        title: "Principal Software Developer",
        company: "E-bate Limited",
        period: "Sep 2022 - Mar 2024",
        description: `
            <p>Contributed to project planning by providing platform and architectural guidance. Led analysis and design of solutions that resulted in better quality software, increased customer satisfaction, and enhanced team knowledge.</p>
            <p>Spearheaded innovation by re-architecting platform elements, improving security, reliability, scalability, and performance. Created DevOps tools that reduced tenant onboarding and migration time, helping secure new customers and increasing business revenue.</p>
            <p>Mentored team members and established coding standards and guidelines, reducing knowledge silos and improving workload distribution across the engineering organization.</p>
        `
    },
    {
        title: "Senior Software Developer",
        company: "E-bate Limited",
        period: "Nov 2021 - Sep 2022",
        description: `
            <p>Designed and developed new features focusing on clean code principles and unit testing best practices using .NET and C#. Led a rapid response team for analyzing and fixing critical business defects.</p>
            <p>Created sample and template projects that increased developer productivity and set architectural standards for future microservices. Designed and developed an identity and access management solution that reduced operational overhead and costs.</p>
        `
    },
    {
        title: "Senior Software Engineer",
        company: "Collision Management Systems (CMS)",
        period: "Sep 2020 - Jul 2021",
        description: `
            <p>Designed and developed new features while improving code quality, resulting in increased maintainability, extensibility, and testability. Mentored junior team members by sharing knowledge and best practices.</p>
            <p>Implemented complex data ingestion requirements for new and existing customers. Conducted knowledge-sharing sessions that improved team synergy and increased overall software quality standards.</p>
        `
    },
    {
        title: "Software Engineer",
        company: "Intamac Systems",
        period: "Apr 2016 - Mar 2020",
        description: `
            <p>Designed and developed new features for the IoT platform, involving refactoring and retrofitting unit tests that significantly reduced bug rates and improved code maintainability. Contributed to platform re-architecture by designing and implementing cloud solutions on AWS.</p>
            <p>Led legacy system migrations from VB6/VB.Net to C#, and researched technology choices for the new platform. Developed microservices and established best practices, including design and development of a new image and video storage solution using AWS that achieved scalability, reliability, and high availability.</p>
        `
    }
];

class Experience extends BaseShadowComponent {
    constructor() {
        super(templateHtml, css);
    }

    connectedCallback() {
        super.connectedCallback();
        super.triggerTemplateRender(data);
    }

    renderTemplateData(items, containerSelector = '[data-container]') {
        // Call parent method first
        super.renderTemplateData(items, container);

        // Then handle custom rendering (slot replacement)
        const container = this.root.querySelector('[data-container]');
        if (!container) return;

        const itemElements = container.querySelectorAll('.experience-item');

        items.forEach((item, index) => {
            const el = itemElements[index];
            if (!el) return;

            if (item.description) {
                const descEl = document.createElement('div');
                descEl.className = 'education-description';
                descEl.innerHTML = item.description;

                const slot = el.querySelector('slot[name="description"]');
                if (slot) {
                    console.log(`Replacing slot with description for item at index ${index}`);
                    slot.replaceWith(descEl);
                    console.log(`Slot replaced successfully for item at index ${index}`);
                } else {
                    console.warn(`No slot found to replace for item at index ${index}`);
                }
            }
        });
    }
}

customElements.define('experience-timeline', Experience);
