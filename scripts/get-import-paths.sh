#!/usr/bin/env bash

# Folder to scan (default to current dir)
FOLDER="${1:-.}"

# Recursively find all .js files
find "$FOLDER" -type f -name "*.js" | sort | while read -r file; do
    # Convert path to relative path (optional: strip leading ./)
    rel_path="${file#./}"

    # Output declarative import statement
    echo "import '$rel_path';"
done
``