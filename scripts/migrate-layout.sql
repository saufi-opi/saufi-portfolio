-- Idempotent-ish: guarded by the entrypoint's pragma checks; each ALTER runs at most once.
ALTER TABLE projects ADD COLUMN size TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE site_settings ADD COLUMN projects_layout_layout TEXT NOT NULL DEFAULT 'bento';
ALTER TABLE site_settings ADD COLUMN projects_layout_columns_desktop REAL NOT NULL DEFAULT 2;
ALTER TABLE site_settings ADD COLUMN projects_layout_columns_tablet REAL NOT NULL DEFAULT 2;
ALTER TABLE site_settings ADD COLUMN projects_layout_columns_mobile REAL NOT NULL DEFAULT 1;
