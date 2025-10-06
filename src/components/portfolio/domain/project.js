// src/contracts/project-domain.js
import { Domain } from "../../../contracts/domain";

/**
 * Project — domain-level object for a single repo/project.
 *
 * - Instance-oriented: methods mutate this.data and return this for chaining.
 * - Full fidelity: preserves all previously specified business rules.
 *
 * Typical usage (instance mode):
 *   const p = new Project(rawRepo, opts);
 *   const processed = p.transform().validate().filter().enrich().score().annotate().toObject();
 *
 * Batch usage:
 *   const processed = Project.batchProcess(rawArray, opts);
 */
export class Project extends Domain {
    /**
     * @param {Object|null} data - raw repo object (may be null for "config-only" instance)
     * @param {Object} opts - domain configuration overrides
     */
    constructor(data = null, opts = {}) {
        super();
        this.data = data ? { ...data } : null;

        // merge options with sensible defaults
        this.opts = {
            // filtering thresholds
            minStars: typeof opts.minStars === "number" ? opts.minStars : 1,
            minContributors: typeof opts.minContributors === "number" ? opts.minContributors : null,
            recentDays: typeof opts.recentDays === "number" ? opts.recentDays : 90,
            acceptIfInTopicsOrDescription: opts.acceptIfInTopicsOrDescription ?? true,
            excludeTemplates: opts.excludeTemplates ?? true,
            templateKeywords: Array.isArray(opts.templateKeywords) ? opts.templateKeywords : ["template", "starter", "boilerplate"],

            // license and owner
            allowedLicenses: Array.isArray(opts.allowedLicenses) && opts.allowedLicenses.length > 0 ? opts.allowedLicenses : null,
            ownerWhitelist: Array.isArray(opts.ownerWhitelist) ? opts.ownerWhitelist : null,

            // size / issue ratio / security
            maxRepoSizeKB: typeof opts.maxRepoSizeKB === "number" ? opts.maxRepoSizeKB : null,
            maxOpenIssueRatio: typeof opts.maxOpenIssueRatio === "number" ? opts.maxOpenIssueRatio : null,

            // topics matching
            topicsMatchMode: opts.topicsMatchMode === "AND" ? "AND" : "OR",

            // optional flags on repo objects to check for presence of readme / src / vulnerabilities
            requireReadme: !!opts.requireReadme,
            requireSrc: !!opts.requireSrc,
            securityFlagField: opts.securityFlagField || "vulnerabilities_flagged",

            // human curation lists
            includeIds: Array.isArray(opts.includeIds) ? opts.includeIds : [],
            excludeIds: Array.isArray(opts.excludeIds) ? opts.excludeIds : [],

            // scoring weights
            weights: {
                stars: typeof opts.weights?.stars === "number" ? opts.weights.stars : 1.0,
                recency: typeof opts.weights?.recency === "number" ? opts.weights.recency : 0.7,
                topicsMatch: typeof opts.weights?.topicsMatch === "number" ? opts.weights.topicsMatch : 0.6,
                hasReadme: typeof opts.weights?.hasReadme === "number" ? opts.weights.hasReadme : 0.2,
                recentBoost: typeof opts.weights?.recentBoost === "number" ? opts.weights.recentBoost : 0.3,
                popularityBonus: typeof opts.weights?.popularityBonus === "number" ? opts.weights.popularityBonus : 0.4,
            },

            // sort defaults (used by batch helpers)
            sortBy: opts.sortBy || "score",
            sortOrder: opts.sortOrder === "asc" ? "asc" : "desc",

            // advanced options
            excludeTemplatesIfContains: Array.isArray(opts.excludeTemplatesIfContains) ? opts.excludeTemplatesIfContains : null, // extra keywords
            currentTopics: Array.isArray(opts.currentTopics) ? opts.currentTopics.map(t => String(t).toLowerCase()) : [],
        };
    }

    /* ---------------------------
       Utilities (static)
       --------------------------- */

    static _toLowerArray(arr = []) {
        return Array.isArray(arr) ? arr.map(s => String(s).toLowerCase()) : [];
    }

