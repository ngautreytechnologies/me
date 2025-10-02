import { Config } from '../../config'

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


export function persistInLocalStorageStep({ storage, keyFn }) {
    return async (ctx, next) => {
        const key = keyFn(ctx);
        const cached = storage.getItem(key);
        if (cached) return JSON.parse(cached);
        const result = await next();
        storage.setItem(key, JSON.stringify(result));
        return result;
    };
}

export function cacheInLocalStorage({ storage, keyFn, ttlMs }) {
    return async (ctx, next) => {
        const key = keyFn(ctx);
        const cached = storage.getItem(key);
        if (cached) {
            const { timestamp, value } = JSON.parse(cached);
            if (Date.now() - timestamp < ttlMs) return value;
        }
        const result = await next();
        storage.setItem(key, JSON.stringify({ timestamp: Date.now(), value: result }));
        return result;
    };
}