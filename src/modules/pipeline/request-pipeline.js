import { safeStructuredClone } from "../data-structures/cloning/cloning";

/* ---------------------------
   HookDispatcher — single responsibility:
   - event add/remove/emit
   - supports EventTarget and callback hooks
   --------------------------- */
class HookDispatcher {
    constructor() {
        this._events = new EventTarget();
        this.onStart = null;
        this.onStepStart = null;
        this.onStepEnd = null;
        this.onError = null;
        this.onComplete = null;
    }

    on(type, fn) {
        this._events.addEventListener(type, fn);
        return () => this.off(type, fn);
    }
    off(type, fn) { this._events.removeEventListener(type, fn); }

    emit(type, detail = {}) {
        try { this._events.dispatchEvent(new CustomEvent(type, { detail })); } catch (e) { console.error({ e }); }
        // callback hooks (backwards compat)
        try {
            if (type === 'start' && typeof this.onStart === 'function') this.onStart(detail);
            if (type === 'step:start' && typeof this.onStepStart === 'function') this.onStepStart(detail);
            if (type === 'step:end' && typeof this.onStepEnd === 'function') this.onStepEnd(detail);
            if (type === 'error' && typeof this.onError === 'function') this.onError(detail);
            if (type === 'complete' && typeof this.onComplete === 'function') this.onComplete(detail);
        } catch (e) { console.error({ e }); }
    }
}

/* ---------------------------
   Tracer — single responsibility:
   - create trace entries with snapshots/duration
   - push to ctx.trace
   --------------------------- */
class Tracer {
    constructor(snapshots = true) {
        this.snapshots = !!snapshots;
    }

    async record(ctx, stepName, runner) {
        const entry = {
            stepName,
            start: Date.now(),
            durationMs: null,
            status: 'ok',
            inputSnapshot: undefined,
            outputSnapshot: undefined,
            error: undefined
        };

        if (this.snapshots) {
            try { entry.inputSnapshot = safeStructuredClone(ctx); } catch (
            e) { entry.inputSnapshot = '[unserializable]'; console.error({ e }); }
        }

        let result;
        try {
            result = await runner();
            if (this.snapshots) {
                try { entry.outputSnapshot = safeStructuredClone(result); } catch (e) {
                    console.error({ e });
                    entry.outputSnapshot = '[unserializable]';
                }
            }
            entry.status = 'ok';
        } catch (err) {
            entry.status = 'error';
            entry.error = { message: err?.message, name: err?.name, stack: err?.stack };
            entry.durationMs = Date.now() - entry.start;
            // attach trace entry to error for richer diagnostics
            err.pipelineTrace = entry;
            throw err;
        } finally {
            entry.durationMs = entry.durationMs ?? (Date.now() - entry.start);
            ctx.trace = ctx.trace || [];
            ctx.trace.push(entry);
        }

        return result;
    }
}

/* ---------------------------
   AbortManager — single responsibility:
   - create internal AbortController if needed
   - wire timeout to abort
   - return cleanup function
   --------------------------- */
class AbortManager {
    constructor(ctxSignal, timeoutMs) {
        this.externalSignal = ctxSignal;
        this.timeoutMs = Number(timeoutMs) || 0;
        this.internalController = null;
        this.timeoutId = null;
    }

    init() {
        if (this.externalSignal instanceof AbortSignal) {
            // prefer external signal
            return { signal: this.externalSignal, cleanup: () => { } };
        }

        this.internalController = new AbortController();
        const signal = this.internalController.signal;

        if (this.timeoutMs > 0) {
            this.timeoutId = setTimeout(() => this.internalController.abort(), this.timeoutMs);
        }

        if (this.externalSignal && typeof this.externalSignal.addEventListener === 'function') {
            this.externalSignal.addEventListener('abort', () => {
                try { this.internalController.abort(); } catch (e) { console.error({ e }); }
            }, { once: true });
        }

        const cleanup = () => {
            if (this.timeoutId) clearTimeout(this.timeoutId);
            this.timeoutId = null;
        };

        return { signal, cleanup };
    }
}

/* ---------------------------
   ContextFactory — single responsibility:
   - clone incoming ctx and seed required fields
   --------------------------- */
class ContextFactory {
    static create(origCtx = {}, snapshots = true) {
        const ctx = safeStructuredClone(origCtx) || { ...(origCtx || {}) };
        ctx.result = ctx.result === undefined ? undefined : ctx.result;
        ctx.stop = ctx.stop === true;
        ctx.trace = Array.isArray(ctx.trace) ? [...ctx.trace] : [];
        ctx.meta = ctx.meta || {};
        ctx._pipelineStart = Date.now();
        if (!('signal' in ctx)) ctx.signal = undefined;
        ctx._snapshots = snapshots;
        return ctx;
    }
}

/* ---------------------------
   Runner — single responsibility:
   - orchestrates middleware invocation and nested pipelines
   - enforces next() safety
   --------------------------- */
