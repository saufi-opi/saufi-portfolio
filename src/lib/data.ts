import { getPayload } from 'payload'
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
