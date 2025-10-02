import { escapeHtml } from '../../../../modules/security/security';
import { GitHubClient } from '../../services/github';
import { setSelectedProject } from '../../../../modules/reactivity/signal-store';
import { retryStep } from '../../../../modules/resilience/resilience';
import { cacheInLocalStorage } from '../../../../modules/storage/storage';
import { RequestPipeline } from '../../../../modules/pipeline/request-pipeline';

export class ProjectRenderer {
    /**
     * Render only project cards in a vertical stack.
     * @param {HTMLElement|string} listContainerSelector - Element or selector where project cards should be appended.
     * @param {string[]|string} topics - Topic(s) to filter projects by.
     */
    static async renderProjectsForTopics(listContainerSelector, topics = []) {
        console.group('[ProjectRenderer] 📦 renderProjectsForTopics');

        try {
            // 🔍 Resolve container if selector string passed
            const listContainer =
                typeof listContainerSelector === 'string'
                    ? document.querySelector(listContainerSelector)
                    : listContainerSelector;

            if (!listContainer) {
                console.error('[ProjectRenderer] ❌ Invalid container: not found or null');
                console.groupEnd();
                return;
            }

            // 📄 Find the template
            const template = document.getElementById('project-card-template');
            if (!template) {
                console.error('[ProjectRenderer] ❌ project-card-template not found in DOM');
                console.groupEnd();
                return;
            }

            // 🧹 Reset content
            listContainer.textContent = '';
            listContainer.innerHTML = `<p class="loading">Loading projects...</p>`;

            // 🏷️ Normalise topics input
            if (!Array.isArray(topics)) {
                topics = [topics];
            }
            topics = topics.filter(Boolean);

            console.log('[ProjectRenderer] 🏷️ Topics input:', topics);

            if (topics.length === 0) {
                console.warn('[ProjectRenderer] ⚠️ No topics specified');
                listContainer.innerHTML = `<p class="no-topics">No topics specified.</p>`;
                console.groupEnd();
                return;
            }

            // 🧠 Fetch GitHub repos
            let repos = [];
            try {
                const pipeline = new RequestPipeline([
                    retryStep({ retries: 3, delayMs: 200 }),
                    cacheInLocalStorage({
                        storage: localStorage,
                        keyFn: ctx => ctx.url,
                        ttlMs: 5 * 60 * 1000
                    })
                ]);

                const client = new GitHubClient(pipeline);
                repos = await client.searchRepositoriesByTopics(topics);

                console.log(`[ProjectRenderer] ✅ Fetched ${repos.length} repositories`);
            } catch (err) {
                console.error('[ProjectRenderer] ❌ GitHub fetch failed:', err);
                listContainer.innerHTML = `<p class="error">Error fetching projects from GitHub.</p>`;
                console.groupEnd();
                return;
            }

            // 📭 Handle no results
            if (!repos || repos.length === 0) {
                console.warn('[ProjectRenderer] ⚠️ No projects found for topics:', topics);
                listContainer.innerHTML = `<p class="no-results">No projects found for these topics.</p>`;
                console.groupEnd();
                return;
            }

            // 🛠️ Render cards with DocumentFragment for performance
            console.log('[ProjectRenderer] 🛠️ Rendering project cards...');
            listContainer.innerHTML = ''; // clear loading message

            const fragment = document.createDocumentFragment();

            repos.forEach((repo, index) => {
                console.log(`[ProjectRenderer] 📁 Rendering project #${index + 1}:`, repo.name);

                // Clone template
                const card = template.content.cloneNode(true);
                const cardEl = card.querySelector('.project-card');

                // Fill title and summary
                const titleEl = cardEl.querySelector('.project-title');
                const summaryEl = cardEl.querySelector('.project-summary');
                if (titleEl) titleEl.textContent = repo.name;
                if (summaryEl) summaryEl.textContent = repo.description || 'No description provided.';

                // 🏷️ Stars badge
                const starsEl = cardEl.querySelector('.badge-stars');
                if (starsEl) starsEl.textContent = `★ ${repo.stargazers_count || 0}`;

                // 📦 Project type badge (simple logic - you can make this smarter)
                const codeBadge = cardEl.querySelector('.badge-code');
                const portfolioBadge = cardEl.querySelector('.badge-portfolio');

                const isPortfolio = repo.topics?.includes('portfolio');
                if (isPortfolio && portfolioBadge) {
                    portfolioBadge.style.display = 'inline-block';
                } else if (portfolioBadge) {
                    portfolioBadge.style.display = 'none';
                }

                if (!isPortfolio && codeBadge) {
                    codeBadge.style.display = 'inline-block';
                } else if (codeBadge) {
                    codeBadge.style.display = 'none';
                }

                // 🖱️ Add click listener
                cardEl.addEventListener('click', () => {
                    console.log('[ProjectRenderer] 📍 Project selected:', repo.name);
                    setSelectedProject({
                        username: repo.owner?.login,
                        repo: repo.name,
                        file: 'story.json'
                    });
                });

                fragment.appendChild(card);
            });

            listContainer.appendChild(fragment);
            console.log('[ProjectRenderer] ✅ All projects rendered successfully');
        } catch (fatalErr) {
            console.error('[ProjectRenderer] 💥 Fatal error in renderProjectsForTopics:', fatalErr);
            if (listContainerSelector) {
                const container =
                    typeof listContainerSelector === 'string'
                        ? document.querySelector(listContainerSelector)
                        : listContainerSelector;
                if (container) {
                    container.innerHTML = `<p class="error">Something went wrong rendering projects.</p>`;
                }
            }
        } finally {
            console.groupEnd();
        }
    }
}
