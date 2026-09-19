#!/usr/bin/env node
/* Dev-only: create 20 fake posts for layout testing. Requires a running server. */
const BASE = process.env.SEED_URL || 'http://localhost:3001'
const EMAIL = process.env.ADMIN_EMAIL || 'saufi@local.dev'
const PASSWORD = process.env.ADMIN_PASSWORD || 'local-dev-only-1234'

const T = (text, format = 0) => ({ type: 'text', version: 1, mode: 'normal', detail: 0, format, style: '', text })
const H = (tag, text) => ({ type: 'heading', version: 1, tag, format: '', indent: 0, direction: null, children: [T(text)] })
const P = (...children) => ({ type: 'paragraph', version: 1, format: '', indent: 0, direction: null, textFormat: 0, textStyle: '', children })
const LI = (text) => ({ type: 'listitem', version: 1, format: '', indent: 0, direction: null, value: 1, checked: false, children: [T(text)] })
const UL = (...items) => ({ type: 'list', version: 1, format: '', indent: 0, direction: null, listType: 'bullet', start: 1, tag: 'ul', children: items })
const OL = (...items) => ({ type: 'list', version: 1, format: '', indent: 0, direction: null, listType: 'number', start: 1, tag: 'ol', children: items })
const BQ = (...children) => ({ type: 'quote', version: 1, format: '', indent: 0, direction: null, children })
const root = (...children) => ({ root: { type: 'root', version: 1, format: '', indent: 0, direction: null, children } })

const COVERS = ['proj-rag.jpg', 'proj-canopy.jpg', 'proj-pdfhero.jpg', 'proj-jom.jpg', null]
const TAG_POOL = [
  ['AI Engineering', 'RAG'],
  ['Next.js', 'Web Dev'],
  ['DevOps', 'Docker'],
  ['Career', 'Lessons Learned'],
  ['Python', 'Backend'],
  ['Agentic AI', 'LLM'],
  ['Frontend', 'Design'],
  ['Database', 'Performance'],
]
const TITLES = [
  'Why I Stopped Over-Engineering My Side Projects',
  'A Practical Guide to Vector Databases',
  'Shipping Fast Without Breaking Things',
  'Understanding RAG Evaluation Metrics',
  'From Monolith to Modular: A Migration Story',
  'The Case for Boring Technology in AI Apps',
  'How I Structure Next.js App Router Projects',
  'Prompt Caching: What Actually Saves Money',
  'Debugging Production Like a Detective',
  'Self-Hosting LLMs: Hardware Reality Check',
  'CSS Techniques I Wish I Knew Earlier',
  'Building Multi-Tenant SaaS on a Budget',
  'When Microservices Are Actually Worth It',
  'MyCI Pipeline: From 20 Minutes to 4',
  'Document Parsing at Scale: What We Learned',
  'TypeScript Patterns for Safer APIs',
  'The Art of the Good Technical Decision',
  'Local-First Apps: Why I Am Excited',
  'Automating Everything Boring in 2026',
  'What Reading 100 Pull Requests Taught Me',
]

async function api(method, path, { token, json } = {}) {
  const headers = {}
  if (token) headers.Authorization = `JWT ${token}`
  if (json) headers['Content-Type'] = 'application/json'
  const res = await fetch(BASE + path, { method, headers, body: json ? JSON.stringify(json) : undefined })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = text }
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 200)}`)
  return data
}

async function main() {
  const login = await api('POST', '/api/users/login', { json: { email: EMAIL, password: PASSWORD } })
  const token = login.token

  const media = await api('GET', '/api/media?limit=20&depth=0', { token })
  const mediaIds = {}
  for (const doc of media.docs) mediaIds[doc.filename] = doc.id

  const existing = await api('GET', '/api/posts?limit=100&depth=0', { token })
  const have = new Set(existing.docs.map((d) => d.slug))

  let created = 0
  for (let i = 0; i < TITLES.length; i++) {
    const n = i + 1
    const title = TITLES[i]
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    if (have.has(slug)) continue

    const coverFile = COVERS[i % COVERS.length]
    const tags = TAG_POOL[i % TAG_POOL.length]
    const d = new Date(2026, 8, 30 - i) // newest first, one per day back
    const content = root(
      P(T(`Post number ${n} in the fake-data batch. This opening paragraph exists so the layout has realistic text density — enough words to wrap over at least three lines at typical reading widths.`)),
      H('h2', `Section ${n}.1 — the problem`),
      P(T('Every engineering post needs a problem statement. ', ), T('This one is deliberately generic: ', { format: 1 }), T('we had a thing that was slow, complicated, or both, and we wanted it to be fast and simple instead.')),
      UL(
        LI('First key takeaway, kept deliberately short.'),
        LI('Second takeaway with a slightly longer sentence so the bullet wraps to a second line on narrow screens.'),
        LI('Third takeaway.'),
      ),
      H('h2', `Section ${n}.2 — what worked`),
      P(T('The solution section. In production posts this is where the diagrams go. Here it is just more prose to fill out the page: the quick brown fox jumps over the lazy dog, repeatedly, until the paragraph has a plausible shape.')),
      BQ(T('A pull quote, because every blog theme needs to render one. This one sits in a lime-bordered block.')),
      OL(
        LI('Step one of the numbered list.'),
        LI('Step two, with more words to pad it out naturally.'),
        LI('Step three.'),
      ),
      H('h2', 'Wrapping up'),
      P(T('Closing thoughts would go here. If you are reading this on the live site, this is a fake post used to test pagination and layout — feel free to ignore it entirely.')),
    )
    await api('POST', '/api/posts', {
      token,
      json: {
        title, slug,
        excerpt: `Fake post ${n} for layout and pagination testing. ${title}.`,
        content,
        tags: tags.map((tag) => ({ tag })),
        cover: coverFile ? mediaIds[coverFile] : undefined,
        coverAlt: coverFile ? `Fake post ${n} cover` : undefined,
        author: n % 3 === 0 ? 'Test Author' : 'Ahmad Saufi',
        publishedAt: d.toISOString(),
        published: true,
      },
    })
    created++
  }
  console.log(`fake-posts: created ${created} (skipped ${TITLES.length - created} existing)`)
}

main().catch((e) => { console.error('fake-posts FAILED:', e.message); process.exit(1) })
