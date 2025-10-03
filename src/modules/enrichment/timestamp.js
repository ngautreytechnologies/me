export function timestampEnricher() {
    return (meta = {}, ctx = {}) => ({ timestamp: new Date().toISOString() });
}
