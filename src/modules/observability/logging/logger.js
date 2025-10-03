
// --- Contextual Logger class ---
export class Logger {
  constructor({ level = 'info', output = console } = {}) {
    this.level = level;
    this.output = output;
    this.levels = ['debug', 'info', 'warn', 'error'];
  }

  shouldLog(level) {
    return this.levels.indexOf(level) >= this.levels.indexOf(this.level);
  }

  formatEntry(level, message, { meta, correlationId, error } = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      correlationId: correlationId || null,
      message,
      meta: meta || null,
    };
    if (error instanceof Error) {
      entry.error = { message: error.message, stack: error.stack };
    }
    return JSON.stringify(entry);
  }

  log(level, message, opts = {}) {
    if (!this.shouldLog(level)) return;
    const entry = this.formatEntry(level, message, opts);
    try {
      const writer = this.output[level] || this.output.log;
      writer.call(this.output, entry);
    } catch (err) {
      console.error('[Logger] Failed to write log entry:', entry, err);
    }
  }

  debug(message, opts = {}) { this.log('debug', message, opts); }
  info(message, opts = {}) { this.log('info', message, opts); }
  warn(message, opts = {}) { this.log('warn', message, opts); }
  error(message, opts = {}) { this.log('error', message, opts); }

  createContext(correlationId) {
    return this.levels.reduce((ctxLogger, level) => {
      ctxLogger[level] = (message, opts = {}) =>
        this.log(level, message, { ...opts, correlationId });
      return ctxLogger;
    }, {});
  }
}
  