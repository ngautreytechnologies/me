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