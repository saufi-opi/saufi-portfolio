import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    staticDir: process.env.MEDIA_DIR || 'data/media',
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'card', width: 800, height: 800, fit: 'cover' },
      { name: 'og', width: 1536, height: 864, fit: 'cover' },
    ],
    adminThumbnail: 'card',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Alt text untuk aksesibiliti & SEO' },
    },
  ],
}
