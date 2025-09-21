class Utils {
    /**
     * Escapes HTML entities in a string to prevent XSS
     * @param {string} str - Untrusted st`ring
     * @returns {string} Escaped safe string
     */
    static escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    /**
     * Wraps a promise in a timeout, aborting if exceeded
     * @template T
     * @param {Promise<T>} promise - Promise to monitor
     * @param {number} ms - Timeout in ms
     * @returns {Promise<T>} Promise that rejects if timed out
     */
    static withTimeout(promise, ms) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), ms);
        return promise.finally(() => clearTimeout(timeout));
    }

    /**
     * Fetch JSON with retries and timeout
     * @param {string} url - Resource URL
     * @param {number} retries - Remaining retries
     * @returns {Promise<object|null>} Parsed JSON or null on failure
     */
    static async fetchJson(url, retries = Config.MAX_RETRIES) {
        try {   
            const response = await Utils.withTimeout(
                fetch(url, { signal: (new AbortController()).signal }),
                Config.FETCH_TIMEOUT
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (err) {
            if (retries > 0) {
                console.warn(`Retrying fetch: ${url} (${retries} left)`, err);
                return Utils.fetchJson(url, retries - 1);
            }
            console.error("Fetch failed:", url, err);
            return null;
        }
    }

    /**
     * Load stories from browser localStorage
     * @returns {Array<object>|null} Cached stories or null
     */
    static loadFromStorage() {
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
    static saveToStorage(data) {
        try {
            localStorage.setItem(Config.STORAGE_KEY, JSON.stringify(data));
        } catch {
            // Ignore storage errors (quota exceeded, private mode, etc.)
        }
    }
}