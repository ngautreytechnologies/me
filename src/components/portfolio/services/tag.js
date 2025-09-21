// tagTreeRenderer.js
import { Config } from './config.js';
import { ProjectRenderer } from './projectRenderer.js';

export class TagTreeRenderer {
    static createTree(container, nodes) {
        const fragment = document.createDocumentFragment();

        nodes.forEach(node => {
            const skillNode = document.createElement("div");
            skillNode.className = "skill-node";

            const badge = document.createElement("span");
            badge.className = "tag-badge";
            badge.textContent = node.name;
            badge.title = `${node.summary || ""}\n${node.problem || ""}\n${node.solution || ""}`;
            skillNode.appendChild(badge);

            if (!node.children?.length) badge.addEventListener("click", () => ProjectRenderer.renderProjectsForTag(node.name));
            if (node.children?.length) {
                const childrenContainer = document.createElement("div");
                childrenContainer.className = "children";
                this.createTree(childrenContainer, node.children);
                skillNode.appendChild(childrenContainer);
                badge.addEventListener("click", () => skillNode.classList.toggle("expanded"));
            }

            fragment.appendChild(skillNode);
        });

        container.appendChild(fragment);
    }

    static render() {
        const container = document.getElementById("skill-tree");
        if (!container) return;
        container.textContent = "";
        this.createTree(container, Config.TAG_HIERARCHY.tags);
    }
}