    static _safeParseDate(val) {
        try {
            const t = Date.parse(val);
            return Number.isFinite(t) ? t : null;
        } catch (e) {
            return null;
        }
    }

    /* ---------------------------
       Deserialize / Transform (instance)
       --------------------------- */

    /**
     * Normalize & populate canonical fields on this.data
     * Mutates this.data, returns this
     */
    transform() {
        if (!this.data) return this;

        const d = this.data;

        const nameRaw = d.name ?? d.full_name ?? "";
        const name = String(nameRaw).trim();

        const stars = (typeof d.stargazers_count === "number") ? d.stargazers_count
            : (typeof d.stars === "number") ? d.stars
                : 0;

        const topics = Array.isArray(d.topics) ? d.topics.map(String) : (Array.isArray(d.topic) ? d.topic.map(String) : []);

        const license =
            d.license && typeof d.license === "object"
                ? d.license.spdx_id || d.license.name || null
                : (typeof d.license === "string" ? d.license : d.license_spdx ?? null);

        const pushedAt = d.pushed_at ?? d.updated_at ?? d.pushed ?? d.pushedAt ?? null;
        const createdAt = d.created_at ?? d.created ?? d.createdAt ?? null;

        const sizeKB = (typeof d.size === "number") ? d.size : null;
        const openIssues = (typeof d.open_issues_count === "number") ? d.open_issues_count : (typeof d.open_issues === "number" ? d.open_issues : null);
        const contributors = (typeof d.contributors_count === "number") ? d.contributors_count : (typeof d.contributor_count === "number" ? d.contributor_count : null);
        const hasReadme = (typeof d.has_readme === "boolean") ? d.has_readme : (d.readme_exists ?? null);
        const hasSrc = (typeof d.has_src === "boolean") ? d.has_src : (d.hasSource ?? null);
        const vulnerabilitiesFlagged = d[this.opts.securityFlagField] ?? null;
        const ownerLogin = (d.owner && (d.owner.login ?? d.owner)) ?? null;

        const id = d.id ?? d.node_id ?? d.full_name ?? `${ownerLogin || "unknown"}/${name}`;

        this.data = {
            ...d,
            id,
            name,
            stars,
            description: d.description ? String(d.description).trim() : "",
            topics,
            license,
            fork: !!d.fork,
            archived: !!d.archived,
            url: d.html_url ?? d.url ?? d.repository_url ?? "",
            pushedAt,
            createdAt,
            sizeKB,
            openIssues,
            contributors,
            hasReadme,
            hasSrc,
            vulnerabilitiesFlagged,
            ownerLogin,
        };

        return this;
    }

    /* ---------------------------
       Validate (instance)
       --------------------------- */

    /**
     * Validate minimal shape for this repo. Returns boolean.
     */
    validate() {
        if (!this.data) {
            console.log('Validation failed no data');
            return false;
        }
        return (typeof this.data.name === "string" && this.data.name.trim() !== "");
    }

    /* ---------------------------
       Filter (instance) -> boolean
       --------------------------- */

