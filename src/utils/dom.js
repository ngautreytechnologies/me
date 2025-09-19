/**
 * Safely define a custom element, ignoring duplicates
 * @param {string} tagName - The tag name to register
 * @param {CustomElementConstructor} elementClass - The class to register
 */
export function defineSafeElement(tagName, elementClass) {
    console.log(`[CustomElements] Attempting to register: <${tagName}>`, elementClass, customElements);

    if (!customElements.get(tagName)) {
        customElements.define(tagName, elementClass);
        console.log(`[CustomElements] Registered: <${tagName}>`);
    } else {
        console.warn(`[CustomElements] <${tagName}> is already defined, skipping.`);
    }
}

export function removeElements(container, except) {
    Array.from(container.children).forEach(child => {
        if (child.tagName.toLowerCase() !== except.toLowerCase()) {
            child.remove();
        }
    });
}
