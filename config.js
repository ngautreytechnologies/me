// config.js
export class Config {
    static GITHUB_USERNAME = "ngautreytechnologies";
    static TAG_HIERARCHY = {
        tags: [
            {
                name: "ML & Predictive Analytics",
                summary: "Machine learning components to enrich and predict telemetry events.",
                problem: "Raw telemetry and operational data lacks insights for proactive action.",
                solution: "Use ML models to detect anomalies, forecast trends, and enrich events.",
                children: [
                    { name: "Anomaly Detection", summary: "Detect unusual patterns in telemetry data.", problem: "Manual monitoring is error-prone.", solution: "Train lightweight ML models." },
                    { name: "Forecasting Models", summary: "Predict trends.", problem: "Teams cannot act on future events.", solution: "Use time-series models." },
                    { name: "Generative Reporting", summary: "Automatically summarize logs.", problem: "Manual reporting is slow.", solution: "Use templated generation." }
                ]
            },
            // ...other top-level nodes
        ]
    };
    static FETCH_TIMEOUT = 8000;
    static MAX_RETRIES = 2;
    static STORAGE_KEY = "portfolio_stories_cache_v1";
}
