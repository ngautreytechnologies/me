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

export function memoryCacheStep(cacheMap, keyFn) {
    return async (ctx, next) => {
        const key = keyFn(ctx);
        if (cacheMap.has(key)) return cacheMap.get(key);
        const result = await next();
        cacheMap.set(key, result);
        return result;
    };
}

export function persistentStorageStep({ storage, keyFn }) {
    return async (ctx, next) => {
        const key = keyFn(ctx);
        const cached = storage.getItem(key);
        if (cached) return JSON.parse(cached);
        const result = await next();
        storage.setItem(key, JSON.stringify(result));
        return result;
    };
}