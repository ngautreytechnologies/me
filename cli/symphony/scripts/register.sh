#!/usr/bin/env bash
# register.sh - Install Symphony CLI binary globally (or to user-local bin)
set -euo pipefail
IFS=$'\n\t'

LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/register.log"
BIN_SRC="./bin/symphony"
DEFAULT_GLOBAL="/usr/local/bin/symphony"
DEFAULT_USER="$HOME/.local/bin/symphony"
PREFIX=""
FORCE=0

usage() {
  cat <<EOF
Usage: $(basename "$0") [--prefix <path>] [--force]
  --prefix  Install prefix (default: /usr/local/bin, falls back to ~/.local/bin)
  --force   Overwrite existing binary without prompt
EOF
}

log() {
  mkdir -p "$LOG_DIR"
  echo "$(date --iso-8601=seconds) [REGISTER] $*" | tee -a "$LOG_FILE"
}

parse_args() {
  while [[ ${#} -gt 0 ]]; do
    case "$1" in
      --prefix)
        PREFIX="$2"; shift 2;;
      --force)
        FORCE=1; shift;;
      -h|--help)
        usage; exit 0;;
      *)
        echo "Unknown arg: $1"; usage; exit 2;;
    esac
  done
}

choose_destination() {
  if [ -n "$PREFIX" ]; then
    DEST="$PREFIX/symphony"
  else
    if [ -w "/usr/local/bin" ] 2>/dev/null; then
      DEST="$DEFAULT_GLOBAL"
    else
      mkdir -p "$HOME/.local/bin"
      DEST="$DEFAULT_USER"
    fi
  fi
  echo "$DEST"
}

install_binary() {
  if [ ! -f "$BIN_SRC" ]; then
    log "ERROR: binary not found at $BIN_SRC. Please run deploy.sh first."
    exit 1
  fi
  DEST=$(choose_destination)
  if [ -f "$DEST" ] && [ "$FORCE" -ne 1 ]; then
    read -p "$DEST exists. Overwrite? [y/N]: " ans
    case "$ans" in
      [Yy]* ) ;;
      * ) log "Aborting."; exit 0;;
    esac
  fi
  log "Installing $BIN_SRC -> $DEST"
  if [[ "$DEST" == "/usr/local/bin/symphony" ]]; then
    sudo cp "$BIN_SRC" "$DEST"
    sudo chmod 755 "$DEST"
  else
    cp "$BIN_SRC" "$DEST"
    chmod 755 "$DEST"
  fi
  log "Installation complete: $DEST"
}

main() {
  parse_args "$@"
  log "Starting register"
  install_binary
  echo "✅ register complete (log: $LOG_FILE)"
}

main "$@"
