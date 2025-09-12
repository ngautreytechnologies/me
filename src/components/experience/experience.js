import BaseComponent from '../base-component.js';
import templateHtml from './experience.html'; // optional template file
import css from './experience.css';

const data = [
    {
        title: "Founder & Architect",
        company: "DendriFlow (Open-Source Software Venture)",
        period: "Jul 2025 - Present",
        description: [
            "I have initiated DendriFlow, an experimental development tool and AI automation platform designed to adapt to individual needs.",
            "I will apply UNIX design philosophies to create developer-friendly abstractions for AI-driven workflows. This includes a declarative YAML configuration, a focus on local-first data privacy, and reflective learning tools.",
            "DendriFlow will be a polyglot system that integrates multiple programming languages and frameworks, emphasizing flexible architecture and composability for seamless workflow integration.",
            "Currently, the project is in early development with a focus on core architecture and foundational features."
        ]
    },
    {
        title: "Principal Software Engineer",
        company: "Alchem Technologies Ltd",
        period: "Mar 2024 - July 2025",
        description: [
            "Leading solution architecture and software development initiatives using Python and design patterns. Providing platform and architectural guidance to drive technical excellence and innovation.",
            "Focusing on scalable system design and mentoring engineering teams to adopt best practices in software architecture and development methodologies."
        ]
    },
    {
        title: "Principal Software Developer",
        company: "E-bate Limited",
        period: "Sep 2022 - Mar 2024",
        description: [
            "Contributed to project planning by providing platform and architectural guidance. Led analysis and design of solutions that resulted in better quality software, increased customer satisfaction, and enhanced team knowledge.",
            "Spearheaded innovation by re-architecting platform elements, improving security, reliability, scalability, and performance. Created DevOps tools that reduced tenant onboarding and migration time, helping secure new customers and increasing business revenue.",
            "Mentored team members and established coding standards and guidelines, reducing knowledge silos and improving workload distribution across the engineering organization."
        ]
    },
    {
        title: "Senior Software Developer",
        company: "E-bate Limited",
        period: "Nov 2021 - Sep 2022",
        description: [
            "Designed and developed new features focusing on clean code principles and unit testing best practices using .NET and C#. Led a rapid response team for analyzing and fixing critical business defects.",
            "Created sample and template projects that increased developer productivity and set architectural standards for future microservices. Designed and developed an identity and access management solution that reduced operational overhead and costs."
        ]
    },
    {
        title: "Senior Software Engineer",
        company: "Collision Management Systems (CMS)",
        period: "Sep 2020 - Jul 2021",
        description: [
            "Designed and developed new features while improving code quality, resulting in increased maintainability, extensibility, and testability. Mentored junior team members by sharing knowledge and best practices.",
            "Implemented complex data ingestion requirements for new and existing customers. Conducted knowledge-sharing sessions that improved team synergy and increased overall software quality standards."
        ]
    },
    {
        title: "Software Engineer",
        company: "Intamac Systems",
        period: "Apr 2016 - Mar 2020",
        description: [
            "Designed and developed new features for the IoT platform, involving refactoring and retrofitting unit tests that significantly reduced bug rates and improved code maintainability. Contributed to platform re-architecture by designing and implementing cloud solutions on AWS.",
            "Led legacy system migrations from VB6/VB.Net to C#, and researched technology choices for the new platform. Developed microservices and established best practices, including design and development of a new image and video storage solution using AWS that achieved scalability, reliability, and high availability."
        ]
    }
];

class ExperienceTimeline extends BaseComponent {
    constructor() {
        super(templateHtml, css);

        // Initialize reactive data
        this.data.set(data);
    }

    connectedCallback() {
        super.connectedCallback();
        this.render();
    }

    render() {
        const container = this.shadow.querySelector('.experience-timeline');
        const templateEl = this.shadow.querySelector('template');
        if (!container || !templateEl) return;

        // Clear previous content
        container.innerHTML = '';

        // Render each experience item
        this.data.get().forEach(exp => {
            const clone = templateEl.content.cloneNode(true);

            // Fill standard fields
            clone.querySelectorAll('[data-field]').forEach(el => {
                const field = el.dataset.field;
                if (exp[field]) el.textContent = exp[field];
            });

            // Fill description paragraphs
            const descEl = clone.querySelector('.description');
            if (descEl && exp.description) {
                descEl.innerHTML = exp.description.map(p => `<p>${p}</p>`).join('');
            }

            container.appendChild(clone);
        });
    }
}

customElements.define('experience-timeline', ExperienceTimeline);
