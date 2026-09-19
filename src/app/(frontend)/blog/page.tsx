import type { Metadata } from 'next'
import { getPosts, getSettings, type PostDoc } from '@/lib/data'

export const revalidate = 60
// Prerender at build needs a live DB; in CI there's no seeded data (same rationale as page.tsx).
export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ page?: string; q?: string }> }

export async function generateMetadata(): Promise<Metadata> {
  try {
    const s = await getSettings()
    return {
      title: `${s?.blogTitle || 'Blog'} | Ahmad Saufi`,
      description: s?.blogSubtitle || undefined,
    }
  } catch {
    return { title: 'Blog | Ahmad Saufi' }
  }
}

function formatDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function BlogPage({ searchParams }: Props) {
  const [{ page: pageParam, q: qParam }, s] = await Promise.all([searchParams, getSettings()])
  const q = qParam?.trim() || ''
  const requested = Math.max(1, Number.parseInt(pageParam || '1', 10) || 1)
  const { posts, totalDocs, totalPages, page } = await getPosts(requested, q || undefined)
  const title = s?.blogTitle || 'Blog'
  const subtitle = s?.blogSubtitle || 'Notes on AI engineering, full-stack development, and lessons learned shipping software.'
  const baseHref = q ? `/blog?q=${encodeURIComponent(q)}` : '/blog'
  const pageHref = (p: number) => (p === 1 ? baseHref : `${baseHref}${baseHref.includes('?') ? '&' : '?'}page=${p}`)

  return (
    <main>
      <section id="blog">
        <div className="container">
          <div className="section-header fade-in">
            <p className="micro-label"><span className="num">07</span> / Writing</p>
            <h2 className="two-tone">{title} <span className="arrow" aria-hidden="true">↗</span></h2>
            <p className="subtitle">{subtitle}</p>
          </div>
          <form action="/blog" method="get" className="blog-search fade-in" role="search">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search posts…"
              aria-label="Search posts"
            />
            <button type="submit" className="pill pill--dark pill--sm">Search</button>
            {q && <a href="/blog" className="blog-search-clear">Clear</a>}
          </form>
          {q && (
            <p className="blog-search-meta">
              {totalDocs} result{totalDocs === 1 ? '' : 's'} for “{q}”
            </p>
          )}
          {posts.length === 0 ? (
            <div className="card card--light blog-empty fade-in">
              <p>{q ? `No posts matching “${q}”.` : 'No posts yet — check back soon.'}</p>
            </div>
          ) : (
            <>
              <div className="blog-grid">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="blog-pagination fade-in" role="navigation" aria-label="Blog pages">
                  {page > 1 && <a href={pageHref(page - 1)} className="pill pill--ghost pill--sm">← Prev</a>}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <a key={p} href={pageHref(p)} className={`page-num${p === page ? ' is-current' : ''}`} aria-current={p === page ? 'page' : undefined}>
                      {p}
                    </a>
                  ))}
                  {page < totalPages && <a href={pageHref(page + 1)} className="pill pill--ghost pill--sm">Next →</a>}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}

function PostCard({ post }: { post: PostDoc }) {
  const cover = typeof post.cover === 'object' ? post.cover : undefined
  return (
    <a href={`/blog/${post.slug}`} className="card card--light post-card fade-in">
      {cover?.url ? (
        <img src={cover.url} alt={post.coverAlt || post.title} className="post-cover" width={800} height={450} loading="lazy" />
      ) : (
        <div className="post-cover post-cover--fallback" aria-hidden="true">
          <span className="arrow">↗</span>
        </div>
      )}
      <div className="post-body">
        <div className="post-meta">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {post.tags && post.tags.length > 0 && (
            <span className="post-meta-tags">
              {post.tags.map((t, i) => (
                <span key={i} className="tag">{t.tag}</span>
              ))}
            </span>
          )}
        </div>
        <h3 className="post-title">{post.title}</h3>
        {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
      </div>
    </a>
  )
}
