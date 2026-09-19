#!/usr/bin/env node
/* Seed Payload via REST API against a running dev/prod server. Plain JS, no build step. */
const BASE = process.env.SEED_URL || 'http://localhost:3000'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'saufi@local.dev'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'local-dev-only-1234'
import fs from 'node:fs'
import path from 'node:path'

const v3 = {
  heroRoles: ['SOFTWARE & AI ENGINEER', 'FULL-STACK DEVELOPER', 'RAG PIPELINE BUILDER', 'AGENTIC AI TINKERER'],
  heroBody:
    'I build intelligent systems and the web apps around them — RAG pipelines, agentic AI workflows, and full-stack products with React, Node.js, Python and cloud infrastructure.',
  heroChip: 'Software & AI Engineer @ MCMC',
  heroCred: '3+ years shipping web apps · RAG · Agentic AI · React · Node.js · Python · Docker',
  about: [
    "I'm a software & AI engineer based in Malaysia with 3+ years of experience building web applications. Currently a Software Engineer at MCMC, where I lead development using React, Node.js, and Django Rest Framework — with CI/CD pipelines, containerization, and on-prem deployment.",
    'Beyond the full-stack work, I build applied AI systems: production RAG platforms with multi-worker document parsing, agentic workflows, and self-hosted LLM infrastructure. I care about clean code, performance, and shipping things that actually work.',
  ],
  stats: [
    { num: 3, suffix: '+', label: 'Years Experience' },
    { num: 2, suffix: '', label: 'Companies' },
    { num: 20, suffix: '+', label: 'Technologies' },
  ],
  email: 'a.saufi.contact@gmail.com',
  github: 'https://github.com/saufi-opi',
  linkedin: 'https://linkedin.com/in/ahmad-saufi-mohamad',
}

