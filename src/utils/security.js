/**
 * Escapes HTML entities in a string to prevent XSS
 * @param {string} str - Untrusted st`ring
 * @returns {string} Escaped safe string
 */
export function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}