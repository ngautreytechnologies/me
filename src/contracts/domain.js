/**
 * Abstract Domain class — contract for all domain-level data transformers.
 * 
 * This is NOT meant to be instantiated directly. Subclasses MUST implement
 * the methods below.
 *
 * Each method receives an array of plain JS objects (data) and returns
 * a transformed array (or enriched array).
 *
 * Typical pipeline in composer:
 *   validate -> transform -> deduplicate -> filter -> enrich -> score -> sort -> annotate
 */
export class Domain {
    constructor() {
        if (new.target === Domain) {
            throw new TypeError("Cannot instantiate abstract Domain class directly");
        }
    }

    /**
     * Validate incoming data shape and filter out invalid items.
     * @param {Array<object>} data
     * @returns {Array<object>} validated data
     */
    validate(data) {
        throw new Error("validate() must be implemented in subclass");
    }

    /**
     * Transform data into canonical form (normalize fields, trim strings, etc.)
     * @param {Array<object>} data
     * @returns {Array<object>} transformed data
     */
    transform(data) {
        throw new Error("transform() must be implemented in subclass");
    }

    /**
     * Deduplicate items by unique key/id.
     * @param {Array<object>} data
     * @returns {Array<object>} deduplicated data
     */
    deduplicate(data) {
        throw new Error("deduplicate() must be implemented in subclass");
    }

    /**
     * Filter data according to business rules.
     * @param {Array<object>} data
     * @returns {Array<object>} filtered data
     */
    filter(data) {
        throw new Error("filter() must be implemented in subclass");
    }

    /**
     * Enrich data with computed properties, metadata, derived fields.
     * @param {Array<object>} data
     * @returns {Array<object>} enriched data
     */
    enrich(data) {
        throw new Error("enrich() must be implemented in subclass");
    }

    /**
     * Score each item numerically (optional).
     * @param {Array<object>} data
     * @returns {Array<object>} scored data
     */
    score(data) {
        throw new Error("score() must be implemented in subclass");
    }

    /**
     * Sort data by one or more criteria (optional).
     * @param {Array<object>} data
     * @param {Object} [opts]
     * @param {string} [opts.by] - field to sort by
     * @param {'asc'|'desc'} [opts.order] - sort order
     * @returns {Array<object>} sorted data
     */
    sort(data, opts = {}) {
        throw new Error("sort() must be implemented in subclass");
    }

    /**
     * Annotate items with metadata (timestamps, reasons, etc.)
     * @param {Array<object>} data
     * @returns {Array<object>} annotated data
     */
    annotate(data) {
        throw new Error("annotate() must be implemented in subclass");
    }

    /**
     * Convenience pipeline to run all steps in sequence.
     * Subclasses may override or extend to modify pipeline order.
     * @param {Array<object>} data
     * @returns {Array<object>} processed data
     */
    process(data) {
        throw new Error("process() must be implemented in subclass");
    }
}
