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

# Schema migration for deployments predating the projects-layout feature.
# @payloadcms/db-sqlite does NOT auto-push schema in NODE_ENV=production, so add
# missing columns here, idempotently, before the server opens the DB.
DB=/app/data/payload.db
if [ -s "$DB" ] && command -v sqlite3 >/dev/null 2>&1; then
  has_col() { sqlite3 "$DB" "SELECT COUNT(*) FROM pragma_table_info('$2') WHERE name='$3';" | grep -q '^1$'; }
  ALTERS=''
  has_col "$DB" projects size            || ALTERS="$ALTERS ALTER TABLE projects ADD COLUMN size TEXT NOT NULL DEFAULT 'normal';"
  has_col "$DB" site_settings projects_layout_layout           || ALTERS="$ALTERS ALTER TABLE site_settings ADD COLUMN projects_layout_layout TEXT NOT NULL DEFAULT 'bento';"
  has_col "$DB" site_settings projects_layout_columns_desktop  || ALTERS="$ALTERS ALTER TABLE site_settings ADD COLUMN projects_layout_columns_desktop REAL NOT NULL DEFAULT 2;"
  has_col "$DB" site_settings projects_layout_columns_tablet   || ALTERS="$ALTERS ALTER TABLE site_settings ADD COLUMN projects_layout_columns_tablet REAL NOT NULL DEFAULT 2;"
  has_col "$DB" site_settings projects_layout_columns_mobile   || ALTERS="$ALTERS ALTER TABLE site_settings ADD COLUMN projects_layout_columns_mobile REAL NOT NULL DEFAULT 1;"
  if [ -n "$ALTERS" ]; then
    echo "[entrypoint] applying layout migration"
    sqlite3 "$DB" "$ALTERS"
  fi
fi

# sqlite needs write access; volume may be owned by host uid (1000)
chown -R nextjs:nodejs /app/data 2>/dev/null || true

exec node server.js
