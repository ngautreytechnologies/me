/**
 * createSignal
 * ------------
 * Returns a reactive [getter, setter, subscribe] tuple
 */
export function createSignal(initialValue) {
    let value = initialValue;
    const subscribers = new Set();

    return [
        // getter
        () => value,
        // setter
        newValue => {
            if (newValue !== value) {
                value = newValue;
                subscribers.forEach(fn => fn(value));
            }
        },
        // subscribe
        fn => {
            subscribers.add(fn);
            fn(value); // initial call
            return () => subscribers.delete(fn);
        }
    ];
}
