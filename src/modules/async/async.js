/**
 * Ensures a function always returns a Promise.
 * - If the original function is synchronous, its return value is wrapped in `Promise.resolve()`.
 * - If it throws synchronously, the returned Promise rejects.
 * - If it's already async, the Promise is returned as-is.
 */
export function ensureAsync(fn) {
    if (typeof fn !== 'function') {
        throw new TypeError('[ensureAsync] Expected a function');
    }

    return (...args) => {
        try {
            const result = fn(...args);
            return result instanceof Promise ? result : Promise.resolve(result);
        } catch (err) {
            return Promise.reject(err);
        }
    };
}

export function isAbortError(error) {
    return (
        error &&
        (error.name === 'AbortError' ||
            (error instanceof DOMException && error.name === 'AbortError'))
    );
}