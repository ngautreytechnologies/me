/**
 * Enrich metadata with environment information and log context using console
 * @param {Object} meta - existing metadata
 * @param {Object} ctx - optional context to include in logs
 * @returns {Object} metadata including `env`
 */
export function environmentEnricher(meta, ctx = {}) {
    let env = 'browser'; // default

    if (typeof window !== 'undefined') {
        env = 'browser';
    } else if (typeof self !== 'undefined') {
        env = 'web-worker';
    } else if (typeof globalThis !== 'undefined') {
        env = 'node';
    }

    const enriched = { ...meta, env };

    // Use global console for verbose logging (assumes enableVerboseConsole has been called)
    try {
        console.debug?.('[environmentEnricher] enriched metadata', { ctx, enriched });
    } catch { }

    return enriched;
}
