#!/bin/sh
# Entrypoint: seed volume on first boot, then start server.
set -e

if [ ! -s /app/data/payload.db ]; then
  echo "[entrypoint] first boot — seeding sqlite db + media to volume"
  mkdir -p /app/data/media
  cp /app/seed/payload.db /app/data/payload.db
  cp -r /app/seed/media/. /app/data/media/ 2>/dev/null || true
  chown -R nextjs:nodejs /app/data
  echo "[entrypoint] seeded"
fi

exec node server.js
