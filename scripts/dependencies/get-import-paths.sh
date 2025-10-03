#!/usr/bin/env bash
# live-update-index.sh
# Generate index.js, preview changes, and optionally overwrite
# Assumes globals.js and config.js are single files at project root

GENERATED=$(mktemp)

{
  echo "// Auto-generated index.js"
  echo ""

  # ----- Globals -----
  echo "// ----- Globals -----"
  [ -f "./globals.js" ] && echo "import './globals.js';"
  [ -f "./config.js" ] && echo "import './config.js';"
  echo ""

  # ----- Core Modules -----
  echo "// ----- Core Modules -----"
  find ./modules -type f \( -name "*.js" -o -name "*.ts" \) | sort | while read f; do
    echo "import './${f#./}';"
  done
  echo ""

  # ----- Styles -----
  echo "// ----- Styles -----"
  find ./styles -type f \( -name "*.js" -o -name "*.ts" -o -name "*.css" \) | sort | while read f; do
    echo "import './${f#./}';"
  done
  echo ""

  # ----- Components -----
  echo "// ----- Components -----"
  echo "// Base components first"
  find ./components -maxdepth 1 -type f \( -name "*.js" -o -name "*.ts" \) | sort | while read f; do
    echo "import './${f#./}';"
  done
  find ./components -type f \( -name "base-*.js" -o -name "base-*.ts" \) | sort | while read f; do
    echo "import './${f#./}';"
  done
  echo ""
  echo "// Feature components"
  find ./components -type f \( -name "*.js" -o -name "*.ts" \) ! -name "base-*.js" ! -name "base-*.ts" | sort | while read f; do
    echo "import './${f#./}';"
  done
} > "$GENERATED"

# ----- Show diff -----
if cmp -s "$GENERATED" index.js; then
  echo "index.js is already up-to-date."
  rm "$GENERATED"¬
  exit 0
else
  echo "Differences detected between current index.js and generated imports:"
  diff -u index.js "$GENERATED"
  echo
  read -p "Overwrite index.js with generated imports? [y/N] " answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    mv "$GENERATED" index.js
    echo "index.js has been updated."
  else
    echo "Aborted. index.js not changed."
    rm "$GENERATED"
  fi
fi
