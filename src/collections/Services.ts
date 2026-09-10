import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  access: { read: () => true },
  admin: { useAsTitle: 'title', defaultSort: 'order' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    {
      name: 'tags',
      type: 'array',
      labels: { singular: 'Tag', plural: 'Tags' },
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'icon',
      type: 'select',
      required: true,
      defaultValue: 'nodes',
      options: [
        { label: 'AI Nodes', value: 'nodes' },
        { label: 'Layout (Frontend)', value: 'layout' },
        { label: 'Server (Backend)', value: 'server' },
        { label: 'Database', value: 'database' },
        { label: 'Shield (DevOps)', value: 'shield' },
        { label: 'Compass (Architecture)', value: 'compass' },
        { label: 'Globe', value: 'globe' },
        { label: 'Cloud', value: 'cloud' },
        { label: 'File', value: 'file' },
        { label: 'Spark', value: 'spark' },
      ],
    },
    { name: 'accent', type: 'select', defaultValue: 'light', options: ['light', 'lime'] },
    { name: 'order', type: 'number', defaultValue: 10 },
    { name: 'published', type: 'checkbox', defaultValue: true },
  ],
}
