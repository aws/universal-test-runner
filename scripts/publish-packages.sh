#!/usr/bin/env bash

set -e

[[ -n "$(git status --porcelain)" ]] && echo "Cannot publish with uncommitted changes!" && exit 1

[[ "$(git branch --show-current)" != "main" ]] && echo "Must be on main branch to publish!" && exit 1

git fetch --tags origin

[[ "$(git rev-parse main)" != "$(git rev-parse origin/main)" ]] \
  && echo "Current main branch commit does not match origin/main! Run 'git pull origin main' to update." && exit 1

# TODO: verify that last build on GitHub succeeded

npm run clean
npm run compile
npm run bump:release

npm login

# You may have to enter an OTP for every single publish here
npm publish --workspaces --access public

git push --tags origin main
