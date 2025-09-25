export function enricherStep(logger, enrichers = []) {
    return async (ctx, next) => {
        if (!ctx.loggerContext) ctx.loggerContext = logger.createContext?.(ctx.correlationId) || {};

        // fallback log function
        const originalLog = (ctx.loggerContext.log && ctx.loggerContext.log.bind(ctx.loggerContext))
            || ((level, message, logCtx) => {
                console[level] ? console[level](message, logCtx) : console.log(message, logCtx);
            });

        ctx.loggerContext.log = (level, message, logCtx = {}) => {
            let meta = { ...logCtx.meta };
            for (const enricher of enrichers) meta = { ...meta, ...enricher(meta, ctx) };
            originalLog(level, message, { ...logCtx, meta });
        };

        return next();
    };
}
