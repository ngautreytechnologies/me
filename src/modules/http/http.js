import { Config } from "../../config";
import { withTimeout } from "../resilience/resilience";

/**
 * Fetch JSON with retries and timeout
 * @param {string} url - Resource URL
 * @param {number} retries - Remaining retries
 * @returns {Promise<object|null>} Parsed JSON or null on failure
 */
export async function fetchJson(url, retries = Config.MAX_RETRIES) {
    try {
        const response = await withTimeout(
            fetch(url, { signal: (new AbortController()).signal }),
            Config.FETCH_TIMEOUT
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (err) {
        if (retries > 0) {
            console.warn(`Retrying fetch: ${url} (${retries} left)`, err);
            return fetchJson(url, retries - 1);
        }
        console.error("Fetch failed:", url, err);
        return null;
    }
}
