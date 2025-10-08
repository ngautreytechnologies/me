/**
 * Stage Configuration 
 *
 * Central composition and dependency configuration for the portfolio site.
 * All modules are categorized into orchestral layers, enriched with metadata,
 * and nested for clarity. Ready for DI container consumption.
 */

export default {
  maestro: {
    app: {
      path: "./modules/pipeline/request-pipeline.js",
      description: "Bootstraps the application and orchestrates top-level lifecycle.",
      author: "Nicholas",
      version: "1.0.0",
      bootstrapOrder: 1,  
      enabled: true
    }
  },
  orchestrators: {
    pipeline: {
      path: "./modules/pipeline/request-pipeline.js",
      description: "Handles request sequencing and orchestration.",
      dependsOn: ["context"],
      enabled: true
    },
    context: {
      path: "./modules/pipeline/context.js",
      description: "Provides shared request context and state.",
      enabled: true
    }
  },
  composers: {
    portfolio: {
      path: "./components/portfolio/composition/portfolio-composer.js",
      description: "Transforms portfolio domain data into view models.",
      domain: "portfolio",
      enabled: true
    }
  },
  stages: {
    header: {
      path: "./components/header/header.js",
      description: "Top navigation and branding stage.",
      uiArea: "header",
      enabled: true
    },
    summary: {
      path: "./components/summary/summary.js",
      description: "Summary stage rendering professional info.",
      uiArea: "main",
      enabled: true
    },
    skillsGrid: {
      path: "./components/skills/skills-grid/skills-grid.js",
      description: "Stage displaying skills in a grid layout.",
      uiArea: "main",
      dependencies: ["skills.skillDetails"],
      enabled: true
    },
    certifications: {
      path: "./components/certifications/certifications.js",
      description: "Stage listing certifications.",
      uiArea: "main",
      enabled: true
    },
    education: {
      path: "./components/education/education.js",
      description: "Stage rendering educational background.",
      uiArea: "main",
      enabled: true
    },
    experience: {
      path: "./components/experience/experience.js",
      description: "Stage displaying professional experience.",
      uiArea: "main",
      enabled: true
    },
    portfolio: {
      path: "./components/portfolio/components/portfolio-list.js",
      description: "Main portfolio stage displaying projects.",
      uiArea: "main",
      dependencies: ["portfolio.composer", "portfolio.domain.project"],
      enabled: true
    }
  },
  performances: {
    portfolio: {
      card: {
        path: "./components/portfolio/views/project-card-view.js",
        stageRef: "stages.portfolio",
        description: "Renders individual project cards.",
        factory: "./components/portfolio/views/factories/card-factory.js",
        enabled: true
      },
      details: {
        path: "./components/portfolio/views/project-details-view.js",
        stageRef: "stages.portfolio",
        description: "Renders detailed project info.",
        enabled: true
      },
      list: {
        path: "./components/portfolio/views/project-list-view.js",
        stageRef: "stages.portfolio",
        description: "Renders a list of projects.",
        enabled: true
      }
    },
    skills: {
      skillDetails: {
        path: "./components/skills/skill-details/skill-details.js",
        stageRef: "stages.skillsGrid",
        description: "Renders details of a single skill.",
        enabled: true
      }
    }
  },
  musicians: {
    portfolio: {
      project: {
        path: "./components/portfolio/domain/project.js",
        description: "Domain entity representing a project.",
        domainEntity: "Project",
        enabled: true
      },
      topic: {
        path: "./components/portfolio/domain/topic.js",
        description: "Domain entity representing a topic.",
        domainEntity: "Topic",
        enabled: true
      },
      taxonomy: {
        path: "./components/portfolio/domain/taxonomy.js",
        description: "Domain entity for taxonomies/categories.",
        domainEntity: "Taxonomy",
        enabled: true
      }
    }
  },
  instruments: {
    observability: {
      logger: {
        path: "./modules/observability/logging/logger.js",
        description: "Central logging utility.",
        singleton: true,
        enabled: true
      },
      metrics: {
        path: "./modules/observability/metrics/metrics.js",
        description: "Metrics collection and reporting service.",
        singleton: true,
        enabled: true
      },
      middleware: {
        path: "./modules/observability/logging/middleware.js",
        description: "Logging middleware for events.",
        singleton: true,
        enabled: true
      },
      setup: {
        path: "./modules/observability/logging/setup.js",
        description: "Initializes logging configuration.",
        singleton: true,
        enabled: true
      }
    },
    reactivity: {
      signals: {
        path: "./modules/reactivity/signals.js",
        description: "Reactive signal utility.",
        singleton: true,
        enabled: true
      },
      hub: {
        path: "./modules/reactivity/event-hub.js",
        description: "Central event hub for reactivity.",
        singleton: true,
        enabled: true
      }
    },
    security: {
      core: {
        path: "./modules/security/security.js",
        description: "Security utilities and policy enforcement.",
        singleton: true,
        enabled: true
      }
    },
    cache: {
      local: {
        path: "./modules/cache/cache.js",
        description: "Local caching service.",
        singleton: true,
        enabled: true
      }
    },
    http: {
      client: {
        path: "./modules/http/http-client.js",
        description: "HTTP client for API requests.",
        singleton: true,
        enabled: true
      }
    },
    storage: {
      local: {
        path: "./modules/storage/storage.js",
        description: "Persistent browser storage service.",
        singleton: true,
        enabled: true
      }
    },
    privacy: {
      policy: {
        path: "./modules/privacy/privacy.js",
        description: "Privacy enforcement utilities.",
        singleton: true,
        enabled: true
      }
    },
    async: {
      tools: {
        path: "./modules/async/async.js",
        description: "Async utilities for promise handling.",
        singleton: true,
        enabled: true
      }
    },
    transformation: {
      utils: {
        path: "./modules/transformation/transformation.js",
        description: "Data transformation utilities.",
        singleton: true,
        enabled: true
      }
    },

    resilience: {
      tools: {
        path: "./modules/resilience/resilience.js",
        description: "Resilience helpers (retry, backoff, etc.).",
        singleton: true,
        enabled: true
      }
    }
  }
};
