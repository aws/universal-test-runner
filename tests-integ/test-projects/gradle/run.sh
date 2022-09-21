#!/usr/bin/env bash

set -e

# Make sure gradle will run the tests even if they're "up-to-date"
gradle cleanTest

eval "$RUN_TESTS gradle"
