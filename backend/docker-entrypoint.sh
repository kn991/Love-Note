#!/bin/sh
# Apply database migrations before serving. The DB is guaranteed reachable
# because compose gates the backend on the db healthcheck.
set -e

echo "[entrypoint] applying database migrations…"
flask --app wsgi db upgrade

echo "[entrypoint] starting: $*"
exec "$@"
