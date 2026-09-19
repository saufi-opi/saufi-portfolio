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
  has_table() { sqlite3 "$DB" "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='$1';" | grep -q '^1$'; }
  ALTERS=''
  # Blog feature: existing volumes predate the posts collection — create its
  # tables FIRST so later has_col checks (posts.hide_cover) don't fail under
  # `set -e` when the table doesn't exist yet.
  if ! has_table posts; then
    echo "[entrypoint] applying blog migration"
    sqlite3 "$DB" < /app/scripts/migrate-blog.sql
  fi
  # Blog + analytics rels columns: volumes seeded from older bundled seeds
  # predate posts_id/page_views_id on the polymorphic rels table. The admin
  # panel queries this table on every load and 500s without them (real
  # 2026-09-19: digest 2262852728). Only patch when the table already exists —
  # a missing table means the app initializes fresh schema on boot.
  if has_table payload_locked_documents_rels; then
    has_col "$DB" payload_locked_documents_rels posts_id      || ALTERS="$ALTERS ALTER TABLE payload_locked_documents_rels ADD COLUMN posts_id integer;"
    has_col "$DB" payload_locked_documents_rels page_views_id || ALTERS="$ALTERS ALTER TABLE payload_locked_documents_rels ADD COLUMN page_views_id integer;"
  fi
  has_col "$DB" projects size            || ALTERS="$ALTERS ALTER TABLE projects ADD COLUMN size TEXT DEFAULT NULL;"

  has_col "$DB" site_settings projects_layout_layout           || ALTERS="$ALTERS ALTER TABLE site_settings ADD COLUMN projects_layout_layout TEXT NOT NULL DEFAULT 'bento';"
  has_col "$DB" site_settings projects_layout_columns_desktop  || ALTERS="$ALTERS ALTER TABLE site_settings ADD COLUMN projects_layout_columns_desktop REAL NOT NULL DEFAULT 2;"
  has_col "$DB" site_settings projects_layout_columns_tablet   || ALTERS="$ALTERS ALTER TABLE site_settings ADD COLUMN projects_layout_columns_tablet REAL NOT NULL DEFAULT 2;"
  has_col "$DB" site_settings projects_layout_columns_mobile   || ALTERS="$ALTERS ALTER TABLE site_settings ADD COLUMN projects_layout_columns_mobile REAL NOT NULL DEFAULT 1;"
  has_col "$DB" site_settings blog_title || ALTERS="$ALTERS ALTER TABLE site_settings ADD COLUMN blog_title TEXT;"
  has_col "$DB" site_settings blog_subtitle || ALTERS="$ALTERS ALTER TABLE site_settings ADD COLUMN blog_subtitle TEXT;"
  has_col "$DB" posts hide_cover || ALTERS="$ALTERS ALTER TABLE posts ADD COLUMN hide_cover INTEGER DEFAULT false;"
  has_col "$DB" site_settings blog_cover_height || ALTERS="$ALTERS ALTER TABLE site_settings ADD COLUMN blog_cover_height REAL;"
  has_col "$DB" site_settings blog_content_width || ALTERS="$ALTERS ALTER TABLE site_settings ADD COLUMN blog_content_width REAL;"
  if [ -n "$ALTERS" ]; then
    echo "[entrypoint] applying layout migration"
    sqlite3 "$DB" "$ALTERS"
  fi
  # Analytics feature: volumes predating page-views analytics — create its table once.
  if ! has_table page_views; then
    echo "[entrypoint] applying analytics migration"
    sqlite3 "$DB" < /app/scripts/migrate-analytics.sql
  fi
fi

# sqlite needs write access; volume may be owned by host uid (1000)
chown -R nextjs:nodejs /app/data 2>/dev/null || true

exec node server.js
