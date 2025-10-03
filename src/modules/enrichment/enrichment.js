// middleware/enricherStep.js
/**
 * Adds loggerContext.log that merges enrichers' metadata before logging.
 * logger: optional object with createContext(id) -> { log(level, msg, meta) } OR just a logger with methods.
 * enrichers: array of (meta, ctx) => (object|Promise<object>)
 */
export function enricherStep(logger = null, enrichers = []) {
  if (!Array.isArray(enrichers)) enrichers = [];

  const callEnrichers = async (meta, ctx) => {
    let out = { ...(meta || {}) };
    for (const enr of enrichers) {
      try {
        const add = await Promise.resolve(enr(out, ctx));
        if (add && typeof add === 'object') out = { ...out, ...add };
      } catch (e) {
        console.warn('[enricherStep] enricher failed', e);
      }
    }
    return out;
  };

  return async (ctx, next) => {
    // create loggerContext lazily
    if (!ctx.loggerContext) {
      if (logger && typeof logger.createContext === 'function') {
        ctx.loggerContext = logger.createContext?.(ctx.correlationId) ?? {};
      } else {
        // minimal loggerContext wrapper
        ctx.loggerContext = {
          log: (level, message, meta = {}) => {
            try {
              if (console && typeof console[level] === 'function') {
                console[level](message, meta);
              } else {
                console.log(message, meta);
              }
            } catch (e) { /* ignore logging errors */ }
          }
        };
      }
    }

    // wrap existing log function exactly once
    if (!ctx.loggerContext.__enricherWrapped) {
      const originalLog = ctx.loggerContext.log?.bind(ctx.loggerContext) ?? ((lvl, msg, meta = {}) => {
        if (console && typeof console[lvl] === 'function') console[lvl](msg, meta); else console.log(msg, meta);
      });

      ctx.loggerContext.log = async (level, message, logCtx = {}) => {
        // compute merged meta
        const baseMeta = { ...(logCtx.meta || {}), ...(ctx.meta || {}) };
        const enriched = await callEnrichers(baseMeta, ctx);
        try {
          originalLog(level, message, { ...logCtx, meta: enriched });
        } catch (e) {
          console.warn('[enricherStep] logging failed', e);
        }
      };

      ctx.loggerContext.__enricherWrapped = true;
    }

    return next();
  };
}


/**
 * Adds a correlation ID if one exists in `ctx` (or generates a fallback UUID).
 * Useful for distributed tracing or cross-service request tracking.
 *
 * @param {Object} [options]
 * @param {boolean} [options.generateIfMissing=true] - Whether to generate a new ID if none exists.
 * @returns {(meta: object, ctx: object) => object}
 */
export function correlationIdEnricher({ generateIfMissing = true } = {}) {
    return (_meta = {}, ctx = {}) => {
        let correlationId = ctx.correlationId;

        if (!correlationId && generateIfMissing) {
            try {
                correlationId = crypto?.randomUUID?.() || `cid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            } catch {
                correlationId = `cid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            }
        }

        const enriched = correlationId ? { correlationId } : {};

        try {
            console.debug?.('[correlationIdEnricher] enrichment applied', {
                ctx,
                enriched,
                _meta,
            });
        } catch {
            // ignore logging errors to stay unobtrusive
        }

        return enriched;
    };
}
