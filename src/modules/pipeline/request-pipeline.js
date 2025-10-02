export class RequestPipeline {
    constructor() {
        this.steps = [];
    }

    use(step) {
        this.steps.push(step);
        return this;
    }

    /**
     * Executes the pipeline with a mandatory finalFn
     * @param {object} ctx - context object passed to all steps
     * @param {function} finalFn - async function called after all steps
     */
    async execute(ctx, finalFn) {
        let idx = -1;

        const runner = async (i) => {
            if (i <= idx) throw new Error('next() called multiple times');
            idx = i;

            const step = this.steps[i];
            if (step) {
                // call the current step, pass ctx and next
                return step(ctx, () => runner(i + 1));
            } else if (finalFn) {
                // call the final function after all steps
                return finalFn();
            } else {
                return undefined;
            }
        };

        return runner(0);
    }
}
