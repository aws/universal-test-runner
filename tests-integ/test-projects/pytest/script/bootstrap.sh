#!/bin/bash

set -e

VENV="venv"

test -d $VENV || python3 -m venv $VENV || return
$VENV/bin/pip install -r requirements.txt

. $VENV/bin/activate
