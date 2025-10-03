export const safeStructuredClone = (obj) => {
    if (typeof structuredClone === 'function') {
        try { return structuredClone(obj); } catch (e) { /* fallback */ }
    }
    try { return JSON.parse(JSON.stringify(obj)); } catch (e) { return null; }
};
