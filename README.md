# Ahmad Saufi — Portfolio (saufi.loxikum.xyz)

Single-page developer portfolio. Plain HTML/CSS/JS (no framework, no build step),
served by nginx in Docker, routed by Traefik + Cloudflare Tunnel.

**Live:** https://saufi.loxikum.xyz

## Stack

- nginx:alpine (static serve, 7d asset cache)
- Docker Compose behind Traefik (`traefik-public` network, Host rule `saufi.loxikum.xyz`)
- Hardened: no-new-privileges, 128M memory cap, no host ports

## Structure

```
├── index.html          # the whole site (inline CSS/JS, Google Fonts CDN)
├── assets/             # images
├── nginx.conf          # server block + cache headers
├── Dockerfile          # nginx:alpine + static files
└── docker-compose.yml  # Traefik labels + security opts
```

## Deploy (VM2)

```bash
cd ~/saufi-portfolio
cp .env.example .env          # DOMAIN=loxikum.xyz
docker compose up -d --build
```

## Update

```bash
cd ~/saufi-portfolio && git pull && docker compose up -d --build
```

## CI

`.github/workflows/ci.yml` builds the image on every push — deploys stay gated
on a green build.
