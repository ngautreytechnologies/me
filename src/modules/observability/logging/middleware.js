/**
 * logStep middleware
 * @param {Object} options
 * @param {Logger|console} options.logger
 * @param {'debug'|'info'|'warn'|'error'} options.level
 * @param {function} options.redact - function to redact sensitive info from ctx
 */
export function logStep({
  logger = console,
  level = 'debug',
  redact = (obj) => obj,
} = {}) {
  return async (ctx, next) => {
    const log = logger.createContext?.(ctx.correlationId) ?? logger;
    const action = ctx.action ?? ctx.url ?? '<unknown>';

    // --- log start ---
    try {
      log[level]?.('[logStep] start', {
        action,
        ctx: redact({ action: ctx.action, url: ctx.url }),
      });
    } catch (e) {
      log.error?.('[logStep] start logging failed', { error: e });
    }

    let result;
    try {
      result = await next();
    } catch (err) {
      try {
        log.error?.('[logStep] error', { action, error: err });
      } catch (e) {
        log.error?.('[logStep] error logging failed', { error: e });
      }
      throw err;
    }

    // --- log end ---
    try {
      log[level]?.('[logStep] end', {
        action,
        resultSize: Array.isArray(ctx.result) ? ctx.result.length : undefined,
      });
    } catch (e) {
      log.error?.('[logStep] end logging failed', { error: e });
    }

    return result;
  };
}
