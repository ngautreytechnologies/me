#!/usr/bin/env bash
# deploy-register.sh - Convenience script to build and install globally/user-local
set -euo pipefail
IFS=$'\n\t'

LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/deploy-register.log"

log() {
  mkdir -p "$LOG_DIR"
  echo "$(date --iso-8601=seconds) [DEPLOY-REGISTER] $*" | tee -a "$LOG_FILE"
}

main() {
  log "Starting combined deploy+register"
  ./deploy.sh "$@"
  ./register.sh "$@"
  log "Combined deploy+register finished"
  echo "✅ deploy+register complete (log: $LOG_FILE)"
}

main "$@"
