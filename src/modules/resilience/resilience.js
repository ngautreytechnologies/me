/**
 * Throttles a function to limit how often it can be called.
 * @param {*} fn 
 * @param {*} limit 
 * @returns function
 */
export const throttle = (fn, limit) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

/**
 * Wraps a promise in a timeout, aborting if exceeded
 * @template T
 * @param {Promise<T>} promise - Promise to monitor
 * @param {number} ms - Timeout in ms
 * @returns {Promise<T>} Promise that rejects if timed out
 */
export function withTimeout(promise, ms) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ms);
    return promise.finally(() => clearTimeout(timeout));
}

export function retryStep({ retries = 3, delayMs = 200 }) {
    return async (ctx, next) => {
        let attempt = 0;
        while (attempt <= retries) {
            try { return await next(); }
            catch (err) {
                attempt++;
                if (attempt > retries) throw err;
                await new Promise(res => setTimeout(res, delayMs * Math.pow(2, attempt)));
            }
        }
    };
}
