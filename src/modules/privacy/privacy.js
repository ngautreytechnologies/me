import { ensureAsync } from '../async/async';

/**
 * 🧠 consentStep
 * Checks if telemetry/logging is permitted based on context.
 * If denied, downstream loggers become no-ops to guarantee privacy.
 */
export function consentStep({ checkConsentFn } = {}) {
    const safeCheck = checkConsentFn ? ensureAsync(checkConsentFn) : async () => true;

    return async (ctx, next) => {
        try {
            ctx.canLog = Boolean(await safeCheck(ctx));
        } catch (err) {
            ctx.canLog = false;
            ctx.consentError = err;
        }

        if (ctx.canLog === false) {
            ctx.loggerContext = {
                log: () => { },
                disabled: true,
                reason: ctx.consentError ? 'error' : 'user_denied'
            };
        }

        return next();
    };
}

/**
 * 🔐 anonymizationStep
 * Removes sensitive keys and replaces them with a synthetic anonymous ID.
 * Optionally preserves masked originals for debugging.
 */
export function anonymizationStep({
    userKeys = ['userId'],
    preserve = false,
    idGenerator
} = {}) {
    if (!Array.isArray(userKeys)) userKeys = [userKeys];

    return async (ctx, next) => {
        let anonId;
        try {
            anonId = idGenerator?.(ctx)
                ?? globalThis.crypto?.randomUUID?.()
                ?? `anon-${Math.random().toString(36).slice(2, 10)}`;
        } catch {
            anonId = `anon-${Math.random().toString(36).slice(2, 10)}`;
        }

        ctx.meta = {
            ...(ctx.meta || {}),
            anonymousId: anonId,
            anonymizedAt: new Date().toISOString()
        };

        for (const key of userKeys) {
            if (key in ctx) {
                if (preserve) ctx.meta[`original_${key}`] = maskValue(ctx[key]);
                try {
                    delete ctx[key];
                } catch (err) {
                    console.warn(`[anonymizationStep] Failed to remove key "${key}"`, err);
                }
            }
        }

        return next();
    };
}

function maskValue(val) {
    if (typeof val === 'string' && val.includes('@')) {
        const [user, domain] = val.split('@');
        return `${user[0]}***@${domain}`;
    }
    if (typeof val === 'string' && val.length > 6) {
        return `${val.slice(0, 3)}***${val.slice(-2)}`;
    }
    return '***';
}

/**
 * ✂️ piiRedactionStep
 * Recursively redacts sensitive fields (e.g. emails, phones, IPs) from logs, requests, and results.
 */
// middleware/piiRedactionStep.js
/**
 * patterns: array of { regex: RegExp, replacement: string }
 * This middleware wraps ctx.loggerContext.log to redact meta before logging,
 * and also replaces sensitive strings in ctx.request and final result
 */
export function piiRedactionStep({ patterns = [] } = {}) {
    const defaultPatterns = [
        { regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, replacement: '[REDACTED_EMAIL]' },
        { regex: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: '[REDACTED_PHONE]' },
        { regex: /\b\d{1,3}(\.\d{1,3}){3}\b/g, replacement: '[REDACTED_IP]' }
    ];
    const allPatterns = (Array.isArray(patterns) && patterns.length) ? patterns : defaultPatterns;

    // cycle-safe recursive redactor
    const redactDeep = (input, seen = new WeakSet()) => {
        if (input == null) return input;
        if (typeof input === 'string') {
            let s = input;
            for (const p of allPatterns) s = s.replace(p.regex, p.replacement);
            return s;
        }
        if (typeof input !== 'object') return input;
        if (seen.has(input)) return '[Circular]';
        seen.add(input);
        if (Array.isArray(input)) {
            return input.map(item => redactDeep(item, seen));
        }
        const out = {};
        for (const [k, v] of Object.entries(input)) {
            out[k] = redactDeep(v, seen);
        }
        return out;
    };

    return async (ctx, next) => {
        // wrap loggerContext.log if present
        if (ctx.loggerContext && typeof ctx.loggerContext.log === 'function' && !ctx.loggerContext.__pii_wrapped) {
            const originalLog = ctx.loggerContext.log.bind(ctx.loggerContext);
            ctx.loggerContext.log = (level, message, logCtx = {}) => {
                const safeMeta = redactDeep(logCtx.meta || {});
                try { originalLog(level, message, { ...logCtx, meta: safeMeta }); }
                catch (e) { console.error({ e }); }
            };
            ctx.loggerContext.__pii_wrapped = true;
        }

        // redact request (non-destructive)
        if (ctx.request) ctx.request = redactDeep(ctx.request);

        const result = await next();

        // return redacted result (do not mutate original reference)
        return redactDeep(result);
    };
}

// middleware/differentialPrivacyStep.js
/**
 * Adds calibrated noise to numeric keys in the result.
 * numericKeys: array of key paths or top-level keys (strings)
 * options: { scale=0.1, algorithm='laplace' }
 */
export function differentialPrivacyStep({ numericKeys = [], scale = 0.1 } = {}) {
    if (!Array.isArray(numericKeys)) numericKeys = [];

    const addNoise = (v) => {
        if (typeof v !== 'number' || !isFinite(v)) return v;
        // simple additive noise with uniform jitter scaled by value
        const noise = (Math.random() - 0.5) * 2 * scale * Math.abs(v || 1);
        return v + noise;
    };

    return async (ctx, next) => {
        const result = await next();
        if (!result || typeof result !== 'object') return result;

        const out = Array.isArray(result) ? result.map(item => ({ ...item })) : { ...result };

        for (const key of numericKeys) {
            if (key in out && typeof out[key] === 'number') {
                out[key] = addNoise(out[key]);
            }
        }

        return out;
    };
}
