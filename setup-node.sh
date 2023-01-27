#!/usr/bin/env bash

# Can't use `set -e` here when running in buildpack-deps docker image,
# possibly related to https://github.com/nvm-sh/nvm/issues/1985
# set -e

# Used to install the right Node.js (and NPM) version when running in some CI
# environments When installing Node.js in your local dev env, use the
# instructions in the NVM README:
# https://github.com/nvm-sh/nvm#installing-and-updating

echo "Installing nvm..."

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | PROFILE=/dev/null bash

echo "Initializing nvm..."

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" --no-use  # This loads nvm

echo "Installing Node.js..."

nvm install

echo "Done."
