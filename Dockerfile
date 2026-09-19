# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV PAYLOAD_SECRET=build-placeholder
ENV DATABASE_URI=file:./data/build-placeholder.db
ENV MEDIA_DIR=data/build-media
# build needs ./data to exist; the SEEDED db (repo data/) is preserved separately for first-boot
# (data/ is gitignored — in CI fresh checkouts it's absent, so seed an EMPTY dir; entrypoint's
# `-s` check skips seeding an empty dir and the app initializes its own schema on boot)
RUN cp -r data /app/seed-data 2>/dev/null || mkdir -p /app/seed-data; \
    rm -rf data && mkdir -p data && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache sqlite && addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# libsql resolves its platform binary dynamically at runtime — copy ALL @libsql platform
# packages from deps (alpine npm ci installed linux-x64-musl there)
COPY --from=deps /app/node_modules/@libsql ./node_modules/@libsql
COPY --from=deps /app/node_modules/libsql ./node_modules/libsql
# Bundled seed (schema + content + admin + media) for first-boot volume init
COPY --from=build /app/seed-data /app/seed
COPY scripts/docker-entrypoint.sh /usr/local/bin/entrypoint.sh
COPY scripts/migrate-layout.sql /app/scripts/migrate-layout.sql
COPY scripts/migrate-blog.sql /app/scripts/migrate-blog.sql
RUN chmod +x /usr/local/bin/entrypoint.sh && mkdir -p /app/data && chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
