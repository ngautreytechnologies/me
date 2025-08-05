#!/bin/bash

set -e

DIST_DIR="dist"
BRANCH="gh-pages"
TEMP_DIR=$(mktemp -d)
REPO_URL=$(git config --get remote.origin.url)

echo "🚀 Deploying $DIST_DIR to GitHub Pages..."

if [ ! -d "$DIST_DIR" ]; then
  echo "❌ Error: $DIST_DIR does not exist. Run build.sh first."
  exit 1
fi

git clone --depth=1 "$REPO_URL" "$TEMP_DIR"
cd "$TEMP_DIR"
git checkout --orphan "$BRANCH"
git rm -rf . > /dev/null 2>&1

cp -r "../$DIST_DIR"/. .
touch .nojekyll

git add .
git commit -m "Deploy minified site to GitHub Pages"
git push --force origin "$BRANCH"

cd ..
rm -rf "$TEMP_DIR"

echo "✅ Deployment complete!"