async function api(method, path, { token, json, form } = {}) {
  const headers = {}
  if (token) headers.Authorization = `JWT ${token}`
  let body
  if (json) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(json) }
  if (form) body = form
  const res = await fetch(BASE + path, { method, headers, body })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = text }
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 300)}`)
  return data
}

async function uploadMedia(token, filePath, alt) {
  const form = new FormData()
  const buf = fs.readFileSync(filePath)
  const blob = new Blob([buf], { type: 'image/jpeg' })
  form.append('file', blob, path.basename(filePath))
  // Payload 3 REST: non-file fields must be sent as a _payload JSON string
  form.append('_payload', JSON.stringify({ alt }))
  const res = await fetch(BASE + '/api/media', {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: form,
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = text }
  if (!res.ok) throw new Error(`upload ${filePath} -> ${res.status}: ${text.slice(0, 300)}`)
  return data.doc
}

async function main() {
  // 1. auth — login, or first-register if no user exists
  let token
  try {
    const login = await api('POST', '/api/users/login', { json: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } })
    token = login.token
    console.log('seed: logged in as', ADMIN_EMAIL)
  } catch {
    const reg = await api('POST', '/api/users/first-register', { json: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } })
    token = reg.token
    console.log('seed: first admin registered:', ADMIN_EMAIL)
  }

  // 2. media
  const assetsDir = process.env.SEED_ASSETS || path.resolve(process.cwd(), 'legacy/assets-v3')
  const images = {
    'hero-ai.jpg': 'Neural network sphere with orbiting rings, lime on charcoal',
    'proj-rag.jpg': 'Documents flowing through a pipeline into a vector database cube',
    'proj-canopy.jpg': 'Smartphone under a glowing hexagonal canopy dome',
    'proj-pdfhero.jpg': 'Stack of document pages with lime spark trail',
    'proj-jom.jpg': '3D calendar with location pins and connected avatars',
    'og-cover.jpg': 'Neural network waves banner, wide 16:9',
  }
  const media = await api('GET', '/api/media?limit=20&depth=0', { token })
  const mediaIds = {}
  if (media.totalDocs === 0) {
    for (const [file, alt] of Object.entries(images)) {
      const doc = await uploadMedia(token, path.join(assetsDir, file), alt)
      mediaIds[file] = doc.id
      console.log('seed: uploaded', file, '-> id', doc.id)
    }
  } else {
    for (const doc of media.docs) mediaIds[doc.filename] = doc.id
    console.log('seed: media present, reusing', Object.keys(mediaIds).length, 'files')
  }

  const totalDocs = async (c) => (await api('GET', `/api/${c}?limit=1&depth=0`, { token })).totalDocs

  // 3. services
  if ((await totalDocs('services')) === 0) {
    const services = [
      { title: 'AI & LLM Engineering', description: 'RAG pipelines, agentic workflows, and self-hosted model serving that solve real problems.', tags: ['RAG', 'LangChain', 'Qdrant', 'vLLM', 'Ollama'], icon: 'nodes', accent: 'lime' },
      { title: 'Frontend Development', description: 'Responsive, accessible, interactive UIs with modern frameworks and clean design.', tags: ['React', 'Next.js', 'Vue.js', 'TypeScript'], icon: 'layout', accent: 'light' },
      { title: 'Backend & APIs', description: 'Robust server-side applications and REST APIs built for scale and reliability.', tags: ['Node.js', 'Express', 'Python', 'Django', 'FastAPI'], icon: 'server', accent: 'light' },
      { title: 'Database & Cloud', description: 'Database design, query optimization, vector stores, and cloud infrastructure on AWS.', tags: ['PostgreSQL', 'MongoDB', 'Redis', 'AWS'], icon: 'database', accent: 'light' },
      { title: 'DevOps & CI/CD', description: 'Containerization, pipelines, and on-prem deployment that just works.', tags: ['Docker', 'Kubernetes', 'GitHub Actions'], icon: 'shield', accent: 'light' },
      { title: 'Architecture & Planning', description: 'Stack selection, system design, and tech roadmap for new projects.', tags: ['System Design', 'Stack Selection', 'Tech Strategy'], icon: 'compass', accent: 'light' },
    ]
    for (let i = 0; i < services.length; i++)
      await api('POST', '/api/services', { token, json: { ...services[i], tags: services[i].tags.map((tag) => ({ tag })), order: i + 1, published: true } })
    console.log('seed: services x6')
  }

  if ((await totalDocs('skill-categories')) === 0) {
    const skills = [
      { title: 'AI & LLM', tags: ['RAG', 'Agentic AI', 'LangChain', 'Qdrant', 'vLLM', 'Ollama', 'Embeddings'], icon: 'nodes' },
      { title: 'Frontend Development', tags: ['React', 'Next.js', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Flutter'], icon: 'monitor' },
      { title: 'Backend Development', tags: ['Node.js', 'Express', 'Python', 'Django', 'FastAPI', 'REST APIs'], icon: 'server' },
      { title: 'Database & DevOps', tags: ['PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Docker', 'Kubernetes', 'GitHub Actions'], icon: 'cloud' },
    ]
    for (let i = 0; i < skills.length; i++)
      await api('POST', '/api/skill-categories', { token, json: { ...skills[i], tags: skills[i].tags.map((tag) => ({ tag })), order: i + 1, published: true } })
    console.log('seed: skill-categories x4')
  }

  if ((await totalDocs('projects')) === 0) {
    const projects = [
      { path: './projects/rag-platform', title: 'RAG Platform', description: 'Document intelligence platform — ingestion, multi-worker parsing, vector search, and chat over private corpora.', tags: ['Python', 'FastAPI', 'Qdrant', 'Docker'], image: 'proj-rag.jpg', imageAlt: 'Isometric render of documents flowing through a pipeline into a vector database', bannerStyle: 'ink' },
      { path: './projects/canopy', title: 'Canopy', description: 'Flutter mobile companion for network field operations — testing, sessions, and monitoring with CI/CD to Play Store.', tags: ['Flutter', 'Dart', 'REST', 'Fastlane'], image: 'proj-canopy.jpg', imageAlt: 'Smartphone with glowing canopy of geometric leaves', bannerStyle: 'ink' },
      { path: './projects/pdfhero', title: 'PDFHero', description: 'A PDF management tool for everyday document operations — merge, split, convert, and more.', tags: [], image: 'proj-pdfhero.jpg', imageAlt: 'Floating document pages with spark particles', bannerStyle: 'lime' },
      { path: './projects/lets_jom', title: "Let's Jom", description: 'A social platform for organizing and discovering events — connecting people through shared activities.', tags: [], image: 'proj-jom.jpg', imageAlt: '3D calendar with location pins and people avatars orbiting', bannerStyle: 'ink' },
    ]
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i]
      await api('POST', '/api/projects', {
        token,
        json: {
          title: p.title, path: p.path, description: p.description,
          tags: p.tags.map((tag) => ({ tag })),
          image: mediaIds[p.image], imageAlt: p.imageAlt, bannerStyle: p.bannerStyle,
          size: i === 0 ? 'wide' : 'normal',
          demoUrl: '#', codeUrl: '#', order: i + 1, published: true,
        },
      })
    }
    console.log('seed: projects x4 (first wide)')
  }

  if ((await totalDocs('experience')) === 0) {
    const exp = [
      { period: '2024 — Present', role: 'Software Engineer', company: 'Malaysia Communication Multimedia Commission (MCMC)', description: 'Leading development of web applications using React, Node.js, and Django Rest Framework. Implementing CI/CD pipelines, containerization, and on-premises deployment — plus building RAG-based document intelligence and agentic AI tooling.' },
      { period: '2023 — 2024', role: 'Fullstack Developer', company: 'Marvelconnect Technology', description: 'Developed responsive web interfaces using React and Vue.js. Implemented state management solutions and optimized performance across the application.' },
    ]
    for (let i = 0; i < exp.length; i++)
      await api('POST', '/api/experience', { token, json: { ...exp[i], order: i + 1, published: true } })
    console.log('seed: experience x2')
  }

  if ((await totalDocs('posts')) === 0) {
    // Lexical serialized editor state (shape matches what the admin editor saves).
    const T = (text, format = 0) => ({ type: 'text', version: 1, mode: 'normal', detail: 0, format, style: '', text })
    const H = (tag, text) => ({ type: 'heading', version: 1, tag, format: '', indent: 0, direction: null, children: [T(text)] })
    const P = (...children) => ({ type: 'paragraph', version: 1, format: '', indent: 0, direction: null, textFormat: 0, textStyle: '', children })
    const LI = (text) => ({ type: 'listitem', version: 1, format: '', indent: 0, direction: null, value: 1, checked: false, children: [T(text)] })
    const UL = (...items) => ({ type: 'list', version: 1, format: '', indent: 0, direction: null, listType: 'bullet', start: 1, tag: 'ul', children: items })
    const BQ = (...children) => ({ type: 'quote', version: 1, format: '', indent: 0, direction: null, children })
    const root = (...children) => ({ root: { type: 'root', version: 1, format: '', indent: 0, direction: null, children } })
    const posts = [
      {
        title: 'Building a Production RAG Pipeline: Lessons Learned',
        slug: 'building-a-production-rag-pipeline',
        excerpt: 'What actually matters when taking a RAG system from prototype to production — document parsing, chunking strategy, and the infra nobody warns you about.',
        content: root(
          P(T('Retrieval-Augmented Generation looks deceptively simple in a demo: embed some documents, stuff them into a prompt, and the model does the rest. The gap between that prototype and something you can trust in production is where most of the real engineering lives.')),
          H('h2', 'Parsing is the foundation'),
          P(T('Your retrieval quality is capped by your parsing quality. If the parser mangles tables, loses headings, or merges pages, no amount of vector-database tuning will save you. We run multi-worker document parsing so a hung PDF never stalls the queue.')),
          UL(
            LI('Normalize early: strip layout noise before chunking, not after.'),
            LI('Keep the document structure — headings are retrieval gold.'),
            LI('Track per-document parse failures as a first-class metric.'),
          ),
          H('h2', 'Chunking is a retrieval problem, not a text problem'),
          P(T('Chunks that read well to a human often retrieve poorly. Overlap helps, but structure-aware splitting — respecting sections and tables — helped us more than any embedding swap.')),
          BQ(T('Measure retrieval before you tune the model. If the right passage is not in the context window, no prompt will fix it.')),
          H('h2', 'What I would do again'),
          P(T('Start with evaluation from day one. A small golden set of questions with known source documents gives you a regression harness for every pipeline change — and it pays for itself the first time you swap an embedding model.')),
        ),
        tags: ['RAG', 'AI Engineering', 'Lessons Learned'],
        cover: 'proj-rag.jpg',
        coverAlt: 'Isometric render of documents flowing through a pipeline into a vector database',
        publishedAt: '2025-08-12T09:00:00.000Z',
      },
      {
        title: 'Agentic AI Workflows Without the Hype',
        slug: 'agentic-ai-workflows-without-the-hype',
        excerpt: 'Agents are powerful but easy to overbuild. A field guide to deciding when a plain function call beats a multi-step autonomous loop.',
        content: root(
          P(T('The current agent discourse oscillates between "agents will replace everything" and "agents are a scam". The truth, as usual, is that they are a tool with a narrow band of problems where they shine.')),
          H('h2', 'When an agent earns its keep'),
          P(T('Agents pay off when the path to the goal is not knowable in advance: open-ended research, tool selection across messy APIs, human-in-the-loop triage. For anything with a fixed workflow, a plain pipeline is faster, cheaper, and easier to debug.')),
          UL(
            LI('Fixed steps, known tools → write a function.'),
            LI('Variable steps, unknown order → consider an agent.'),
            LI('Either way → log every tool call and make it replayable.'),
          ),
          H('h2', 'The boring stack wins'),
          P(T('Structured outputs, a retry policy, and good tracing get you 80% of what autonomous planning promises — without the nondeterminism. Reach for the agent only when that 20% actually matters.')),
        ),
        tags: ['Agentic AI', 'LLM', 'Engineering'],
        cover: 'proj-pdfhero.jpg',
        coverAlt: 'Stack of document pages with lime spark trail',
        publishedAt: '2025-09-03T09:00:00.000Z',
      },
      {
        title: 'Shipping a Solo Product: From Side Project to Deployed',
        slug: 'shipping-a-solo-product',
        excerpt: 'The unglamorous checklist that takes a portfolio project from "works on my machine" to a deployed app with CI, containers, and a migration story.',
        content: root(
          P(T('Every side project starts the same way: a working demo, zero infrastructure. The distance between that and a deployed product is not code — it is the boring parts. Here is the checklist I now run before calling anything shipped.')),
          H('h2', 'The checklist'),
          UL(
            LI('CI that builds the real artifact — not just the tests.'),
            LI('Container images built from the same dependency lockfile.'),
            LI('A schema story for existing data, not just fresh installs.'),
            LI('A smoke test that fails loudly when the app cannot boot.'),
          ),
          H('h2', 'Schema changes are the real deadline'),
          P(T('Fresh databases get schemas for free. Existing deployments never do. Planning the migration before you add the feature turns a stressful deploy into a one-line entrypoint change — and teaches you what your data actually looks like.')),
          P(T('None of this is glamorous. All of it is the difference between a demo and a product.')),
        ),
        tags: ['DevOps', 'CI/CD', 'Docker'],
        cover: 'proj-canopy.jpg',
        coverAlt: 'Smartphone under a glowing hexagonal canopy dome',
        publishedAt: '2025-09-15T09:00:00.000Z',
      },
    ]
    for (const p of posts)
      await api('POST', '/api/posts', {
        token,
        json: {
          title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content,
          tags: p.tags.map((tag) => ({ tag })),
          cover: mediaIds[p.cover], coverAlt: p.coverAlt,
          author: 'Ahmad Saufi', publishedAt: p.publishedAt, published: true,
        },
      })
    console.log('seed: posts x3')
  }

  // 4. site settings global (Payload 3 globals update = POST with full payload)
  const settings = await api('GET', '/api/globals/site-settings?depth=0', { token })
  if (!settings.heroImage) {
    await api('POST', '/api/globals/site-settings', {
      token,
      json: {
        heroName: 'Ahmad<br>Saufi',
        heroRoles: v3.heroRoles.map((role) => ({ role })),
        heroBody: v3.heroBody,
        heroChip: v3.heroChip,
        heroCred: v3.heroCred,
        heroImage: mediaIds['hero-ai.jpg'],
        heroImageAlt: 'Glowing neural network sphere with orbiting geometric rings',
        aboutParagraphs: v3.about.map((text) => ({ text })),
        stats: v3.stats,
        email: v3.email,
        githubUrl: v3.github,
        linkedinUrl: v3.linkedin,
        metaTitle: 'Ahmad Saufi | Software & AI Engineer',
        metaDescription: 'Ahmad Saufi — Software & AI Engineer based in Malaysia. RAG pipelines, agentic AI, full-stack web apps, cloud infrastructure & DevOps.',
        ogImage: mediaIds['og-cover.jpg'],
        version: 'v4.0.0',
        footerNote: 'Software & AI Engineer. Next.js + Payload CMS.',
        marqueeWords: [{ word: 'Code' }, { word: 'Train' }, { word: 'Deploy' }, { word: 'Ship' }],
      },
    })
    console.log('seed: site settings written')
  } else {
    console.log('seed: site settings already present')
  }

  console.log('SEED-DONE')
}

main().catch((e) => {
  console.error('SEED-FAIL:', e.message)
  process.exit(1)
})
