# Symphony CLI - PolyGlot Script House

This archive contains production-grade shell scripts for managing the Symphony CLI lifecycle:
- init.sh: initialize environment (go mod, placeholders, dependencies.json)
- deploy.sh: build binary to ./bin/
- register.sh: install binary globally or to user-local
- deploy-register.sh: convenience wrapper to deploy then register
- symphony-wrapper.sh: self-initializing wrapper that runs init on first execution

Features:
- Strict shell mode (set -euo pipefail)
- Logging to ./logs/*.log with timestamps
- Flags and usage info
- Idempotent operations where reasonable
- Support for user-local installation if no permission to /usr/local/bin

Usage examples:
  bash init.sh --module github.com/you/symphony-cli
  bash deploy.sh --os linux --arch amd64
  bash register.sh --force
  bash deploy-register.sh
  ./symphony-wrapper.sh dependencies import-paths scan