class Runner {
    constructor(steps, tracer, hooks) {
        this.steps = steps || [];
        this.tracer = tracer;
        this.hooks = hooks;
    }

    async run(ctx, finalFn) {
        let index = -1;

        const next = async (i) => {
            if (i <= index) throw new Error('next() called multiple times');
            index = i;

            if (ctx.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
            if (ctx.stop) return ctx.result;

            const step = this.steps[i];
            if (!step) {
                this.hooks.emit('step:start', { ctx, stepName: 'final' });
                const res = await this.tracer.record(ctx, 'final', () => finalFn(ctx));
                this.hooks.emit('step:end', { ctx, stepName: 'final' });
                ctx.result = res;
                return res;
            }

            if (step instanceof RequestPipeline) {
                this.hooks.emit('step:start', { ctx, stepName: step.constructor.name || '<pipeline>' });
                const res = await this.tracer.record(ctx, step.constructor.name || '<pipeline>', () =>
                    step.execute(ctx, finalFn, { timeoutMs: 0, snapshots: ctx._snapshots }).then((nestedCtx) => nestedCtx.result)
                );
                this.hooks.emit('step:end', { ctx, stepName: step.constructor.name || '<pipeline>' });
                ctx.result = ctx.result ?? res;
                return ctx.result;
            }

            if (typeof step === 'function') {
                const stepName = step.name || '<anonymous>';
                this.hooks.emit('step:start', { ctx, stepName });
                const res = await this.tracer.record(ctx, stepName, () => step(ctx, () => next(i + 1)));
                this.hooks.emit('step:end', { ctx, stepName });
                if (typeof res !== 'undefined') ctx.result = res;
                return ctx.result;
            }

            return next(i + 1);
        };

        return next(0);
    }
}

/* ---------------------------
   RequestPipeline — composes the pieces
   --------------------------- */
export class RequestPipeline {
    constructor() {
        this.steps = [];
        this._hooks = new HookDispatcher();

        Object.defineProperty(this, 'onStart', { value: null, writable: true, configurable: true });
        Object.defineProperty(this, 'onStepStart', { value: null, writable: true, configurable: true });
        Object.defineProperty(this, 'onStepEnd', { value: null, writable: true, configurable: true });
        Object.defineProperty(this, 'onError', { value: null, writable: true, configurable: true });
        Object.defineProperty(this, 'onComplete', { value: null, writable: true, configurable: true });
    }

    on(type, fn) { return this._hooks.on(type, fn); }
    off(type, fn) { return this._hooks.off(type, fn); }

    use(step) {
        if (!step) throw new TypeError('[RequestPipeline] step required');
        if (typeof step !== 'function' && !(step instanceof RequestPipeline)) {
            throw new TypeError('[RequestPipeline] step must be function or RequestPipeline');
        }
        this.steps.push(step);
        return this;
    }

    async execute(origCtx = {}, finalFn = async () => undefined, opts = {}) {
        if (typeof finalFn !== 'function') throw new TypeError('[RequestPipeline] finalFn must be a function');
        const { timeoutMs = 0, snapshots = true } = opts;
        const ctx = ContextFactory.create(origCtx, snapshots);

        if (typeof this.onStart === 'function') this._hooks.on('start', this.onStart);
        if (typeof this.onStepStart === 'function') this._hooks.on('step:start', this.onStepStart);
        if (typeof this.onStepEnd === 'function') this._hooks.on('step:end', this.onStepEnd);
        if (typeof this.onError === 'function') this._hooks.on('error', this.onError);
        if (typeof this.onComplete === 'function') this._hooks.on('complete', this.onComplete);

        const tracer = new Tracer(snapshots);
        const abortManager = new AbortManager(ctx.signal, timeoutMs);
        const { signal, cleanup } = abortManager.init();
        ctx.signal = signal;

        this._hooks.emit('start', { ctx, options: { timeoutMs, snapshots } });
        const runner = new Runner(this.steps, tracer, this._hooks);

        try {
            await runner.run(ctx, finalFn);
            this._hooks.emit('complete', { ctx });
            ctx.meta.pipelineDurationMs = Date.now() - ctx._pipelineStart;
            return ctx;
        } catch (err) {
            ctx.meta.pipelineDurationMs = Date.now() - ctx._pipelineStart;
            this._hooks.emit('error', { error: err, ctx, elapsed: ctx.meta.pipelineDurationMs });
            throw err;
        } finally {
            cleanup();
        }
    }

    /**
     * Executes the pipeline and returns ctx.result directly
     * @param {object} origCtx
     * @param {function} finalFn
     * @param {object} opts
     */
    async getResult(origCtx = {}, finalFn = async () => undefined, opts = {}) {
        const ctx = await this.execute(origCtx, finalFn, opts);
        return ctx.result;
    }
}
