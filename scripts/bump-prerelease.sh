#!/usr/bin/env bash

set -e

[[ -z "$PRERELEASE_VERSION" ]] && echo "PRERELEASE_VERSION must be specified!" && exit 1

echo "Bumping all packages to version $PRERELEASE_VERSION"

npm version $PRERELEASE_VERSION --workspaces --no-workspaces-update --include-workspace-root --no-git-tag-version

npx ts-node ./scripts/update-dependency-versions

FILES_WITH_AWS_SCOPE=$(grep -l -R @aws --exclude="*node_modules*" --exclude="*dist*" ./packages)

echo "Found the following files with @aws scope: $FILES_WITH_AWS_SCOPE"

# Replace all usage of aws scope with sentinel-internal in order to publish
# prereleases to internal CodeArtifact registry for testing purposes.
npx ts-node ./scripts/replace-aws-scope.ts $FILES_WITH_AWS_SCOPE

echo "Done."
