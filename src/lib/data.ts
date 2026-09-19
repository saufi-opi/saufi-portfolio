import { getPayload, type Where } from 'payload'
import config from '../payload.config'

export type Settings = Record<string, unknown> & {
  heroName?: string
  heroRoles?: { role: string }[]
  heroBody?: string
  heroChip?: string
  heroCred?: string
  heroImage?: { url?: string; alt?: string } | number
  heroImageAlt?: string
  aboutParagraphs?: { text: string }[]
  stats?: { num: number; suffix?: string; label: string }[]
  email?: string
  githubUrl?: string
  linkedinUrl?: string
  metaTitle?: string
  metaDescription?: string
  ogImage?: { url?: string } | number
  version?: string
  footerNote?: string
  marqueeWords?: { word: string }[]
  projectsLayout?: { layout?: 'grid' | 'bento' | 'list'; columnsDesktop?: number; columnsTablet?: number; columnsMobile?: number }
  blogTitle?: string
  blogSubtitle?: string
  blogCoverHeight?: number
  blogContentWidth?: number
}

export async function getPayloadClient() {
  return getPayload({ config })
}

export async function getSettings(): Promise<Settings> {
  const payload = await getPayloadClient()
  return (await payload.findGlobal({ slug: 'site-settings', depth: 1 })) as Settings
}

export async function getServices() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'services', depth: 0, sort: 'order', where: { published: { equals: true } } })
  return docs
}

export async function getSkills() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'skill-categories', depth: 0, sort: 'order', where: { published: { equals: true } } })
  return docs
}

export async function getProjects() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'projects', depth: 1, sort: 'order', where: { published: { equals: true } } })
  return docs as unknown as ProjectDoc[]
}

export async function getExperience() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'experience', depth: 0, sort: 'order', where: { published: { equals: true } } })
  return docs
}

export type ProjectDoc = {
  id: number
  title: string
  path: string
  description: string
  tags?: { tag: string }[]
  image?: { url?: string; filename?: string; alt?: string }
  imageAlt?: string
  bannerStyle?: 'ink' | 'lime'
  size?: 'normal' | 'wide' | 'tall'
  demoUrl?: string
  codeUrl?: string
}

export type ServiceDoc = { id: number; title: string; description: string; tags?: { tag: string }[]; icon?: string; accent?: string }
export type SkillDoc = { id: number; title: string; tags?: { tag: string }[]; icon?: string }
export type ExperienceDoc = { id: number; role: string; company: string; period: string; description: string }

export type PostDoc = {
  id: number
  title: string
  slug: string
  excerpt?: string
  cover?: { url?: string; filename?: string; alt?: string } | number
  coverAlt?: string
  hideCover?: boolean | null
  content?: SerializedLexical | null
  tags?: { tag: string }[]
  author?: string
  publishedAt?: string
}

// Minimal structural type for a Lexical serialized editor state (root + children).
type LexicalNode = { type?: string; text?: string; children?: LexicalNode[]; [key: string]: unknown }
export type SerializedLexical = { root?: LexicalNode }

export const POSTS_PER_PAGE = 9

export async function getPosts(page = 1, q?: string) {
  const payload = await getPayloadClient()
  const where: Where = q
    ? {
        and: [
          { published: { equals: true } },
          {
            or: [
              { title: { like: q } },
              { excerpt: { like: q } },
            ],
          },
        ],
      }
    : { published: { equals: true } }
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    sort: '-publishedAt',
    page,
    limit: POSTS_PER_PAGE,
    where,
  })
  return {
    posts: result.docs as unknown as PostDoc[],
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page ?? 1,
  }
}

export async function getPostBySlug(slug: string): Promise<PostDoc | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 1,
    where: {
      and: [{ slug: { equals: slug } }, { published: { equals: true } }],
    },
  })
  return (docs[0] as unknown as PostDoc) ?? null
}

// Walk the lexical JSON tree, concat all text nodes, count words -> minutes at 200 wpm.
export function readingTime(content?: SerializedLexical | null): number {
  if (!content?.root) return 0
  let words = 0
  const walk = (node: LexicalNode) => {
    if (typeof node.text === 'string') words += node.text.split(/\s+/).filter(Boolean).length
    if (Array.isArray(node.children)) node.children.forEach(walk)
  }
  walk(content.root)
  return Math.max(1, Math.round(words / 200))
}
