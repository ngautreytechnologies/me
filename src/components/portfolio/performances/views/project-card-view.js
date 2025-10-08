import { setSelectedProject } from '../../../../reactivity'; // adjust path if needed

export class ProjectCardView {
    #template;

    /**
     * @param {HTMLTemplateElement} template - Template for a single project card
     */
    constructor(template) {
        if (!(template instanceof HTMLTemplateElement)) {
            throw new TypeError('[ProjectCardView] template must be an HTMLTemplateElement');
        }
        this.#template = template;
        console.info('[ProjectCardView] Initialized with template:', template.id || '(no id)');
    }

    /**
     * Render a single repository card from repo data.
     * Always clones template; does not remove it from shadow DOM.
     *
     * @param {object} repo - Repository data object.
     * @returns {DocumentFragment} Cloned fragment ready to append
     */
    render(repo = {}) {
        console.group(`[ProjectCardView] Rendering card for: ${repo?.name || 'Unknown Repo'}`);
        console.debug('Repo data:', repo);

        const frag = this.#template.content.cloneNode(true);
        const cardEl = frag.querySelector('.project-card');

        if (!cardEl) {
            console.warn('[ProjectCardView] No .project-card element found in template.');
            console.groupEnd();
            return frag;
        }

        // Bind fields
        this._bindText(cardEl, '.project-title', repo.name ?? 'Untitled Project', 'Title');
        this._bindText(cardEl, '.project-summary', repo.description ?? 'No description provided.', 'Summary');
        this._bindText(cardEl, '.badge-stars', `${repo.stargazers_count ?? 0}`, 'Stars');

        // Badge visibility
        const isPortfolio = repo.topics?.includes('portfolio') ?? false;
        console.debug('Topics:', repo.topics, '| Portfolio:', isPortfolio);
        this._toggleDisplay(cardEl, '.badge-portfolio', isPortfolio, 'Portfolio badge');
        this._toggleDisplay(cardEl, '.badge-code', !isPortfolio, 'Code badge');

        // 🖱️ Attach click handler to set selected project
        cardEl.addEventListener('click', () => {
            console.info('[ProjectCardView] Card clicked — selecting project:', repo.name);
            setSelectedProject(repo); // sets global selected project signal
        });

        console.info(`[ProjectCardView] Rendered card for "${repo.name || 'Unnamed'}"`);
        console.groupEnd();

        return frag;
    }

    _bindText(container, selector, value, label) {
        const el = container.querySelector(selector);
        if (!el) {
            console.warn(`[ProjectCardView] Missing element ${selector}`);
            return;
        }
        el.textContent = value;
        console.debug(`${label}:`, value);
    }

    _toggleDisplay(container, selector, show, label) {
        const el = container.querySelector(selector);
        if (!el) return;
        el.style.display = show ? 'inline-block' : 'none';
        console.debug(`${label} display:`, el.style.display);
    }
}
