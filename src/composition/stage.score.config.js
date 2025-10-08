/**
 * stage.score.js
 *
 * Runtime score sheet for the orchestral portfolio.
 * - environment: "development"
 * - includes buildVersion / commitHash for traceability
 * - portfolio-focused elements enabled by default
 * - provides runtime options (theme, layout, logLevel, aiMode)
 * - AI toggles: aiAnnotations, graphDrivenRanking, enrichmentMode
 *
 * This file is intended to be merged with stage.config.js at bootstrap time
 * to form the active runtime composition.
 */

export default {
    meta: {
        version: "1.0.0",
        environment: "development",
        timestamp: new Date().toISOString(),
        buildVersion: "dev-local-001",   // replace in CI with real version
        commitHash: "HEAD",              // replace in CI with short hash
        description: "Runtime score controlling which orchestra sections perform."
    },

    orchestral: {
        maestro: [
            {
                name: "app",
                enabled: true,
                options: {
                    debug: true,
                    startupDelayMs: 0
                }
            }
        ],

        orchestrators: [
            {
                name: "pipeline",
                enabled: true,
                options: { concurrency: 2, retryOnFail: true }
            },
            {
                name: "context",
                enabled: true,
                options: {}
            }
        ],

        composers: [
            {
                name: "portfolio",
                enabled: true,
                options: { prefetch: true, cacheTtlMs: 1000 * 60 * 5 } // 5 minutes
            }
        ],

        stages: [
            // Portfolio-focused stages are enabled
            {
                name: "portfolio",
                enabled: true,
                options: { theme: "auto", layout: "grid", pageSize: 12 }
            },
            {
                name: "skillsGrid",
                enabled: true,
                options: { collapsedByDefault: false }
            },
            {
                name: "summary",
                enabled: true,
                options: { showContact: true }
            },

            // Secondary stages default to disabled (toggle when needed)
            {
                name: "certifications",
                enabled: false,
                options: {}
            },
            {
                name: "education",
                enabled: false,
                options: {}
            },
            {
                name: "experience",
                enabled: false,
                options: {}
            },
            {
                name: "header",
                enabled: true,
                options: { sticky: true }
            }
        ],

        performances: [
            {
                name: "projectCard",
                stageRef: "portfolio",
                enabled: true,
                options: { highlightNew: true, showBadges: true }
            },
            {
                name: "projectDetails",
                stageRef: "portfolio",
                enabled: true,
                options: { lazyLoadAssets: true }
            },
            {
                name: "projectList",
                stageRef: "portfolio",
                enabled: true,
                options: { infiniteScroll: false }
            },
            {
                name: "skillDetails",
                stageRef: "skillsGrid",
                enabled: true,
                options: {}
            }
        ],

        musicians: [
            {
                name: "project",
                enabled: true,
                options: { persistence: "graph", scoreWeight: 1.0 }
            },
            {
                name: "topic",
                enabled: true,
                options: {}
            },
            {
                name: "taxonomy",
                enabled: true,
                options: {}
            }
        ],

        instruments: [
            {
                name: "logger",
                enabled: true,
                options: { level: "debug" }
            },
            {
                name: "metrics",
                enabled: true,
                options: { flushIntervalMs: 10_000 }
            },
            {
                name: "signals",
                enabled: true,
                options: { reactive: true }
            },
            {
                name: "httpClient",
                enabled: true,
                options: { timeoutMs: 10_000 }
            },
            {
                name: "storage",
                enabled: true,
                options: { backend: "indexeddb", namespace: "portfolio.v1" }
            },
            {
                name: "cache",
                enabled: true,
                options: { strategy: "memory-first", maxEntries: 500 }
            }
        ]
    },

    nonOrchestral: [
        { name: "globals", enabled: true },
        { name: "config", enabled: true },
        { name: "templateRenderer", enabled: true }
    ],

    // AI / personalization toggles (top-level for easy access)
    ai: {
        aiAnnotations: true,          // enable/disable LLM annotations
        graphDrivenRanking: true,     // use knowledge graph signals for ranking
        enrichmentMode: "hybrid",     // 'heuristic' | 'edge' | 'hybrid' | 'remote'
        aiRateLimitPerMinute: 30      // throttle remote calls if used
    },

    // optional experiment/AB testing metadata
    experiments: {
        highlightAlgorithm: { variant: "graph_v1", enabled: true }
    }
};
