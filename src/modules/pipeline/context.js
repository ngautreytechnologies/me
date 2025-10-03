// middleware/validateCtxStep.js
export function validateCtxStep(required = []) {
    if (!Array.isArray(required)) required = [];

    return async (ctx, next) => {
        for (const key of required) {
            if (!(key in ctx) || ctx[key] === undefined || ctx[key] === null || ctx[key] === '') {
                throw new Error(`[validateCtxStep] Missing required context field: ${key}`);
            }
        }
        return next();
    };
}
