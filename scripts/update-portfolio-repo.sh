#!/bin/bash

ORG="ngautreytechnologies"

# Map of repo name -> standardized topics
declare -A REPO_TOPICS_MAP=(
    ["portfolio-unobtrusive-ai-integration"]="ai,artificial-intelligence,ml,python,csharp,fastapi,aws-lambda,amazon-kinesis,amazon-dynamodb,amazon-eventbridge,amazon-s3,amazon-redshift,amazon-athena,amazon-quicksight,amazon-sagemaker,amazon-ecs,aws-iam,event-driven,serverless,microservices,sidecar,decorator,event-sourcing,pub-sub,strangler"
    ["portfolio-semantic-data-fabric-ai"]="ai,ml,nlp,entity-recognition,relationship-extraction,anomaly-detection,topic-modeling,text-embeddings,knowledge-summarization,python,csharp,fastapi,neo4j,graphdb,aws-lambda,aws-s3,aws-athena,sagemaker,langchain,openai-gpt,redis,docker,kubernetes,cloudwatch,aws-iam,data-centric,semantic-layer,event-driven,graph-powered,serverless-microservices,sidecar,command-query-separation,cqrs,pub-sub,knowledge-graph"
    ["portfolio-nlp-explainable-ai-clinical-insights"]="ai,nlp,ner,relation-extraction,summarization,xai,explainable-ai,privacy,python,spacy,huggingface-transformers,pytorch,fastapi,postgres,docker,kubernetes,vault,opentelemetry,secure-enclave,human-in-the-loop,model-lineage,audit,privacy-by-design,clinician-ui"
    ["portfolio-machine-learning-data-mesh-ai"]="data-mesh,event-driven,real-time-ml,domain-oriented,python,kafka,aws-kinesis,spark,sagemaker,neo4j,postgres,docker,kubernetes,airflow,opentelemetry,streaming-feature-pipelines,model-cicd,mlops,domain-governance,metadata-catalog,online-inference"
    ["portfolio-digitial-twin-real-time-behaviour-analysis"]="digital-twin,graph-ai,simulation,python,neo4j,pyg,gnns,postgis,kafka,docker,kubernetes,graphql,react,airflow,graph-centric,simulation-as-a-service,graph-first-modeling,model-in-the-loop"
    ["portfolio-desktop-and-mobile-copilot"]="ai-agents,planner-agent,executor-agent,neo4j,rag,vector-embeddings,faiss,pinecone,python,langchain,huggingface-transformers,fastapi,react-native,servicenow-apis,s3,aws-lambda,docker,kubernetes,multi-agent,knowledge-graph,agent-orchestration,human-in-the-loop,edge-enabled"
    ["portfolio-go-cli-scaffolder"]="go,cli,productivity,automation"
    ["me"]="personal-portfolio"
)

for REPO in "${!REPO_TOPICS_MAP[@]}"; do
    FULL_REPO="$ORG/$REPO"
    echo "Processing repo: $FULL_REPO"

    # Fetch current topics
    CURRENT_TOPICS=$(gh repo view "$FULL_REPO" --json repositoryTopics -q '.repositoryTopics[].topic.name')

    # Remove each current topic
    for topic in $CURRENT_TOPICS; do
        echo "Removing topic: $topic"
        gh repo edit "$FULL_REPO" --remove-topic "$topic"
    done

    # Add new topics
    IFS=',' read -ra NEW_TOPICS <<< "${REPO_TOPICS_MAP[$REPO]}"
    for topic in "${NEW_TOPICS[@]}"; do
        echo "Adding topic: $topic"
        gh repo edit "$FULL_REPO" --add-topic "$topic"
    done

    echo "✅ Finished updating topics for $FULL_REPO"
    echo "---------------------------------------"
done
