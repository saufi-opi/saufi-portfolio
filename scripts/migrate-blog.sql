-- Blog feature migration: creates the `posts` collection tables for deployments
-- predating it. @payloadcms/db-sqlite does NOT auto-push schema in NODE_ENV=production,
-- so the entrypoint applies this idempotently when the posts table is absent.
-- DDL captured from a real dev-pushed schema (do not hand-edit column names).
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text,
	`excerpt` text NOT NULL,
	`cover_id` integer,
	`cover_alt` text,
	`content` text,
	`author` text DEFAULT 'Ahmad Saufi',
	`published_at` text,
	`published` integer DEFAULT true,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`cover_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE UNIQUE INDEX `posts_slug_idx` ON `posts` (`slug`);
CREATE INDEX `posts_cover_idx` ON `posts` (`cover_id`);
CREATE INDEX `posts_updated_at_idx` ON `posts` (`updated_at`);
CREATE INDEX `posts_created_at_idx` ON `posts` (`created_at`);
CREATE TABLE `posts_tags` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`tag` text NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX `posts_tags_order_idx` ON `posts_tags` (`_order`);
CREATE INDEX `posts_tags_parent_id_idx` ON `posts_tags` (`_parent_id`);
