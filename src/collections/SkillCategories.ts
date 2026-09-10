import type { CollectionConfig } from 'payload'

export const SkillCategories: CollectionConfig = {
  slug: 'skill-categories',
  access: { read: () => true },
  admin: { useAsTitle: 'title', defaultSort: 'order' },
  fields: [
    { name: 'title', type: 'text', required: true },
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
      options: ['nodes', 'monitor', 'server', 'cloud'],
    },
    { name: 'order', type: 'number', defaultValue: 10 },
    { name: 'published', type: 'checkbox', defaultValue: true },
  ],
}
