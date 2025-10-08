#!/usr/bin/env bash
set -e

# === CONFIG ===
REPO_NAME=""
OUTPUT_FILE="story.json"

# === Helper ===
ask() {
  local prompt="$1"
  local default="$2"
  local input
  read -p "$prompt [${default}]: " input
  echo "${input:-$default}"
}

# === Parse flags ===
while [[ $# -gt 0 ]]; do
  case $1 in
    -r|--repo) REPO_NAME="$2"; shift ;;
    -t|--title) TITLE="$2"; shift ;;
    -s|--summary) SUMMARY="$2"; shift ;;
    -p|--problem) PROBLEM="$2"; shift ;;
    -so|--solution) SOLUTION="$2"; shift ;;
    -ts|--techstack) TECH_STACK="$2"; shift ;;
    -o|--output) OUTPUT_FILE="$2"; shift ;;
    *) echo "❌ Unknown option: $1"; exit 1 ;;
  esac
  shift
done

# === Interactive fallback ===
if [ -z "$REPO_NAME" ]; then REPO_NAME=$(ask "Repo name (folder name)" "my-project"); fi
if [ -z "$TITLE" ]; then TITLE=$(ask "Project title" "Untitled Project"); fi
if [ -z "$SUMMARY" ]; then SUMMARY=$(ask "Summary" "No summary provided"); fi
if [ -z "$PROBLEM" ]; then PROBLEM=$(ask "Problem" "Describe the problem"); fi
if [ -z "$SOLUTION" ]; then SOLUTION=$(ask "Solution" "Describe the solution"); fi
if [ -z "$TECH_STACK" ]; then TECH_STACK=$(ask "Tech stack (comma separated)" "Python, Docker, Kubernetes"); fi

IFS=',' read -ra TECH_ARRAY <<< "$TECH_STACK"

# === Create folder ===
mkdir -p "$REPO_NAME"

# === Ask for additional metadata ===
OVERVIEW_STYLES=$(ask "Overview architecture styles (comma separated)" "Event-Driven,Serverless")
OVERVIEW_COMPONENTS=$(ask "Key components (comma separated)" "API Gateway,Lambda,DynamoDB")
IFS=',' read -ra STYLES <<< "$OVERVIEW_STYLES"
IFS=',' read -ra COMPONENTS <<< "$OVERVIEW_COMPONENTS"

PROS=$(ask "Pros" "High scalability; Rapid development")
CONS=$(ask "Cons" "Complex deployment; Learning curve")

IMPACT_METRIC1_KEY=$(ask "Impact metric 1 key" "performance_gain")
IMPACT_METRIC1_VALUE=$(ask "Impact metric 1 value" "40% latency reduction")

BUSINESS_OUTCOME=$(ask "Business outcome" "Enabled real-time insights")

GITHUB=$(ask "GitHub URL" "https://github.com/example")
DEMO=$(ask "Demo URL" "https://demo.example")
DOCS=$(ask "Docs URL" "https://docs.example")

START=$(ask "Timeline start (YYYY-MM)" "2024-01")
END=$(ask "Timeline end (YYYY-MM)" "2024-06")

# === Write JSON ===
cat > "$REPO_NAME/$OUTPUT_FILE" <<EOF
{
  "\$schema": "http://json-schema.org/draft-07/schema#",
  "title": "$TITLE",
  "summary": "$SUMMARY",
  "problem": "$PROBLEM",
  "solution": "$SOLUTION",
  "tech_stack": [$(printf '"%s", ' "${TECH_ARRAY[@]}" | sed 's/, $//')],
  "overview": {
    "architecture": {
      "styles": [$(printf '"%s", ' "${STYLES[@]}" | sed 's/, $//')],
      "key_components": [$(printf '"%s", ' "${COMPONENTS[@]}" | sed 's/, $//')]
    },
    "design_patterns": []
  },
  "architecture": {
    "style": "${STYLES[0]}",
    "key_components": [$(printf '"%s", ' "${COMPONENTS[@]}" | sed 's/, $//')]
  },
  "pros": "$PROS",
  "cons": "$CONS",
  "impact": {
    "metrics": {
      "$IMPACT_METRIC1_KEY": "$IMPACT_METRIC1_VALUE"
    },
    "business_outcome": "$BUSINESS_OUTCOME"
  },
  "links": {
    "github": "$GITHUB",
    "demo": "$DEMO",
    "docs": "$DOCS"
  },
  "media": [],
  "timeline": {
    "start": "$START",
    "end": "$END"
  },
  "tags": [],
  "flow": {
    "steps": []
  }
}
EOF

echo "✅ Story JSON created: $REPO_NAME/$OUTPUT_FILE"
