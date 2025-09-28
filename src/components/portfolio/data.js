export const technologyTaxonomy = [
  {
    name: "ai-ml",
    title: "Artificial Intelligence & ML",
    topics: [
      { id: "artificial-intelligence", label: "AI" },
      { id: "machine-learning", label: "ML" },
      { id: "knowledge-graph", label: "KG" },
      { id: "graph-ai", label: "Graph AI" },
      { id: "graph-first-modeling", label: "Graph Model" },
      { id: "graph-powered", label: "Graph-Powered" },
      { id: "graph-centric", label: "Graph-Centric" }
    ]
  },
  {
    name: "generative-ai",
    title: "Generative AI & LLMs",
    topics: [
      { id: "generative-ai", label: "Gen AI" },
      { id: "large-language-models", label: "LLMs" },
      { id: "prompt-engineering", label: "Prompt Eng." },
      { id: "langchain", label: "LangChain" },
      { id: "fine-tuning", label: "Fine-Tuning" },
      { id: "rag", label: "RAG" },
    ]
  },
  {
    name: "ai-agents",
    title: "AI Agents & Copilots",
    topics: [
      { id: "ai-agents", label: "Agents" },
      { id: "enterprise-copilot", label: "Enterprise Copilot" },
      { id: "mobile-copilot", label: "Mobile Copilot" },
      { id: "edge-enabled", label: "Edge Enabled" }
    ]
  },
  {
    name: "cloud-serverless",
    title: "Cloud & Serverless",
    topics: [
      { id: "aws", label: "AWS" },
      { id: "serverless", label: "Serverless" },
      { id: "aws-lambda", label: "Lambda" },
      { id: "aws-iam", label: "IAM" },
      { id: "amazon-s3", label: "S3" },
      { id: "amazon-dynamodb", label: "DynamoDB" },
      { id: "amazon-eventbridge", label: "EventBridge" },
      { id: "amazon-kinesis", label: "Kinesis" },
      { id: "amazon-redshift", label: "Redshift" },
      { id: "amazon-athena", label: "Athena" },
      { id: "amazon-quicksight", label: "Quicksight" },
      { id: "amazon-sagemaker", label: "SageMaker" },
      { id: "amazon-ecs", label: "ECS" },
    ]
  },
  {
    name: "architecture-patterns",
    title: "Architecture & Patterns",
    topics: [
      { id: "solution-architecture", label: "Solution Architecture" },
      { id: "microservices", label: "Microservices" },
      { id: "event-driven", label: "Event Driven" },
      { id: "data-fabric", label: "Data Fabric" },
      { id: "data-mesh", label: "Data Mesh" },
    ]
  },
  {
    name: "data-integration",
    title: "Data & Integration",
    topics: [
      { id: "graphql", label: "GraphQL" },
      { id: "rest", label: "RESTful" },
      { id: "postgres", label: "Postgres" },
      { id: "neo4j", label: "Neo4j" },
      { id: "redis", label: "Redis" },
      { id: "graphdb", label: "GraphDB" },
      { id: "spark", label: "Spark" },
      { id: "kafka", label: "Kafka" },
    ]
  },
  {
    name: "programming-frameworks",
    title: "Programming & Frameworks",
    topics: [
      { id: "python", label: "Python" },
      { id: "csharp", label: "C#" },
      { id: "go", label: "Go" },
      { id: "cli", label: "CLI" },
      { id: "javascript", label: "JS" },
      { id: "typescript", label: "TS" },
      { id: "fastapi", label: "FastAPI" },
      { id: "flask", label: "Flask" },
      { id: "react", label: "React" },
      { id: "angular", label: "Angular" },
      { id: "docker", label: "Docker" },
      { id: "kubernetes", label: "K8s" },
    ]
  },
  {
    name: "automation-productivity",
    title: "Automation & Productivity",
    topics: [
      { id: "co-pilot", label: "Co-Pilot" },
      { id: "cli", label: "CLI" },
      { id: "scaffolder", label: "Scaffolder" }
    ]
  }
];

export const skills = [
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
