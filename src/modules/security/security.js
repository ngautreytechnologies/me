import { isAbortError, ensureAsync } from '../async/async';

/**
 * Escapes HTML entities in a string to prevent XSS
 * @param {string} str - Untrusted st`ring
 * @returns {string} Escaped safe string
 */
export function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


/**
 * Auth middleware for RequestPipeline.
 *
 * @param {Object} opts
 * @param {Function} opts.tokenProvider - (required) async ({ ctx, signal, scopes }) => string | { token, type? }
 * @param {string} [opts.header='Authorization'] - header name to set
 * @param {string} [opts.scheme='Bearer'] - default scheme when tokenProvider returns raw token
 * @param {Array<string>|null} [opts.scopes=null] - optional scopes forwarded to tokenProvider
 * @param {boolean} [opts.allowAnonymous=false] - if true, continue without auth on failure
 * @param {Function|null} [opts.onAuthFailure=null] - optional hook: async ({ err, ctx }) => fallback | false | undefined
 *
 * Behavior:
 * - If ctx.noAuth is truthy, this step is a no-op.
 * - Will call tokenProvider({ ctx, signal: ctx.signal, scopes })
 * - Sets ctx.fetchOptions = { ...ctx.fetchOptions, headers: { ...existingHeaders, [header]: headerValue } }
 */
export function authStep({
    tokenProvider,
    header = 'Authorization',
    scheme = 'Bearer',
    scopes = null,
    allowAnonymous = false,
    onAuthFailure = null
} = {}) {
    if (typeof tokenProvider !== 'function') {
        throw new TypeError('[authStep] tokenProvider function is required');
    }

    const safeTokenProvider = ensureAsync(tokenProvider);
    const safeOnAuthFailure = typeof onAuthFailure === 'function' ? ensureAsync(onAuthFailure) : null;

    return async (ctx, next) => {
        // Respect explicit opt-out
        if (ctx?.noAuth) return next();

        // Abort early if requested
        if (ctx.signal?.aborted) throw new DOMException('Aborted', 'AbortError');

        try {
            // Request token (tokenProvider may use ctx.signal for cancellation)
            const tokenResult = await safeTokenProvider({ ctx, signal: ctx.signal, scopes });

            if (!tokenResult) {
                // No token returned
                if (safeOnAuthFailure) {
                    const fallback = await safeOnAuthFailure({ err: null, ctx });
                    if (fallback) {
                        _applyAuthToCtx(ctx, fallback, header, scheme);
                        return next();
                    }
                }
                if (allowAnonymous) return next();
                throw new Error('[authStep] tokenProvider returned no token');
            }

            _applyAuthToCtx(ctx, tokenResult, header, scheme);

            return next();
        } catch (err) {
            // If aborted, propagate
            if (isAbortError(err)) throw err;

            // Try onAuthFailure callback if present
            if (safeOnAuthFailure) {
                try {
                    const fallback = await safeOnAuthFailure({ err, ctx });
                    if (fallback) {
                        _applyAuthToCtx(ctx, fallback, header, scheme);
                        return next();
                    }
                } catch (hookErr) {
                    // hook threw; prefer original error below
                    console.warn('[authStep] onAuthFailure hook threw', hookErr);
                }
            }

            if (allowAnonymous) {
                return next();
            }

            // Re-throw original auth error for upstream handling (retry, metrics, etc.)
            throw err;
        }
    };
}

/* -------------------------
   Internal helper: apply header safely
   ------------------------- */
function _applyAuthToCtx(ctx, tokenResult, headerName, defaultScheme) {
    // Normalize tokenResult -> headerValue string
    let headerValue = null;

    if (typeof tokenResult === 'string') {
        // token string provided — apply scheme
        headerValue = `${defaultScheme} ${tokenResult}`;
    } else if (tokenResult && typeof tokenResult === 'object') {
        if (tokenResult.token) {
            const t = tokenResult.type ?? defaultScheme;
            headerValue = `${t} ${tokenResult.token}`;
        } else if (tokenResult.header && typeof tokenResult.header === 'string') {
            // Allow provider to hand full header string: { header: 'X apikey ...' }
            headerValue = tokenResult.header;
        }
    }

    if (!headerValue) {
        // nothing to apply
        return;
    }

    // Ensure ctx.fetchOptions and headers exist (do not mutate original header object)
    ctx.fetchOptions = ctx.fetchOptions || {};
    const existingHeaders = ctx.fetchOptions.headers || {};

    // Normalize header names: keep as provided (headerName)
    const newHeaders = { ...existingHeaders, [headerName]: headerValue };
    ctx.fetchOptions = { ...ctx.fetchOptions, headers: newHeaders };
}
