export function metricsStep({ reporter = null } = {}) {
    if (reporter && typeof reporter !== 'function') {
        throw new TypeError('[metricsStep] reporter must be a function or null');
    }

    return async (ctx, next) => {
        const start = performance.now();

        const buildMetrics = (status, extra = {}) => ({
            action: ctx.action ?? null,
            url: ctx.url ?? null,
            status,
            duration: Math.round(performance.now() - start),
            resultCount: Array.isArray(ctx.result) ? ctx.result.length : undefined,
            ...extra,
        });

        try {
            const result = await next();

            if (reporter) {
                try {
                    reporter(buildMetrics('ok'));
                } catch (err) {
                    console.warn('[metricsStep] reporter failed during success reporting:', err);
                }
            }

            return result;
        } catch (err) {
            if (reporter) {
                try {
                    reporter(
                        buildMetrics('error', {
                            errorName: err?.name,
                            errorMessage: err?.message,
                        })
                    );
                } catch (e) {
                    console.warn('[metricsStep] reporter failed during error reporting:', e);
                }
            }
            throw err;
        }
    };
}
