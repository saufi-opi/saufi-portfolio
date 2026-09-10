import type { CollectionConfig } from 'payload'

export const Experience: CollectionConfig = {
  slug: 'experience',
  access: { read: () => true },
  admin: { useAsTitle: 'role', defaultSort: 'order' },
  fields: [
    { name: 'role', type: 'text', required: true },
    { name: 'company', type: 'text', required: true },
    { name: 'period', type: 'text', required: true, admin: { description: 'cth: 2024 — Present' } },
    { name: 'description', type: 'textarea', required: true },
    { name: 'order', type: 'number', defaultValue: 10 },
    { name: 'published', type: 'checkbox', defaultValue: true },
  ],
}
