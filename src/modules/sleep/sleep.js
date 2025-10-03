export function sleep(ms, { signal } = {}) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));

        const id = setTimeout(() => {
            cleanup();
            resolve();
        }, ms);

        function onAbort() {
            cleanup();
            reject(new DOMException('Aborted', 'AbortError'));
        }

        function cleanup() {
            clearTimeout(id);
            if (signal) signal.removeEventListener('abort', onAbort);
        }

        if (signal) signal.addEventListener('abort', onAbort, { once: true });
    });
}
