#!/usr/bin/env bash

set -e

[[ -n "$(git status --porcelain)" ]] && echo "Cannot run version bump when there are uncommitted changes!" && exit 1

[[ -z "$WHAT_BUMP" ]] && echo "WHAT_BUMP must be specified! (e.g. major, minor, patch)" && exit 1

echo "Bumping all packages with increment $WHAT_BUMP..."

npm version $WHAT_BUMP --workspaces --include-workspace-root --no-git-tag-version

npx ts-node ./scripts/update-dependency-versions

# Make sure to update the package-lock after all the package versions changed
npm install --userconfig=/dev/null
# Have to run it twice because npm is whack and will update the package-lock
# to contain the old versions of the packages from the registry.
# Another install fixes that ¯\_(ツ)_/¯
npm install --userconfig=/dev/null

NEW_VERSION=$(node -e "console.log(require('./package.json').version)")

echo "Committing all version updates.."
git commit -a --no-verify -m "$NEW_VERSION"

echo "Creating git tag for version $NEW_VERSION..."
git tag -a -m "$NEW_VERSION" $NEW_VERSION

echo "Done."
