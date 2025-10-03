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
    }

    /**
     * Render a single repository card from repo data.
     * @param {object} repo - Repository data object.
     * @returns {DocumentFragment}
     */
    render(repo) {
        const cardFragment = this.#template.content.cloneNode(true);
        const cardEl = cardFragment.querySelector('.project-card');
        if (!cardEl) return cardFragment; // Defensive fallback

        const titleEl = cardEl.querySelector('.project-title');
        const summaryEl = cardEl.querySelector('.project-summary');
        const starsEl = cardEl.querySelector('.badge-stars');
        const codeBadge = cardEl.querySelector('.badge-code');
        const portfolioBadge = cardEl.querySelector('.badge-portfolio');

        if (titleEl) titleEl.textContent = repo.name ?? 'Untitled Project';
        if (summaryEl) summaryEl.textContent = repo.description || 'No description provided.';
        if (starsEl) starsEl.textContent = `★ ${repo.stargazers_count ?? 0}`;

        const isPortfolio = repo.topics?.includes('portfolio') ?? false;
        if (portfolioBadge) portfolioBadge.style.display = isPortfolio ? 'inline-block' : 'none';
        if (codeBadge) codeBadge.style.display = !isPortfolio ? 'inline-block' : 'none';

        return cardFragment;
    }
}
