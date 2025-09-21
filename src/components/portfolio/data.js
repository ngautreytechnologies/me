// config.js
export const tags = [
    {
        id: "tag-1",
        name: "Artificial Intelligence",
        summary: "AI systems that learn, adapt, and create value across domains.",
        children: [
            {
                id: "tag-2",
                name: "Generative AI",
                children: [
                    {
                        id: "tag-3",
                        name: "Large Language Models",
                        children: [
                            { id: "tag-4", name: "Fine-Tuning & PEFT" },
                            { id: "tag-5", name: "Prompt Engineering" },
                            { id: "tag-6", name: "Evaluation Harnesses" }
                        ]
                    },
                    {
                        id: "tag-7",
                        name: "Retrieval-Augmented Generation (RAG)",
                        children: [
                            { id: "tag-8", name: "Vector DB Integration" },
                            { id: "tag-9", name: "Embedding Models" },
                            { id: "tag-10", name: "Caching Strategies" }
                        ]
                    }
                ]
            },
            {
                id: "tag-11",
                name: "AI Agents",
                children: [
                    {
                        id: "tag-12",
                        name: "Planning & Reasoning",
                        children: [
                            { id: "tag-13", name: "Task Decomposition" },
                            { id: "tag-14", name: "Tool Selection" }
                        ]
                    },
                    {
                        id: "tag-15",
                        name: "Memory",
                        children: [
                            { id: "tag-16", name: "Short-term Memory" },
                            { id: "tag-17", name: "Long-term Memory" }
                        ]
                    },
                    {
                        id: "tag-18",
                        name: "Company Copilot",
                        summary: "Enterprise copilots embedded into workflows.",
                        children: [
                            {
                                id: "tag-19",
                                name: "Workflow Automation",
                                children: [
                                    {
                                        id: "tag-20",
                                        name: "IT Ops Copilot",
                                        children: [
                                            { id: "tag-21", name: "Incident Summaries" },
                                            { id: "tag-22", name: "Root Cause Analysis" }
                                        ]
                                    },
                                    {
                                        id: "tag-23",
                                        name: "DevOps Copilot",
                                        children: [
                                            { id: "tag-24", name: "IaC Assist" },
                                            { id: "tag-25", name: "Release Notes Generation" }
                                        ]
                                    },
                                    {
                                        id: "tag-26",
                                        name: "Business Copilot",
                                        children: [
                                            { id: "tag-27", name: "Sales Playbook Guidance" },
                                            { id: "tag-28", name: "Customer Insights" }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "tag-29",
        name: "AWS",
        children: [
            {
                id: "tag-30",
                name: "Databases",
                children: [
                    {
                        id: "tag-31",
                        name: "Relational (RDS)",
                        children: [
                            { id: "tag-32", name: "Aurora" },
                            { id: "tag-33", name: "PostgreSQL on RDS" }
                        ]
                    },
                    {
                        id: "tag-34",
                        name: "NoSQL (DynamoDB)",
                        children: [
                            { id: "tag-35", name: "Streams" },
                            { id: "tag-36", name: "Global Tables" }
                        ]
                    },
                    {
                        id: "tag-37",
                        name: "Graph (Neptune)",
                        children: [
                            { id: "tag-38", name: "RDF/SPARQL" },
                            { id: "tag-39", name: "Property Graphs" }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "tag-40",
        name: "Solution Architecture",
        summary: "Designing scalable, secure, resilient systems.",
        children: [
            {
                id: "tag-41",
                name: "Cloud-Native Patterns",
                children: [
                    {
                        id: "tag-42",
                        name: "Microservices",
                        children: [
                            { id: "tag-43", name: "API Gateway Pattern" },
                            { id: "tag-44", name: "Service Mesh" }
                        ]
                    },
                    {
                        id: "tag-45",
                        name: "Event-Driven",
                        children: [
                            { id: "tag-46", name: "Pub/Sub" },
                            { id: "tag-47", name: "CQRS" }
                        ]
                    }
                ]
            },
            {
                id: "tag-48",
                name: "Integration",
                children: [
                    {
                        id: "tag-49",
                        name: "Messaging",
                        children: [
                            { id: "tag-50", name: "Kafka" },
                            { id: "tag-51", name: "SQS/SNS" }
                        ]
                    },
                    {
                        id: "tag-52",
                        name: "API Management",
                        children: [
                            { id: "tag-53", name: "REST APIs" },
                            { id: "tag-54", name: "GraphQL" }
                        ]
                    }
                ]
            },
            {
                id: "tag-55",
                name: "Resilience & Scalability",
                children: [
                    {
                        id: "tag-56",
                        name: "Resilience",
                        children: [
                            { id: "tag-57", name: "Circuit Breaker" },
                            { id: "tag-58", name: "Bulkhead" }
                        ]
                    },
                    {
                        id: "tag-59",
                        name: "Scalability",
                        children: [
                            { id: "tag-60", name: "Auto-scaling" },
                            { id: "tag-61", name: "Sharding" }
                        ]
                    }
                ]
            },
            {
                id: "tag-62",
                name: "Observability",
                children: [
                    {
                        id: "tag-63",
                        name: "Metrics",
                        children: [
                            { id: "tag-64", name: "Prometheus" },
                            { id: "tag-65", name: "CloudWatch" }
                        ]
                    },
                    {
                        id: "tag-66",
                        name: "Tracing",
                        children: [
                            { id: "tag-67", name: "OpenTelemetry" },
                            { id: "tag-68", name: "X-Ray" }
                        ]
                    }
                ]
            },
            {
                id: "tag-69",
                name: "Governance & Security",
                children: [
                    {
                        id: "tag-70",
                        name: "IAM",
                        children: [
                            { id: "tag-71", name: "RBAC" },
                            { id: "tag-72", name: "ABAC" }
                        ]
                    },
                    {
                        id: "tag-73",
                        name: "Compliance",
                        children: [
                            { id: "tag-74", name: "GDPR" },
                            { id: "tag-75", name: "SOC2" }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "tag-76",
        name: "Programming Languages",
        children: [
            {
                id: "tag-77",
                name: "Python",
                children: [
                    {
                        id: "tag-78",
                        name: "Data",
                        children: [
                            { id: "tag-79", name: "Pandas / NumPy" },
                            { id: "tag-80", name: "PySpark" }
                        ]
                    },
                    {
                        id: "tag-81",
                        name: "AI",
                        children: [
                            { id: "tag-82", name: "TensorFlow" },
                            { id: "tag-83", name: "PyTorch" }
                        ]
                    },
                    {
                        id: "tag-84",
                        name: "Web/Backend",
                        children: [
                            { id: "tag-85", name: "Django" },
                            { id: "tag-86", name: "FastAPI" }
                        ]
                    }
                ]
            },
            {
                id: "tag-87",
                name: "C#",
                children: [
                    {
                        id: "tag-88",
                        name: ".NET Core",
                        children: [
                            { id: "tag-89", name: "ASP.NET Core" },
                            { id: "tag-90", name: "Minimal APIs" }
                        ]
                    },
                    {
                        id: "tag-91",
                        name: "Data Access",
                        children: [
                            { id: "tag-92", name: "Entity Framework" },
                            { id: "tag-93", name: "LINQ" }
                        ]
                    },
                    {
                        id: "tag-94",
                        name: "Cloud Integration",
                        children: [
                            { id: "tag-95", name: "AWS SDK for .NET" },
                            { id: "tag-96", name: "Azure SDK for .NET" }
                        ]
                    }
                ]
            },
            {
                id: "tag-97",
                name: "JavaScript/TypeScript",
                children: [
                    {
                        id: "tag-98",
                        name: "Frontend",
                        children: [
                            { id: "tag-99", name: "React" },
                            { id: "tag-100", name: "Next.js" }
                        ]
                    },
                    {
                        id: "tag-101",
                        name: "Backend",
                        children: [
                            { id: "tag-102", name: "Node.js" },
                            { id: "tag-103", name: "Express" }
                        ]
                    }
                ]
            },
            {
                id: "tag-104",
                name: "SQL & NoSQL",
                children: [
                    {
                        id: "tag-105",
                        name: "Relational",
                        children: [
                            { id: "tag-106", name: "PostgreSQL" },
                            { id: "tag-107", name: "MySQL" }
                        ]
                    },
                    {
                        id: "tag-108",
                        name: "NoSQL",
                        children: [
                            { id: "tag-109", name: "MongoDB" },
                            { id: "tag-110", name: "Cassandra" }
                        ]
                    },
                    {
                        id: "tag-111",
                        name: "Graph",
                        children: [
                            { id: "tag-112", name: "Neo4j" },
                            { id: "tag-113", name: "Gremlin" }
                        ]
                    }
                ]
            }
        ]
    }
]

export const data = [
    {
        id: "python",
        title: "Python / AI",
        tags: ['AI', 'Automation', 'LLM'],
        overview: "Python is my primary language for AI-enhanced workflows and API development. I leverage FastAPI and Flask for web services, and LangChain for building modular AI components.",
        keyFeatures: `<ul>
                        <li>FastAPI and Flask for lightweight, scalable APIs</li>
                        <li>LangChain for modular LLM workflows and automation</li>
                        <li>AI sidecar patterns for orchestration and task delegation</li>
                        <li>Rapid prototyping with Python and AI libraries</li>
                      </ul>`,
        pros: "Highly versatile, strong ecosystem, great for AI/ML workflows, quick development cycles.",
        cons: "Some runtime performance overhead, requires careful dependency management, async complexity in large projects."
    },
    {
        id: "csharp",
        title: "C# / .NET",
        tags: ['Backend', 'Enterprise', 'Microservices'],
        overview: "C# is my go-to for enterprise-grade backend applications, microservices, and Windows-based tools. I focus on maintainable, performant architecture with .NET Core and .NET 6+.",
        keyFeatures: `<ul>
                        <li>.NET Core for cross-platform backend services</li>
                        <li>Entity Framework for ORM and data access</li>
                        <li>ASP.NET Web APIs for enterprise integration</li>
                        <li>Strong type safety and maintainable architecture</li>
                      </ul>`,
        pros: "Stable, enterprise-ready, rich tooling, excellent IDE support.",
        cons: "Windows-centric legacy considerations, learning curve for .NET Core async patterns."
    },
    {
        id: "aws",
        title: "AWS Cloud",
        tags: ['Cloud', 'Infrastructure', 'DevOps'],
        overview: "I design, deploy, and maintain cloud infrastructure on AWS, leveraging services like Lambda, ECS, S3, DynamoDB, and CloudFormation for scalable, resilient systems.",
        keyFeatures: `<ul>
                        <li>Serverless solutions with AWS Lambda and API Gateway</li>
                        <li>Infrastructure as Code with CloudFormation and CDK</li>
                        <li>Managed databases (RDS, DynamoDB) for structured and unstructured data</li>
                        <li>Monitoring & CI/CD with CloudWatch, CodePipeline, and GitHub Actions</li>
                      </ul>`,
        pros: "Scalable, highly available, reduces operational overhead, fast prototyping.",
        cons: "Cost management complexity, vendor lock-in, steep service landscape learning curve."
    },
    {
        id: "angular",
        title: "Angular / Frontend",
        tags: ['Frontend', 'SPA', 'TypeScript'],
        overview: "I build complex single-page applications using Angular with a focus on performance, maintainable architecture, and reusable component libraries.",
        keyFeatures: `<ul>
                        <li>TypeScript-based strong typing for scalable apps</li>
                        <li>RxJS for reactive state management</li>
                        <li>Angular CLI and Nx workspace for monorepo organization</li>
                        <li>Component libraries for consistent UI patterns</li>
                      </ul>`,
        pros: "Structured, enterprise-friendly, rich ecosystem, good for large teams.",
        cons: "Steeper learning curve, verbose boilerplate, can be heavy for small apps."
    },
    {
        id: "fullstack",
        title: "Full Stack Development",
        tags: ['Full Stack', 'Web', 'API'],
        overview: "I deliver end-to-end web solutions combining backend APIs with dynamic, responsive frontends, ensuring maintainability and fast iteration.",
        keyFeatures: `<ul>
                        <li>RESTful and GraphQL APIs for backend</li>
                        <li>Frontend frameworks (Angular, React) for rich UI</li>
                        <li>Database integration: SQL & NoSQL</li>
                        <li>CI/CD pipelines for automated deployments</li>
                      </ul>`,
        pros: "Able to own full product lifecycle, cross-domain understanding, flexible solution design.",
        cons: "Requires constant skill refresh, can be challenging to specialize deeply in all layers."
    },
    {
        id: "systems-design",
        title: "Systems Design & Architecture",
        tags: ['Architecture', 'Scalability', 'Resilience'],
        overview: "I design scalable, maintainable, and resilient systems, balancing performance, cost, and reliability across distributed systems.",
        keyFeatures: `<ul>
                        <li>Microservices, event-driven, and serverless architectures</li>
                        <li>Database schema design and optimization</li>
                        <li>Load balancing, caching, and high-availability patterns</li>
                        <li>Documentation of architecture decisions and trade-offs</li>
                      </ul>`,
        pros: "Ability to build robust, long-lived systems, clear design patterns, strong problem solving.",
        cons: "Requires foresight and experience, potential for over-engineering."
    },
    {
        id: "sql",
        title: "SQL Databases",
        tags: ['SQL', 'RDBMS', 'Data Modeling'],
        overview: "Skilled in designing relational databases, writing optimized queries, and maintaining data integrity with PostgreSQL, MySQL, and SQL Server.",
        keyFeatures: `<ul>
                        <li>Database normalization and schema design</li>
                        <li>Complex queries and stored procedures</li>
                        <li>Indexes, transactions, and concurrency control</li>
                        <li>Integration with backend applications</li>
                      </ul>`,
        pros: "Strong consistency, structured data, mature tooling.",
        cons: "Rigid schema can slow iteration, less flexible for unstructured data."
    },
    {
        id: "nosql",
        title: "NoSQL Databases",
        tags: ['NoSQL', 'Document Stores', 'Graph DB'],
        overview: "Experience with flexible schema databases like MongoDB and Couchbase for high-throughput, unstructured data needs.",
        keyFeatures: `<ul>
                        <li>Document stores for fast development cycles</li>
                        <li>Horizontal scaling and sharding</li>
                        <li>Eventual consistency and distributed systems</li>
                        <li>Integration with caching and message queues</li>
                      </ul>`,
        pros: "Flexible schema, high throughput, easy horizontal scaling.",
        cons: "Eventual consistency considerations, less mature tooling than SQL."
    },
    {
        id: "neo4j",
        title: "Graph Databases (Neo4j)",
        tags: ['Graph DB', 'Relationships', 'Analytics'],
        overview: "I use Neo4j to model complex relationships and build graph queries for recommendation engines, analytics, and semantic relationships.",
        keyFeatures: `<ul>
                        <li>Cypher query language for efficient graph traversals</li>
                        <li>Graph modeling and visualization for insight</li>
                        <li>Integrates with Python, Node.js, and Java backends</li>
                        <li>Real-world applications: recommendations, social graphs, dependency analysis</li>
                      </ul>`,
        pros: "Excellent for connected data, flexible queries, visualizable insights.",
        cons: "Niche skill, learning curve, integration overhead with relational systems."
    }
];

export const story = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Contoso Energy - Serverless Event-Driven Architecture",
    "summary": "An enterprise-grade event-driven platform for processing and enriching energy telemetry data using AWS serverless services and ML pipelines.",
    "problem": "Energy providers face challenges ingesting high-volume telemetry from distributed devices, enriching it with AI insights, and delivering real-time analytics without scaling issues or high operational overhead.",
    "solution": "Built a loosely coupled, serverless event-driven architecture on AWS where IoT telemetry flows through Kinesis into a C# microservice, enriched via a Python AI sidecar, persisted in DynamoDB and S3, orchestrated with EventBridge and Step Functions, and analyzed through Redshift, Athena, and QuickSight dashboards.",
    "tech_stack": [
        "C#",
        "Python",
        "FastAPI",
        "AWS Lambda",
        "Amazon Kinesis",
        "Amazon DynamoDB",
        "Amazon EventBridge",
        "Amazon S3",
        "Amazon Redshift",
        "Amazon Athena",
        "Amazon QuickSight",
        "Amazon SageMaker",
        "Amazon ECS",
        "Amazon CloudWatch",
        "AWS IAM",
        "AWS Step Functions"
    ],
    "overview": {
        "architecture": {
            "styles": [
                "Event-Driven",
                "Serverless",
                "Microservices"
            ],
            "key_components": [
                "IoT ingestion via API Gateway and Kinesis",
                "C# microservice with KCL for stream processing",
                "Python AI sidecar for ML enrichment",
                "DynamoDB for filtered operational data",
                "S3 and Firehose for batch analytics",
                "EventBridge for orchestration and business workflows",
                "Analytics via Redshift, Athena, QuickSight"
            ]
        },
        "design_patterns": [
            "Sidecar pattern",
            "Event sourcing",
            "CQRS (Command Query Responsibility Segregation)",
            "Pub/Sub with decoupled services"
        ]
    },
    "architecture": {
        "style": "Serverless Event-Driven Microservices",
        "key_components": [
            "API Gateway",
            "IoT Core",
            "Kinesis Data Streams",
            "ECS-hosted C# Microservice",
            "Python ML Sidecar",
            "DynamoDB",
            "EventBridge",
            "S3",
            "Athena",
            "Redshift",
            "QuickSight",
            "Step Functions"
        ],
        "diagram_url": "https://example.com/contoso-energy-architecture.png"
    },
    "challenges": [
        "Scaling ingestion for millions of telemetry events per hour",
        "Ensuring low-latency enrichment without blocking processing",
        "Maintaining cost efficiency while handling peak loads",
        "Securing cross-service communication in a multi-tenant environment"
    ],
    "impact": {
        "metrics": {
            "processing_time_reduction": "40% faster compared to legacy batch system",
            "cost_savings": "30% lower infrastructure cost due to serverless adoption",
            "transactions_processed": "Over 5 million telemetry events daily"
        },
        "business_outcome": "Enabled real-time monitoring of energy usage and predictive insights, improving customer transparency and grid efficiency."
    },
    "links": {
        "github": "https://github.com/your-username/portfolio-serverless-event-architecture-python-aws",
        "demo": "https://demo.contoso-energy.com",
        "docs": "https://docs.contoso-energy.com"
    },
    "media": [
        {
            "type": "image",
            "url": "https://example.com/screenshots/dashboard.png",
            "caption": "Real-time energy dashboard powered by QuickSight and Grafana"
        },
        {
            "type": "diagram",
            "url": "https://example.com/contoso-energy-architecture.png",
            "caption": "Enterprise AWS serverless architecture"
        }
    ],
    "timeline": {
        "start": "2024-02",
        "end": "2024-06"
    },
    "tags": [
        {
            "name": "AI",
            "summary": "Artificial intelligence applied to telemetry.",
            "problem": "Raw telemetry lacks contextual insights.",
            "solution": "Apply ML models for anomaly detection and enrichment.",
            "children": [
                {
                    "name": "ML",
                    "summary": "Machine learning models running in a sidecar.",
                    "problem": "Need near real-time enrichment for telemetry data.",
                    "solution": "Run lightweight models in Python sidecar via shared memory.",
                    "children": [
                        {
                            "name": "AI ML Sidecar",
                            "summary": "Sidecar enrichment microservice.",
                            "problem": "C# service cannot handle ML workloads efficiently.",
                            "solution": "Offload ML to colocated Python container with fast IPC."
                        }
                    ]
                }
            ]
        },
        {
            "name": "AWS",
            "summary": "Cloud services backbone powering serverless workflows.",
            "children": [
                {
                    "name": "Kinesis",
                    "summary": "Streaming ingestion pipeline for IoT telemetry.",
                    "problem": "High-throughput ingestion of distributed device events.",
                    "solution": "Use Amazon Kinesis for scalable, ordered event streams."
                },
                {
                    "name": "DynamoDB",
                    "summary": "Operational data store for telemetry state.",
                    "problem": "Telemetry needs low-latency operational storage.",
                    "solution": "Store structured operational data in DynamoDB."
                },
                {
                    "name": "S3",
                    "summary": "Cost-effective storage for batch and analytical data."
                },
                {
                    "name": "EventBridge",
                    "summary": "Event bus for orchestration and workflows."
                },
                {
                    "name": "Step Functions",
                    "summary": "Serverless orchestrator for business processes."
                },
                {
                    "name": "Athena",
                    "summary": "Ad-hoc query service over data lake."
                },
                {
                    "name": "Redshift",
                    "summary": "Cloud data warehouse for analytics."
                },
                {
                    "name": "QuickSight",
                    "summary": "Visualization and dashboarding for telemetry insights."
                }
            ]
        },
        {
            "name": "Architecture",
            "summary": "Patterns and practices ensuring resilience and scalability.",
            "children": [
                {
                    "name": "Serverless",
                    "summary": "Pay-per-use execution model without server management."
                },
                {
                    "name": "Event-Driven",
                    "summary": "Loosely coupled systems via asynchronous events."
                },
                {
                    "name": "Microservices",
                    "summary": "Small, focused services that can scale independently."
                }
            ]
        },
        {
            "name": "Languages",
            "summary": "Core programming languages used in the solution.",
            "children": [
                {
                    "name": "C#",
                    "summary": "Primary service language for business logic."
                },
                {
                    "name": "Python",
                    "summary": "ML sidecar and orchestration tasks."
                }
            ]
        }
    ],
    "flow": {
        "steps": [
            {
                "id": "1",
                "type": "ingest",
                "name": "Telemetry Ingestion",
                "action": "Collect IoT telemetry via API Gateway into Kinesis"
            },
            {
                "id": "2",
                "type": "process",
                "name": "Stream Processing",
                "action": "C# microservice consumes events with KCL and applies business rules",
                "depends_on": [
                    "1"
                ],
                "retries": 3,
                "timeout_sec": 30
            },
            {
                "id": "3",
                "type": "enrich",
                "name": "AI Enrichment",
                "action": "Python sidecar performs ML-based enrichment on telemetry data",
                "depends_on": [
                    "2"
                ]
            },
            {
                "id": "4",
                "type": "persist",
                "name": "Data Persistence",
                "action": "Store operational data in DynamoDB and analytical data in S3",
                "depends_on": [
                    "2",
                    "3"
                ]
            },
            {
                "id": "5",
                "type": "orchestrate",
                "name": "Event Orchestration",
                "action": "EventBridge triggers workflows via Step Functions, SQS, and SNS",
                "depends_on": [
                    "4"
                ]
            },
            {
                "id": "6",
                "type": "analyze",
                "name": "Analytics & Dashboards",
                "action": "Athena and Redshift queries feed QuickSight/Grafana dashboards",
                "depends_on": [
                    "4",
                    "5"
                ]
            }
        ]
    }
}