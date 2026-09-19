import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { SerializedEditorState } from 'lexical'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPostBySlug, getPostViews, getSettings, readingTime } from '@/lib/data'

export const revalidate = 60
// Prerender at build needs a live DB; in CI there's no seeded data (same rationale as page.tsx).
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = await getPostBySlug(slug)
    if (!post) return {}
    const cover = typeof post.cover === 'object' ? post.cover : undefined
    const metadataBase = new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://saufi.loxikum.xyz')
    return {
      title: `${post.title} | Ahmad Saufi`,
      description: post.excerpt || undefined,
      openGraph: {
        title: post.title,
        description: post.excerpt || undefined,
        images: cover?.url ? [{ url: cover.url }] : undefined,
        type: 'article',
        publishedTime: post.publishedAt,
        url: `/blog/${post.slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt || undefined,
        images: cover?.url ? [cover.url] : undefined,
      },
      alternates: { canonical: `/blog/${post.slug}` },
      metadataBase,
    }
  } catch {
    return {}
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, settings] = await Promise.all([getPostBySlug(slug), getSettings()])
  if (!post) notFound()
  const views = await getPostViews(slug)

  const cover = typeof post.cover === 'object' ? post.cover : undefined
  const minutes = readingTime(post.content)
  const published = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
  const coverHeight = settings?.blogCoverHeight || 320
  const contentWidth = settings?.blogContentWidth || 840
  const narrowStyle = { maxWidth: contentWidth } as CSSProperties

  return (
    <main>
      <article className="post-page">
        <div className="container container--narrow" style={narrowStyle}>
          <a href="/blog" className="micro-label post-back">
            ← Back to Blog
          </a>
          <h1 className="post-heading">{post.title}</h1>
          <p className="post-byline">
            {published && <time dateTime={post.publishedAt}>{published}</time>}
            {published && ' · '}
            {minutes} min read
            {views > 0 && ` · ${views} view${views === 1 ? '' : 's'}`}
            {post.author ? ` · ${post.author}` : ''}
          </p>
        </div>
               {cover?.url && !post.hideCover && (
          <div className="container container--narrow" style={narrowStyle}>
            <img
              src={cover.url}
              alt={post.coverAlt || post.title}
              className="post-hero-image"
              style={{ height: coverHeight } as CSSProperties}
              width={1536}
              height={864}
              fetchPriority="high"
            />
          </div>
        )}
        <div className="container container--narrow" style={narrowStyle}>
          {post.content && (
            <div className="prose">
              <RichText data={post.content as SerializedEditorState} />
            </div>
          )}
        </div>
      </article>
    </main>
  )
}
