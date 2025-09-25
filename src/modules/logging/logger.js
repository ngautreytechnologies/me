export class Logger {
    constructor({ level = 'info', output = console } = {}) {
        this.level = level;
        this.output = output;

        // Define levels in priority order
        this.levels = ['debug', 'info', 'warn', 'error'];
    }

    // --- internal helper ---
    shouldLog(level) {
        return this.levels.indexOf(level) >= this.levels.indexOf(this.level);
    }

    log(level, message, { meta, correlationId } = {}) {
        if (!this.shouldLog(level)) return;

        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            correlationId: correlationId || null,
            message,
            meta: meta || null
        };

        try {
            if (typeof this.output[level] === 'function') {
                this.output[level](JSON.stringify(logEntry));
            } else {
                this.output.log(JSON.stringify(logEntry));
            }
        } catch (err) {
            console.error(JSON.stringify(logEntry), err);
        }
    }

    debug(message, opts = {}) { this.log('debug', message, opts); }
    info(message, opts = {}) { this.log('info', message, opts); }
    warn(message, opts = {}) { this.log('warn', message, opts); }
    error(message, opts = {}) { this.log('error', message, opts); }

    // --- contextual logger ---
    createContext(correlationId) {
        return {
            correlationId,
            debug: (message, opts = {}) =>
                this.log('debug', message, { ...opts, correlationId }),
            info: (message, opts = {}) =>
                this.log('info', message, { ...opts, correlationId }),
            warn: (message, opts = {}) =>
                this.log('warn', message, { ...opts, correlationId }),
            error: (message, opts = {}) =>
                this.log('error', message, { ...opts, correlationId })
        };
    }
}
