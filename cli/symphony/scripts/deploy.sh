#!/usr/bin/env bash
# deploy.sh - Build Symphony CLI binary
# Supports optional target OS/ARCH and outputs to ./bin/
set -euo pipefail
IFS=$'\n\t'

LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/deploy.log"
BIN_DIR="./bin"
BIN_NAME="symphony"
TARGET_OS="${TARGET_OS:-$(uname | tr '[:upper:]' '[:lower:]')}"
TARGET_ARCH="${TARGET_ARCH:-amd64}"

usage() {
  cat <<EOF
Usage: $(basename "$0") [--os <os>] [--arch <arch>] [--clean]
  --os      Target OS (default: $TARGET_OS)
  --arch    Target architecture (default: $TARGET_ARCH)
  --clean   Remove existing ./bin and rebuild cleanly
EOF
}

log() {
  mkdir -p "$LOG_DIR"
  echo "$(date --iso-8601=seconds) [DEPLOY] $*" | tee -a "$LOG_FILE"
}

parse_args() {
  CLEAN=0
  while [[ ${#} -gt 0 ]]; do
    case "$1" in
      --os)
        TARGET_OS="$2"; shift 2;;
      --arch)
        TARGET_ARCH="$2"; shift 2;;
      --clean)
        CLEAN=1; shift;;
      -h|--help)
        usage; exit 0;;
      *)
        echo "Unknown arg: $1"; usage; exit 2;;
    esac
  done
}

build_binary() {
  mkdir -p "$BIN_DIR"
  OUTPUT="$BIN_DIR/$BIN_NAME"
  if [ "$CLEAN" -eq 1 ]; then
    log "Cleaning existing binary"
    rm -rf "$BIN_DIR"
    mkdir -p "$BIN_DIR"
  fi
  log "Building for $TARGET_OS/$TARGET_ARCH -> $OUTPUT"
  env GOOS="$TARGET_OS" GOARCH="$TARGET_ARCH" go build -o "$OUTPUT" ./... 2>&1 | tee -a "$LOG_FILE"
  chmod +x "$OUTPUT"
  log "Build complete: $OUTPUT"
}

main() {
  parse_args "$@"
  log "Starting deploy"
  build_binary
  log "Deploy finished"
  echo "✅ deploy complete (log: $LOG_FILE)"
}

main "$@"
