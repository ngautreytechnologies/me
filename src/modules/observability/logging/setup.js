let patched = false;

/**
 * Enable structured JSON logging globally for console.*
 * @param {object} options
 * @param {boolean} [options.verbose=false] - Enable patching if true
 * @param {() => string} [options.getCorrelationId] - Optional correlation ID function
 */
export function enableVerboseConsole({ verbose = false, getCorrelationId } = {}) {
    if (!verbose || patched) return;
    patched = true;

    const levels = ['log', 'debug', 'info', 'warn', 'error'];
    const _origLog = console.log;
    const _origError = console.error;

    levels.forEach((lvl) => {
        const level = lvl;
        const original = {
            log: _origLog,
            debug: _origLog,
            info: _origLog,
            warn: _origError,
            error: _origError,
        }[level];

        console[level] = (...args) => {
            try {
                const timestamp = new Date().toISOString();
                const correlationId = typeof getCorrelationId === 'function' ? getCorrelationId() : null;

                let message = args[0];
                let error;
                if (message instanceof Error) {
                    error = message;
                    message = message.message;
                } else if (args[1] instanceof Error) {
                    error = args[1];
                }

                const meta = args.slice(1).filter(a => a !== error);

                const entry = {
                    timestamp,
                    level: level.toUpperCase(),
                    correlationId,
                    message: typeof message === 'string' ? message : JSON.stringify(message),
                    meta: meta.length ? meta : undefined,
                };

                if (error) {
                    entry.error = { message: error.message, stack: error.stack };
                }

                original.call(console, JSON.stringify(entry));
            } catch (e) {
                _origError.call(console, '[VerboseConsoleError]', e);
            }
        };
    });
}
