import { safeStructuredClone } from "../data-structures/cloning/cloning";

/**
 * In-memory cache middleware using Map.
 * Stores values as { value, ts, ttl }.
 * Short-circuits pipeline by setting ctx.result & ctx.stop when hit.
 *
 * cacheMap: Map
 * keyFn: (ctx) => string
 * options: { ttlMs: number|null } - if ttlMs null, never expires
 */
export function memoryCacheStep(cacheMap, keyFn, { ttlMs = null } = {}) {
    if (!(cacheMap instanceof Map)) throw new TypeError('cacheMap must be a Map');
    if (typeof keyFn !== 'function') throw new TypeError('keyFn must be a function');

    return async (ctx, next) => {
        const key = keyFn(ctx);
        if (!key) return next();

        try {
            const entry = cacheMap.get(key);
            if (entry) {
                const now = Date.now();
                if (!entry.ttl || (now - entry.ts) < entry.ttl) {
                    ctx.result = safeStructuredClone(entry.value) ?? entry.value;
                    ctx.stop = true;
                    return ctx.result;
                }
                // stale
                cacheMap.delete(key);
            }
        } catch (e) {
            // ignore cache read errors
            console.warn('[memoryCacheStep] cache read failed', e);
        }

        const res = await next();

        try {
            cacheMap.set(key, { value: safeStructuredClone(res) ?? res, ts: Date.now(), ttl: ttlMs || null });
        } catch (e) {
            console.warn('[memoryCacheStep] cache set failed', e);
        }

        return ctx.result ?? res;
    };
}
