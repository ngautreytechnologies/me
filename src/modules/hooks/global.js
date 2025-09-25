export default function attachGlobalHooks(pipelines) {
    const { networkPipeline, interactionPipeline, storagePipeline } = pipelines;

    if (!networkPipeline || !interactionPipeline || !storagePipeline) {
        throw new Error("attachGlobalHooks requires all pipeline instances");
    }

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const [input, init] = args;
        const ctx = {
            url: typeof input === 'string' ? input : input.url,
            request: init || {},
            action: 'fetch',
            userConsent: true,
            correlationId: crypto?.randomUUID?.() || Date.now().toString(),
        };

        const result = await networkPipeline.execute(ctx);
        if (result?.response) return result.response;
        return originalFetch(...args);
    };

    document.addEventListener('click', async e => {
        const ctx = {
            action: 'click',
            element: e.target,
            url: window.location.href,
            userConsent: true,
            correlationId: crypto?.randomUUID?.() || Date.now().toString(),
        };
        await interactionPipeline.execute(ctx);
    });

    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
        const ctx = {
            action: 'storage-set',
            key,
            value,
            userConsent: true,
            correlationId: crypto?.randomUUID?.() || Date.now().toString(),
        };
        storagePipeline.execute(ctx); // fire-and-forget
        return originalSetItem.call(localStorage, key, value);
    };

    const originalGetItem = localStorage.getItem;
    localStorage.getItem = key => {
        const ctx = {
            action: 'storage-get',
            key,
            userConsent: true,
            correlationId: crypto?.randomUUID?.() || Date.now().toString(),
        };
        storagePipeline.execute(ctx);
        return originalGetItem.call(localStorage, key);
    };
}
