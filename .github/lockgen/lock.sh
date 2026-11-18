#!/usr/bin/env bash
# Temporaer: erzeugt das Lockfile in CI (wird vor dem Merge entfernt).
set -euo pipefail
npm update --package-lock-only --ignore-scripts --save-exact=false --save-prefix='^'
