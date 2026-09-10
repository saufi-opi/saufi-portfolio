import { getSettings } from '@/lib/data'

export default async function Footer() {
  const s = await getSettings()
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
            {s.version || 'v4.0.0'} — {s.footerNote || 'Software & AI Engineer.'}
          </span>
        </div>
        <span className="arrow footer-arrow" aria-hidden="true">↗</span>
      </div>
    </footer>
  )
}
