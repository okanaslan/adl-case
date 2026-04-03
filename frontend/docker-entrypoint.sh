#!/bin/sh
set -eu

if [ ! -d "/app/node_modules" ] || [ -z "$(ls -A /app/node_modules 2>/dev/null || true)" ]; then
  echo "Installing frontend dependencies (npm ci)…"
  cd /app
  npm ci
fi

exec "$@"

