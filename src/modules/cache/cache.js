export function memoryCacheStep(cacheMap, keyFn) {
    return async (ctx, next) => {
        const key = keyFn(ctx);
        if (cacheMap.has(key)) return cacheMap.get(key);
        const result = await next();
        cacheMap.set(key, result);
        return result;
    };
}
