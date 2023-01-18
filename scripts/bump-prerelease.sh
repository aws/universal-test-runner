#!/usr/bin/env bash

set -e

[[ -z "$PRERELEASE_VERSION" ]] && echo "PRERELEASE_VERSION must be specified!" && exit 1

echo "Bumping all packages to version $PRERELEASE_VERSION"

npm version $PRERELEASE_VERSION --workspaces --no-workspaces-update --no-git-tag-version

npx ts-node ./scripts/update-dependency-versions

echo "Replacing all usage of @aws scope with @sentinel-internal..."

# Replace all usage of aws scope with sentinel-internal in order to publish
# prereleases to internal CodeArtifact registry for testing purposes.
# Note that a space is required after -i on some systems, e.g. `sed -i '' -e ...`
sed -i'' -e 's/@sentinel-internal/@sentinel-internal/g' $(grep -l -R @sentinel-internal --exclude="*node_modules*" --exclude="*dist*" .)

echo "Done."