    /**
     * Apply all filter rules and return true if this project should be kept.
     */
    filter() {
        const d = this.data;
        if (!d) return false;

        // explicit exclude
        if (this.opts.excludeIds.includes(d.id) || this.opts.excludeIds.includes(d.url)) return false;

        // explicit include always wins
        if (this.opts.includeIds.includes(d.id) || this.opts.includeIds.includes(d.url)) return true;

        // shape checks
        if (!d.name) return false;

        // exclude archived/forks
        if (d.fork) return false;
        if (d.archived) return false;

        // license whitelist
        if (Array.isArray(this.opts.allowedLicenses) && this.opts.allowedLicenses.length > 0) {
            if (!d.license || !this.opts.allowedLicenses.includes(d.license)) return false;
        }

        // owner whitelist
        if (Array.isArray(this.opts.ownerWhitelist) && this.opts.ownerWhitelist.length > 0) {
            if (!d.ownerLogin || !this.opts.ownerWhitelist.includes(d.ownerLogin)) return false;
        }

        // min stars
        if (typeof d.stars === "number" && d.stars < this.opts.minStars) return false;

        // min contributors (if info present)
        if (typeof this.opts.minContributors === "number" && typeof d.contributors === "number") {
            if (d.contributors < this.opts.minContributors) return false;
        }

        // size limit
        if (typeof this.opts.maxRepoSizeKB === "number" && typeof d.sizeKB === "number") {
            if (d.sizeKB > this.opts.maxRepoSizeKB) return false;
        }

        // open issue ratio
        if (typeof this.opts.maxOpenIssueRatio === "number" && typeof d.openIssues === "number") {
            const denom = Math.max(1, d.stars || 1);
            const ratio = d.openIssues / denom;
            if (ratio > this.opts.maxOpenIssueRatio) return false;
        }

        // security flags
        if (typeof d.vulnerabilitiesFlagged === "number" && d.vulnerabilitiesFlagged > 0) return false;
        if (d.vulnerabilitiesFlagged === true) return false;

        // require README / src presence if enforced
        if (this.opts.requireReadme && d.hasReadme === false) return false;
        if (this.opts.requireSrc && d.hasSrc === false) return false;

        // template exclusion (name/description/topics)
        if (this.opts.excludeTemplates) {
            const templateKeywords = this.opts.templateKeywords.concat(this.opts.excludeTemplatesIfContains || []).map(s => String(s).toLowerCase());
            const name = (d.name || "").toLowerCase();
            const desc = (d.description || "").toLowerCase();
            const topics = Array.isArray(d.topics) ? d.topics.map(t => String(t).toLowerCase()) : [];

            const isTemplate = templateKeywords.some(kw => name.includes(kw) || desc.includes(kw) || topics.includes(kw));
            if (isTemplate) return false;
        }

        // keywords presence: name contains portfolio or codesample OR fallback to topics/description if allowed
        const keywords = ["portfolio", "codesample"];
        const nameLower = (d.name || "").toLowerCase();
        const descLower = (d.description || "").toLowerCase();
        const topicsLower = Array.isArray(d.topics) ? d.topics.map(t => String(t).toLowerCase()) : [];

        const nameMatches = keywords.some(k => nameLower.includes(k));
        const fallbackMatches = keywords.some(k => descLower.includes(k) || topicsLower.includes(k));

        if (nameMatches) {
            // ok
        } else if (this.opts.acceptIfInTopicsOrDescription && fallbackMatches) {
            // ok
        } else {
            return false;
        }

        // topics matching mode (if currentTopics set)
        if (Array.isArray(this.opts.currentTopics) && this.opts.currentTopics.length > 0) {
            const selected = this.opts.currentTopics.map(t => String(t).toLowerCase());
            if (this.opts.topicsMatchMode === "AND") {
                const hasAll = selected.every(s => topicsLower.includes(s));
                if (!hasAll) return false;
            } else {
                const hasAny = selected.some(s => topicsLower.includes(s));
                if (!hasAny) return false;
            }
        }

        // passed all rules
        return true;
    }

    /* ---------------------------
       Enrich (instance)
       --------------------------- */

    /**
     * Add derived fields to this.data such as popularity, ageDays, recentBoost, hasTopics
     * Mutates and returns this
     */
    enrich() {
        const d = this.data;
        if (!d) return this;

        const now = Date.now();
        const stars = typeof d.stars === "number" ? d.stars : 0;

        let popularity = "low";
        if (stars > 200) popularity = "very-high";
        else if (stars > 100) popularity = "high";
        else if (stars > 50) popularity = "medium";

        const lastTs = Project._safeParseDate(d.pushedAt) ?? Project._safeParseDate(d.updatedAt) ?? Project._safeParseDate(d.createdAt);
        const ageDays = lastTs ? Math.round((now - lastTs) / (1000 * 60 * 60 * 24)) : null;
        const recentBoost = ageDays !== null ? ageDays <= this.opts.recentDays : false;

        const topics = Array.isArray(d.topics) ? d.topics : [];
        const hasTopics = topics.length > 0;

        this.data = {
            ...d,
            popularity,
            ageDays,
            recentBoost,
            hasTopics,
        };

        return this;
    }

