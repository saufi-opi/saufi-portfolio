import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import path from 'path'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'
import { Projects } from './collections/Projects'
import { Experience } from './collections/Experience'
import { Services } from './collections/Services'
import { SkillCategories } from './collections/SkillCategories'

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  editor: lexicalEditor(),
  collections: [Media, Users, Projects, Experience, Services, SkillCategories],
  globals: [SiteSettings],
  typescript: { outputFile: 'payload-types.ts' },
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || 'file:./data/payload.db' },
  }),
  cors: [serverUrl],
  csrf: [serverUrl],
  sharp,
  upload: {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  },
})
