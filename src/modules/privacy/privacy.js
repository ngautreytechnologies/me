export function consentStep({ checkConsentFn } = {}) {
    return async (ctx, next) => {
        ctx.canLog = checkConsentFn ? checkConsentFn(ctx) : true;
        if (!ctx.canLog) ctx.loggerContext = { log: () => { } };
        return next();
    };
}

export function anonymizationStep({ userIdKey = 'userId' } = {}) {
    return async (ctx, next) => {
        if (ctx[userIdKey]) {
            ctx.anonymousId = crypto.randomUUID();
            ctx.meta = { ...ctx.meta, anonymousId: ctx.anonymousId };
            delete ctx[userIdKey];
        }
        return next();
    };
}

export function piiRedactionStep({ patterns = [] } = {}) {
    const defaultPatterns = [
        { regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, replacement: '[REDACTED_EMAIL]' },
        { regex: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: '[REDACTED_PHONE]' },
        { regex: /\b\d{1,3}(\.\d{1,3}){3}\b/g, replacement: '[REDACTED_IP]' }
    ];
    const allPatterns = patterns.length ? patterns : defaultPatterns;

    function redact(obj) {
        if (typeof obj === 'string') {
            let str = obj;
            for (const p of allPatterns) str = str.replace(p.regex, p.replacement);
            return str;
        } else if (typeof obj === 'object' && obj !== null) {
            const result = Array.isArray(obj) ? [] : {};
            for (const key in obj) result[key] = redact(obj[key]);
            return result;
        }
        return obj;
    }

    return async (ctx, next) => {
        if (ctx.loggerContext && ctx.loggerContext.log) {
            const originalLog = ctx.loggerContext.log.bind(ctx.loggerContext);
            ctx.loggerContext.log = (level, message, logCtx = {}) => {
                const redactedMeta = redact(logCtx.meta || {});
                originalLog(level, message, { ...logCtx, meta: redactedMeta });
            };
        }
        if (ctx.request) ctx.request = redact(ctx.request);
        const result = await next();
        return redact(result);
    };
}

export function differentialPrivacyStep({ numericKeys = [] } = {}) {
    return async (ctx, next) => {
        const result = await next();
        const addNoise = val => val + (Math.random() - 0.5) * 0.1 * val;
        numericKeys.forEach(k => {
            if (result && result[k] !== null && typeof result[k] === 'number') result[k] = addNoise(result[k]);
        });
        return result;
    };
}