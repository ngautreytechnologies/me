export class RequestPipeline {
    constructor() {
        this.steps = [];
    }

    use(step) {
        this.steps.push(step);
        return this;
    }

    async execute(ctx) {
        let idx = -1;
        const next = async () => {
            idx++;
            if (idx < this.steps.length) return this.steps[idx](ctx, next);
        };
        return next();
    }
}
