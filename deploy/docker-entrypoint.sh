#!/bin/sh
set -e

if [ "${SKIP_DB_MIGRATE:-false}" != "true" ]; then
  echo "Running Prisma migrations..."
  node node_modules/prisma/build/index.js migrate deploy
fi

echo "Starting Naksharix..."
exec node server.js
