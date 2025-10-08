#!/usr/bin/env bash
# symphony-wrapper.sh - self-initializing wrapper to run the symphony CLI
# If running for the first time (no dependencies.json), it will run init.sh automatically.
set -euo pipefail
IFS=$'\n\t'

LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/wrapper.log"

log() {
  mkdir -p "$LOG_DIR"
  echo "$(date --iso-8601=seconds) [WRAPPER] $*" | tee -a "$LOG_FILE"
}

ensure_initialized() {
  if [ ! -f dependencies.json ]; then
    log "First-run: dependencies.json missing - initializing..."
    if [ -x ./init.sh ]; then
      ./init.sh --yes | tee -a "$LOG_FILE"
    else
      log "ERROR: init.sh not found or not executable."
      exit 1
    fi
  fi
}

find_binary() {
  # If globally installed, prefer that. Otherwise use local ./bin/symphony
  if command -v symphony >/dev/null 2>&1; then
    echo "$(command -v symphony)"
    return 0
  fi
  if [ -x ./bin/symphony ]; then
    echo "./bin/symphony"
    return 0
  fi
  log "ERROR: symphony binary not found. Run deploy.sh to build it."
  return 1
}

main() {
  ensure_initialized
  BIN=$(find_binary) || exit 1
  log "Executing: $BIN $*"
  exec "$BIN" "$@"
}

main "$@"
