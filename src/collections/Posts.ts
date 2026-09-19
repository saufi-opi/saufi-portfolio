import type { CollectionConfig } from 'payload'
import type { FieldHook } from 'payload'

// Auto-derive slug from title when left empty; normalize to a URL-safe kebab-case otherwise.
const formatSlug: FieldHook = ({ data, operation, originalDoc, value }) => {
  if (operation !== 'create' && operation !== 'update') return value
  const source = typeof value === 'string' && value.trim() ? value : (data?.title as string) || originalDoc?.title
  if (typeof source !== 'string') return value
  return source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: { read: () => true },
  admin: { useAsTitle: 'title' },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      hooks: { beforeValidate: [formatSlug] },
      admin: { description: 'URL path segment. Auto-generated from title when empty.' },
    },
    { name: 'excerpt', type: 'textarea', required: true, maxLength: 300 },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    {
      name: 'hideCover',
      type: 'checkbox',
      label: 'Hide cover image',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Keep the cover for the blog listing card but hide it on the post page',
      },
    },
    { name: 'coverAlt', type: 'text', admin: { description: 'Alt text for the cover image' } },
    { name: 'content', type: 'richText' },
    {
      name: 'tags',
      type: 'array',
      labels: { singular: 'Tag', plural: 'Tags' },
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    { name: 'author', type: 'text', defaultValue: 'Ahmad Saufi' },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' }, defaultValue: () => new Date() },
    { name: 'published', type: 'checkbox', defaultValue: true },
  ],
}
