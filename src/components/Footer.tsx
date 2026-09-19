import { getSettings, getTotalViews } from '@/lib/data'

export default async function Footer() {
  const [s, views] = await Promise.all([getSettings(), getTotalViews()])
  const words = s.marqueeWords?.map((w) => w.word) || ['Code', 'Train', 'Deploy', 'Ship']

  // Seamless marquee: render the sequence twice (second copy aria-hidden), CSS animates -50%.
  const items: React.ReactNode[] = []
  const render = (suffix: string, hidden: boolean) =>
    words.map((w) => (
      <span key={w + suffix} aria-hidden={hidden || undefined}>
        {w}
        <span className="arrow" aria-hidden="true">↗</span>
      </span>
    ))
  items.push(...render('a', false))
  items.push(...render('b', true))

  return (
    <footer>
      <div className="lime-band marquee">
        <div className="marquee__track">{items}</div>
      </div>
      <div className="footer-meta">
        <div className="container">
          <b className="wordmark">
            &lt;AhmadSaufi <span className="lime-part">/&gt;</span>
          </b>
          <span className="footer-note">
            {s.version || 'v4.0.0'} — {s.footerNote || 'Software & AI Engineer.'} ·{' '}
            <span className="footer-views" title={`${views} site-wide views (unique visitor per path per day)`}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {views} views
            </span>
          </span>
        </div>
        <span className="arrow footer-arrow" aria-hidden="true">↗</span>
      </div>
    </footer>
  )
}
