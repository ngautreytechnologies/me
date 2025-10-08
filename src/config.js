export class Config {
    /** GitHub username where repos are located */
    static GITHUB_USERNAME = "ngautreytechnologies";

    /** Max time before a fetch aborts (ms) */
    static FETCH_TIMEOUT = 8000;

    /** Number of retry attempts for failed fetch */
    static MAX_RETRIES = 2;

    /** LocalStorage key for cached stories */
    static STORAGE_KEY = "portfolio_stories_cache_v1";

    /** Base URL for GitHub */
    static GITHUB_BASEURL = "GITHUB_BASEURL"

    /** Logging verbosity level */
    static LOG_LEVEL = "DEBUG"

    static MAX_TOPICS_PER_CATEGORY = 2
    
    static MAX_TOPICS_VISIBLE = 9
}
