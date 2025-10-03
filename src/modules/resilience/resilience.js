import { sleep } from '../sleep/sleep';

/**
 * retryStep({ retries, delayMs, backoff, onRetry })
 * Returns a middleware that retries `next()` on error, abort-aware
 */
export function retryStep({ retries = 3, delayMs = 200, backoff = 'exponential', onRetry = null, logger } = {}) {
    if (!Number.isInteger(retries) || retries < 0) {
        throw new TypeError('[retryStep] retries must be a non-negative integer');
    }

    const computeDelay = (attempt) => {
        if (typeof delayMs === 'function') return delayMs(attempt);
        switch (backoff) {
            case 'linear': return delayMs * attempt;
            case 'exponential': return Math.round(delayMs * Math.pow(2, attempt - 1));
            default: return delayMs;
        }
    };

    return async (ctx, next) => {
        let lastErr;
        for (let attempt = 1; attempt <= Math.max(1, retries + 1); attempt++) {
            if (ctx.signal?.aborted) throw new DOMException('Aborted', 'AbortError');

            try {
                const result = await next();
                return result;
            } catch (err) {
                lastErr = err;

                if (err?.name === 'AbortError') throw err;
                if (attempt > retries) break;

                if (logger?.info) logger.info(`retryStep attempt ${attempt} failed`, { err, ctx });

                try { onRetry?.({ attempt, err, ctx }); }
                catch (e) { console.error({ e }); }

                const waitMs = computeDelay(attempt);
                try { await sleep(waitMs, { signal: ctx.signal }); } catch {
                    throw new DOMException('Aborted', 'AbortError');
                }
            }
        }
        throw lastErr;
    };
}

/**
 * throttle(fn, wait, { leading, trailing, onInvoke })
 */
export function throttle(fn, wait, { leading = true, trailing = false, onInvoke } = {}) {
    let lastCall = 0, timeoutId = null, lastArgs = null, lastThis = null;

    const invoke = () => {
        lastCall = Date.now();
        timeoutId = null;
        fn.apply(lastThis, lastArgs);
        if (onInvoke) onInvoke(lastArgs);
        lastArgs = lastThis = null;
    };

    const wrapped = function (...args) {
        const now = Date.now();
        const remaining = wait - (now - lastCall);
        lastThis = this;
        lastArgs = args;

        if (remaining <= 0) {
            if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
            if (leading) invoke();
        } else if (!timeoutId && trailing) {
            timeoutId = setTimeout(invoke, remaining);
        }
    };

    wrapped.cancel = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = null;
        lastArgs = lastThis = null;
    };

    return wrapped;
}

/**
 * withTimeout(promiseOrFactory, ms, { signal, onTimeout, logger })
 * Returns a promise that rejects with AbortError if timeout expires
 */
export function withTimeout(promiseOrFactory, ms, { signal: externalSignal, onTimeout, logger } = {}) {
    return new Promise((resolve, reject) => {
        if (ms <= 0) {
            try {
                const p = typeof promiseOrFactory === 'function'
                    ? promiseOrFactory({ signal: externalSignal })
                    : promiseOrFactory;
                return Promise.resolve(p).then(resolve, reject);
            } catch (e) { return reject(e); }
        }

        const controller = new AbortController();
        const signal = controller.signal;
        let timeoutId = setTimeout(() => {
            try { controller.abort(); } catch (e) { console.error({ e }); }
            try { onTimeout?.(); } catch (e) { console.error({ e }); }
            logger?.warn?.('withTimeout expired', { ms });
        }, ms);

        const onExternalAbort = () => { clearTimeout(timeoutId); controller.abort(); };
        if (externalSignal) {
            if (externalSignal.aborted) return reject(new DOMException('Aborted', 'AbortError'));
            externalSignal.addEventListener('abort', onExternalAbort, { once: true });
        }

        const cleanup = () => {
            clearTimeout(timeoutId);
            if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);
        };

        const finish = (v) => { cleanup(); resolve(v); };
        const fail = (err) => { cleanup(); reject(err); };

        try {
            const p = typeof promiseOrFactory === 'function'
                ? Promise.resolve().then(() => promiseOrFactory({ signal }))
                : Promise.resolve(promiseOrFactory);
            p.then(finish, fail);
        } catch (err) {
            cleanup();
            reject(err);
        }
    });
}
