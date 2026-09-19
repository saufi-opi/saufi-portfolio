-- Analytics feature migration: creates the `page_views` collection table for
-- deployments predating it. @payloadcms/db-sqlite does NOT auto-push schema in
-- NODE_ENV=production, so the entrypoint applies this idempotently when the
-- page_views table is absent. DDL captured from a real dev-pushed schema
-- (sqlite3 .schema page_views equivalent — do not hand-edit column names).
CREATE TABLE `page_views` (
	`id` integer PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`day` text NOT NULL,
	`dedupe_key` text NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
CREATE INDEX `page_views_path_idx` ON `page_views` (`path`);
CREATE UNIQUE INDEX `page_views_dedupe_key_idx` ON `page_views` (`dedupe_key`);
CREATE INDEX `page_views_updated_at_idx` ON `page_views` (`updated_at`);
CREATE INDEX `page_views_created_at_idx` ON `page_views` (`created_at`);
