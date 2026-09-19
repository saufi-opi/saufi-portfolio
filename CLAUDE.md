# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev                # dev server (turbopack) — admin auto-pushes schema to ./data/payload.db
node scripts/seed.mjs      # seed content via REST against a RUNNING server (SEED_URL env overrides URL)
npm run build              # production build (needs data/ dir to exist; CI creates an empty one)
npm run start              # next start (warns: project uses output:'standalone' — prefer node .next/standalone/server.js)
npm run generate:types     # payload-types.ts (gitignored; frontend uses hand-written types instead)
node scripts/push-schema.mjs  # drizzle dev-push schema to sqlite (used for fresh volumes)
node scripts/dev-fake-posts.mjs  # dev-only: create 20 fake posts for layout/pagination testing
```

No lint or test framework is configured. CI (`.github/workflows/ci.yml`): npm ci → build with placeholder env → smoke test (`/admin` must return 200; `/` returning 500 is expected on CI's unseeded DB).

## Architecture

Next.js 15 (App Router) + Payload 3 embedded CMS on SQLite (`@payloadcms/db-sqlite`, file at `data/payload.db`). Single portfolio page plus a blog, all content managed in the Payload admin.

**Two Payload configs** — `src/payload.config.ts` (the real one) and `scripts/payload-config.ts` (used by `scripts/push-schema.mjs`). New collections must be registered in **both** or schema-push tooling drifts.

**Data flow**: `(frontend)` server components never fetch over HTTP — they use the Payload **Local API** through helpers in `src/lib/data.ts` (`getSettings`, `getProjects`, `getPosts`, `getPostBySlug`, …). Types there are hand-written (`ProjectDoc`, `PostDoc`, `Settings`…) with `as unknown as` casts; do not wait for `payload-types.ts`.

**Route groups** under `src/app/`:
- `(frontend)/` — public site. `layout.tsx` renders Nav + Footer + ScrollReveal; `page.tsx` is the single-page portfolio (Hero/Services/About/Projects/Timeline/Contact sections); `blog/` has list + `[slug]` pages.
- `(payload)/` — Payload admin routes.

**Content model** (all in `src/collections/`, `src/globals/SiteSettings.ts`):
- Every public collection uses `access: { read: () => true }` (auth still gates writes), a `published` checkbox, and most use an `order` number for sorting. Posts instead sort by `publishedAt` desc.
- Rich text is Lexical (configured globally in payload.config.ts); render with `RichText` from `@payloadcms/richtext-lexical/react`. Seed scripts must construct valid serialized lexical JSON (see helpers in `scripts/seed.mjs` / `dev-fake-posts.mjs`).
- Site settings live in one `site-settings` global with tabs; blog title/subtitle/cover-height/content-width are configurable there.

**Styling**: hand-written CSS only — `src/app/globals.css` with `:root` tokens (ink/cream surfaces, lime accent; spacing `--s-*`, radii `--r-*`). Reuse existing classes (`.container`, `.card`, `.card--light`, `.pill`, `.tag`, `.section-header`, `.micro-label`, `.fade-in`) instead of adding utility frameworks. No Tailwind.

**Nav**: `src/components/Nav.tsx` is a client component with hardcoded `LINKS`. Homepage anchors use `/#section` form (so they work from sub-routes); scroll-spy stores the same `/#…` shape and only runs on the homepage — on sub-routes the route link is highlighted instead. A bare `<nav>` tag anywhere else in the DOM will be caught by the global `nav { position: fixed }` CSS rule — use `<div role="navigation">` for non-header navs.

## Deployment constraints (SQLite + Docker)

- **Prod volumes never get schema pushed.** `@payloadcms/db-sqlite` only creates tables when the DB file is fresh. Schema changes for existing deployments need hand-written SQL in the entrypoint's idempotent-guard pattern: add `has_col`/`has_table` pragma checks to `scripts/docker-entrypoint.sh` (note: `has_table` takes only the table name; `has_col` takes db, table, column) plus raw DDL captured from a real dev-pushed DB (`sqlite3 data/payload.db ".schema <table>"` — never guess drizzle column names). Existing examples: `scripts/migrate-layout.sql`, `scripts/migrate-blog.sql`; the Dockerfile must COPY any new migration into the runner stage.
- **Seeding** is REST-based against a running server (`scripts/seed.mjs`), idempotent via `totalDocs === 0` checks. Media upload uses multipart with a `_payload` JSON-string field.
- `data/` (sqlite DB + media) is the entire CMS state, gitignored, volume-mounted. Backup = copy it.
- `NEXT_PUBLIC_SERVER_URL` must match the origin the admin is served from or admin POSTs fail CSRF with "Unauthorized" (local dev fallbacks to port 3001 if 3000 is taken — set it in `.env`).

## Pages and rendering

- All frontend pages export `dynamic = 'force-dynamic'` + `revalidate = 60` deliberately: CI has no seeded DB, so nothing may be prerendered at build time (no `generateStaticParams` on dynamic routes).
- Scroll-reveal animations: `.fade-in` elements start at `opacity: 0` and are only made visible by the `ScrollReveal` client component (rendered in `(frontend)/layout.tsx`). Any page missing it renders blank content.
- Images: plain `<img>` with Payload media URLs (`/api/media/file/...`, allowed via `next.config.ts` localPatterns).

## Language note

Admin field descriptions and some README content are in Malay; code comments and UI copy are in English.
