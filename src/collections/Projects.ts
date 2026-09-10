import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: { read: () => true },
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'path', type: 'text', required: true, admin: { description: 'Paparan meta path, cth: ./projects/rag-platform' } },
    { name: 'description', type: 'textarea', required: true },
    {
      name: 'tags',
      type: 'array',
      labels: { singular: 'Tag', plural: 'Tags' },
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'imageAlt', type: 'text', required: true },
    { name: 'bannerStyle', type: 'select', defaultValue: 'ink', options: ['ink', 'lime'], admin: { description: 'Warna latar banner' } },
    { name: 'demoUrl', type: 'text' },
    { name: 'codeUrl', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 10 },
    { name: 'published', type: 'checkbox', defaultValue: true },
  ],
}
