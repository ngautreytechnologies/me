// utils.js
import { Config } from './config.js';

export class Utils {
    static escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    static withTimeout(promise, ms) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), ms);
        return promise.finally(() => clearTimeout(timeout));
    }

    static async fetchJson(url, retries = Config.MAX_RETRIES) {
        try {
            const response = await Utils.withTimeout(fetch(url, { signal: (new AbortController()).signal }), Config.FETCH_TIMEOUT);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (err) {
            if (retries > 0) return Utils.fetchJson(url, retries - 1);
            console.error("Fetch failed:", url, err);
            return null;
        }
    }

    static loadFromStorage() {
        try { return JSON.parse(localStorage.getItem(Config.STORAGE_KEY)); } catch { return null; }
    }

    static saveToStorage(data) {
        try { localStorage.setItem(Config.STORAGE_KEY, JSON.stringify(data)); } catch { }
    }
}
