#!/usr/bin/env bash
# init.sh - Initialize Symphony CLI environment
# Production-grade: strict mode, logging, flags, idempotent operations.
set -euo pipefail
IFS=$'\n\t'

LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/init.log"
MODULE_NAME="github.com/nicholas/symphony-cli"
YES=0

usage() {
  cat <<EOF
Usage: $(basename "$0") [--module <module_name>] [--yes]
  --module   Go module name to initialize (default: ${MODULE_NAME})
  --yes      Skip interactive prompts (assume yes)
EOF
}

log() {
  mkdir -p "$LOG_DIR"
  echo "$(date --iso-8601=seconds) [INIT] $*" | tee -a "$LOG_FILE"
}

parse_args() {
  while [[ ${#} -gt 0 ]]; do
    case "$1" in
      --module)
        MODULE_NAME="$2"; shift 2;;
      --yes)
        YES=1; shift;;
      -h|--help)
        usage; exit 0;;
      *)
        echo "Unknown arg: $1"; usage; exit 2;;
    esac
  done
}

ensure_go() {
  if ! command -v go >/dev/null 2>&1; then
    log "ERROR: Go not found. Please install Go (1.18+ recommended)."
    return 1
  fi
  log "Go version: $(go version)"
}

create_go_mod() {
  if [ ! -f go.mod ]; then
    log "Creating go.mod with module name: $MODULE_NAME"
    go mod init "$MODULE_NAME" | tee -a "$LOG_FILE"
  else
    log "go.mod already exists - skipping go mod init"
  fi
}

fetch_modules() {
  log "Running go mod tidy..."
  go mod tidy | tee -a "$LOG_FILE"
}

create_placeholders() {
  log "Creating placeholder files and directories..."
  mkdir -p cmd internal/scripts scripts/bash scripts/python scripts/js
  touch internal/importpaths/placeholder.txt internal/dependencies/placeholder.txt internal/workflow/placeholder.txt internal/ai/placeholder.txt
  if [ ! -f dependencies.json ]; then
    echo '{"dependencies": []}' > dependencies.json
    log "Created dependencies.json"
  else
    log "dependencies.json already exists"
  fi
  chmod -R +x scripts || true
}

main() {
  parse_args "$@"
  log "Initializing Symphony CLI environment"
  ensure_go || exit 1
  create_go_mod
  fetch_modules
  create_placeholders
  log "Initialization complete"
  echo "✅ init complete (log: $LOG_FILE)"
}

main "$@"
