export function ttlStep({ storage, keyFn, ttlMs }) {
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