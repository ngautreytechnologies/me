/**
 * Load stories from browser localStorage
 * @returns {Array<object>|null} Cached stories or null
 */
export function loadFromStorage() {
    try {
        const raw = localStorage.getItem(Config.STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null; // LocalStorage disabled or corrupted
    }
}

/**
 * Save stories into localStorage
 * @param {Array<object>} data - Stories array
 * @returns {void}
 */
export function saveToStorage(data) {
    try {
        localStorage.setItem(Config.STORAGE_KEY, JSON.stringify(data));
    } catch {
        // Ignore storage errors (quota exceeded, private mode, etc.)
    }
}
