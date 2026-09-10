# Ahmad Saufi — Portfolio (saufi.loxikum.xyz)

Single-page Software & AI Engineer portfolio. Next.js 15 + Payload 3 CMS (self-hosted),
served in Docker on VM2, routed by Traefik + Cloudflare Tunnel.

**Live:** https://saufi.loxikum.xyz · **Admin:** https://saufi.loxikum.xyz/admin

## Stack

- Next.js 15 (App Router) + Payload 3 embedded CMS (`db-sqlite`, file volume)
- Content (hero, services, skills, projects, experience, contact, SEO) editable at /admin
- Images upload via admin → Media collection (sharp resize: card 800², og 1536×864)
- Docker Compose behind Traefik (`Host(saufi.loxikum.xyz)`, port 3000)
- Hardened: no-new-privileges, 768M memory cap, no host ports
- v3 static site preserved at git tag `v3-static` (legacy/ folder = reference)

## Structure

```
├── src/app/(frontend)/    # public site (server components, reads CMS via Local API)
├── src/app/(payload)/     # Payload admin routes
├── src/collections/       # Projects, Experience, Services, SkillCategories, Media, Users
├── src/globals/           # SiteSettings (hero/about/contact/seo/footer)
├── src/components/        # UI + animations (particles, typewriter, tilt, count-up)
├── data/                  # RUNTIME: sqlite db + media uploads (volume, gitignored)
├── scripts/seed.mjs       # REST seeder — v3 content (idempotent)
└── Dockerfile             # multi-stage, npm ci, standalone, bundled seed
```

## Local dev

```bash
npm install
cp .env.example .env           # fill PAYLOAD_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run dev                    # http://localhost:3000 (admin pushes schema in dev)
node scripts/seed.mjs          # optional: seed v3 content + images (server must run)
```

## Deploy (VM2)

```bash
cd ~/saufi-portfolio
# .env: DOMAIN, PAYLOAD_SECRET, DATABASE_URI=file:/app/data/payload.db,
#       MEDIA_DIR=/app/data/media, NEXT_PUBLIC_SERVER_URL
git pull && docker compose up -d --build
```

First boot on empty volume: entrypoint seeds bundled `payload.db` + media.

## Update workflow

- **Content** (text, images, stats, projects): edit at `/admin` — live in <60s (ISR), no deploy
- **Code** (layout, animations, collections schema): edit → commit → push → `git pull && docker compose up -d --build`

## CI

`.github/workflows/ci.yml` — npm ci + build + smoke (`/admin` 200) on push/PR.
Frontend rendering verified at deploy (needs seeded volume).

## Backup

Copy `data/payload.db` + `data/media/` — itulah seluruh CMS content.
