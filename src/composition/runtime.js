function mergeArraysByName(baseArray = [], scoreArray = []) {
    return baseArray.map(item => {
        const override = (scoreArray || []).find(s => s.name === item.name);
        // shallow merge: metadata/options from score override base
        return override ? { ...item, ...override, options: { ...(item.options || {}), ...(override.options || {}) } } : item;
    });
}

function applyScore(base, score) {
    const active = { ...base };
    for (const section of Object.keys(score.orchestral)) {
        if (!Array.isArray(base[section])) continue;
        active[section] = mergeArraysByName(base[section], score.orchestral[section]);
    }
    // attach ai/expts/meta
    active.meta = score.meta;
    active.ai = score.ai;
    active.experiments = score.experiments;

    return active;
}

// usage
// const runtimeConfig = applyScore(baseConfig, score);
// container.register(runtimeConfig);