    /* ---------------------------
       Score (instance)
       --------------------------- */

    /**
     * Compute a raw score for this.data and set this.data.score
     * Normalization across items is provided by static helper normalizeScores()
     */
    score() {
        const d = this.data;
        if (!d) return this;

        const weights = this.opts.weights;
        const stars = typeof d.stars === "number" ? d.stars : 0;

        // stars component (log scale)
        const starsVal = Math.log10(Math.max(1, stars)) * weights.stars;

        // recency: based on ageDays
        const age = typeof d.ageDays === "number" ? d.ageDays : null;
        const recencyVal = age === null ? 0 : Math.max(0, (this.opts.recentDays - Math.min(this.opts.recentDays, age)) / this.opts.recentDays) * weights.recency;

        // topics match: if currentTopics provided, fraction matched
        let topicsVal = 0;
        if (Array.isArray(this.opts.currentTopics) && this.opts.currentTopics.length > 0) {
            const selected = this.opts.currentTopics.map(t => String(t).toLowerCase());
            const repoTopics = Array.isArray(d.topics) ? d.topics.map(t => String(t).toLowerCase()) : [];
            const matched = selected.filter(s => repoTopics.includes(s)).length;
            topicsVal = (matched / Math.max(1, selected.length)) * weights.topicsMatch;
        } else {
            topicsVal = (d.hasTopics ? 0.2 : 0) * weights.topicsMatch;
        }

        const readmeVal = d.hasReadme ? weights.hasReadme : 0;
        const recentBoostVal = d.recentBoost ? weights.recentBoost : 0;

        const popBonus =
            d.popularity === "very-high" ? weights.popularityBonus * 1.2 :
                d.popularity === "high" ? weights.popularityBonus :
                    d.popularity === "medium" ? weights.popularityBonus * 0.6 : 0;

        const rawScore = starsVal + recencyVal + topicsVal + readmeVal + recentBoostVal + popBonus;

        this.data = { ...d, score: rawScore };

        return this;
    }

    /* ---------------------------
       Annotate (instance)
       --------------------------- */

    annotate() {
        const d = this.data;
        if (!d) return this;

        const reasons = [];
        if (d.popularity) reasons.push(`pop:${d.popularity}`);
        if (typeof d.ageDays === "number") reasons.push(`age:${d.ageDays}d`);
        if (d.recentBoost) reasons.push("recent");
        if (d.hasTopics) reasons.push("topics");
        if (d.hasReadme) reasons.push("readme");
        if (this.opts.includeIds.includes(d.id) || this.opts.includeIds.includes(d.url)) reasons.push("forced-include");

        this.data = {
            ...d,
            meta: {
                processedAt: Date.now(),
                reasons,
            },
        };

        return this;
    }

    /**
    * Convert instance to a JSON-safe plain object
    * @returns {Object}
    */
    toJSON() {
        return {
            id: this.data.id,
            name: this.data.name,
            description: this.data.description,
            url: this.data.url,
            stars: this.data.stars,
            topics: this.data.topics,
            language: this.data.language,
            createdAt: Project._normalizeDate(this.data.createdAt)?.toISOString() || null,
        };
    }

    static _normalizeDate(input) {
        if (!input) return null;

        // Already a Date
        if (input instanceof Date && !isNaN(input)) return input;

        // Numeric timestamp
        if (typeof input === "number" && isFinite(input)) {
            const d = new Date(input);
            return isNaN(d) ? null : d;
        }

        // String: try Date.parse fallback
        if (typeof input === "string") {
            const parsed = Date.parse(input);
            if (!isNaN(parsed)) return new Date(parsed);

            // Handle edge cases like GitHub short dates (YYYY-MM-DD)
            const isoCandidate = input.match(/^\d{4}-\d{2}-\d{2}$/)
                ? `${input}T00:00:00Z`
                : input;
            const fallback = new Date(isoCandidate);
            return isNaN(fallback) ? null : fallback;
        }

        return null; // unknown type
    }
}

export default Project;
