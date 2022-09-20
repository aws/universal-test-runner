#!/usr/bin/env bash

set -e

. ./venv/bin/activate

eval "$RUN_TESTS pytest"
