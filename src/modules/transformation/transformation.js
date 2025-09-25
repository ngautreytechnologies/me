export function transformStep(transformFn) {
    return async (ctx, next) => {
        const result = await next();
        return transformFn(result, ctx);
    };
}