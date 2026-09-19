import type { CollectionConfig } from 'payload'

// Raw pageview events. One row = one unique visitor (hashed with a daily salt,
// no PII stored) viewing one path on one UTC day. The unique index on
// dedupeKey enforces that: simultaneous inserts of the same key lose the race
// and are treated as already-counted.
export const PageViews: CollectionConfig = {
  slug: 'page-views',
  admin: { useAsTitle: 'path' },
  access: {
    // Admin panel is the only reader; writes happen exclusively through the
    // Local API (which bypasses access control) from the /api/track endpoint.
    read: ({ req: { user } }) => Boolean(user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'path',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'Site path viewed, e.g. /blog/my-post' },
    },
    {
      name: 'visitorHash',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
        description: 'sha256(salt + day + ip + user-agent), truncated to 32 chars. No PII stored.',
      },
    },
    {
      name: 'day',
      type: 'text',
      required: true,
      admin: { readOnly: true, description: 'UTC day of the view (YYYY-MM-DD)' },
    },
    {
      name: 'dedupeKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'visitorHash:path:day — one row per visitor per path per day' },
    },
  ],
}
