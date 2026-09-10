#!/bin/sh
# Entrypoint: seed volume on first boot + fix perms, then start server.
set -e

if [ ! -s /app/data/payload.db ]; then
  echo "[entrypoint] first boot — seeding sqlite db + media to volume"
  mkdir -p /app/data/media
  cp /app/seed/payload.db /app/data/payload.db
  cp -r /app/seed/media/. /app/data/media/ 2>/dev/null || true
  echo "[entrypoint] seeded"
fi

# sqlite needs write access; volume may be owned by host uid (1000)
chown -R nextjs:nodejs /app/data 2>/dev/null || true

exec node server.js
