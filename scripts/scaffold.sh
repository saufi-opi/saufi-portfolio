#!/bin/bash
# Phase 0.2: Scaffold Next 15 + Payload 3 in existing repo (no create-next-app; manual structure)
set -e
cd /home/appsadmin/saufi-cms
export PATH=$HOME/.local/bin:$PATH
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# keep only what we need from the static site
mkdir -p legacy
git mv index.html nginx.conf legacy/ 2>/dev/null || { cp index.html nginx.conf legacy/ && git rm -q --cached index.html nginx.conf; }
mv assets legacy/assets-v3

cat > package.json <<'EOF'
{
  "name": "saufi-portfolio",
  "version": "4.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "seed": "tsx src/seed.ts",
    "generate:types": "payload generate:types"
  }
}
EOF

pnpm add next@15 react react-dom 2>&1 | tail -2
pnpm add payload @payloadcms/next @payloadcms/db-sqlite @payloadcms/richtext-lexical graphql sharp 2>&1 | tail -2
pnpm add -D typescript @types/node @types/react @types/react-dom tsx 2>&1 | tail -2
echo "--- versions ---"
node -e "const p=require('./package.json'); console.log(JSON.stringify({...p.dependencies, ...p.devDependencies}, null, 1))"
echo SCAFFOLD-DONE
