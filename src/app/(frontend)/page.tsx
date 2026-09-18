import Image from 'next/image'
import type { CSSProperties } from 'react'
import { getSettings, getServices, getSkills, getProjects, getExperience } from '@/lib/data'
import ParticleNet from '@/components/ParticleNet'
import Typewriter from '@/components/Typewriter'
import ScrollReveal from '@/components/ScrollReveal'
import { CountUp, TiltGlow, Accordion } from '@/components/anim'
import { Icon } from '@/components/Icon'

export const revalidate = 60
// Prerender at build needs a live DB; in CI there's no seeded data.
// Dynamic rendering + ISR(60) gives the same edit-propagation behaviour without a build-time DB dependency.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const [s, services, skills, projects, experience] = await Promise.all([
    getSettings(),
    getServices(),
    getSkills(),
    getProjects(),
    getExperience(),
  ])

  const heroName = (s.heroName || 'Ahmad<br>Saufi').replace('<br>', '<br />')
  const roles = s.heroRoles?.map((r) => r.role) || []
  const heroImg = typeof s.heroImage === 'object' ? s.heroImage : undefined
  const stats = s.stats || []
  const paragraphs = s.aboutParagraphs?.map((p) => p.text) || []

  const pl = {
    layout: s.projectsLayout?.layout || 'bento',
    columnsDesktop: s.projectsLayout?.columnsDesktop || 2,
    columnsTablet: s.projectsLayout?.columnsTablet || 2,
    columnsMobile: s.projectsLayout?.columnsMobile || 1,
  }
  // Existing rows have no `size`. In bento, if NO project has a size set,
  // treat the first published project (lowest order — getProjects sorts by order) as wide.
  // Setting any explicit size (even 'normal') disables the fallback.
  const noSizes = !projects.some((p) => p.size)
  const sizeOf = (i: number): 'normal' | 'wide' | 'tall' => {
    const own = projects[i].size
    if (own) return own
    return pl.layout === 'bento' && noSizes && i === 0 ? 'wide' : 'normal'
  }

  return (
    <main>
      <ScrollReveal />
      <TiltGlow />
      <Accordion />

      {/* ===== HERO ===== */}
      <section id="hero">
        <ParticleNet />
        <div className="container">
          <div className="hero-content">
            <p className="micro-label h-anim d1">Portfolio</p>
            <h1
              className="hero-headline h-anim d2"
              dangerouslySetInnerHTML={{ __html: heroName.replace('<br>', '<br/>') + '<span class="arrow" aria-hidden="true">↗</span>' }}
            />
            <p className="hero-subhead h-anim d3">
              <Typewriter roles={roles} initial={roles[0] || 'SOFTWARE & AI ENGINEER'} />
            </p>
            <p className="hero-body h-anim d4">{s.heroBody}</p>
            <div className="hero-credentials h-anim d5">
              <p className="chip">{s.heroChip}</p>
              <p className="cred-reg">{s.heroCred}</p>
            </div>
            <a href="#projects" className="pill pill--lime h-anim d6">
              View My Work <span className="arrow" aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="hero-visual h-anim d3">
            <div className="hero-visual-inner">
              {heroImg?.url && (
                <img src={heroImg.url} alt={s.heroImageAlt || 'Hero'} width={1024} height={1024} fetchPriority="high" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 01 CAPABILITIES ===== */}
      <section id="services">
        <div className="container">
          <div className="section-header fade-in">
            <p className="micro-label"><span className="num">01</span> / What I Do</p>
            <h2 className="two-tone">Capabilities <span className="arrow" aria-hidden="true">↗</span></h2>
            <p className="subtitle">Full-stack development plus applied AI — from pixel to pipeline to production.</p>
          </div>
          <div className="services-grid">
            {services.map((svc) => (
              <div key={svc.id} className={`card ${svc.accent === 'lime' ? 'card--lime' : 'card--light'} card--glow service-card fade-in`}>
                <div className="service-icon"><Icon name={svc.icon} /></div>
                <h3 className="service-title">{svc.title}</h3>
                <p className="service-desc">{svc.description}</p>
                <div className="service-tags">
                  {svc.tags?.map((t: { tag: string }, i: number) => <span key={i} className="tag">{t.tag}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 02 ABOUT ===== */}
      <section id="process" className="on-dark">
        <div className="container">
          <div className="section-header fade-in">
            <p className="micro-label"><span className="num">02</span> / About Me</p>
            <h2 className="two-tone">Who I Am</h2>
          </div>
          <div className="process-card">
            {paragraphs.map((text, i) => (
              <p key={i} className="about-para fade-in">{text}</p>
            ))}
            <div className="stats-grid">
              {stats.map((st, i) => (
                <div key={i} className={`stat fade-in ${i === stats.length - 1 ? 'stat--lime' : ''}`}>
                  {i === stats.length - 1 ? (
                    <>
                      <div className="stat-num">∞</div>
                      <div className="stat-label">Coffee Consumed</div>
                    </>
                  ) : (
                    <>
                      <CountUp target={st.num} suffix={st.suffix || ''} />
                      <div className="stat-label">{st.label}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 03 SKILLS ===== */}
      <section id="skills" className="lime-band">
        <div className="container">
          <div className="section-header fade-in">
            <p className="micro-label"><span className="num">03</span> / Tech Stack</p>
            <h2 className="two-tone">Skills &amp; Tools</h2>
            <p className="subtitle">Technologies I work with across AI and the full stack.</p>
          </div>
          <div className="skills-grid">
            {skills.map((sk) => (
              <div key={sk.id} className="card card--dark card--glow skill-card fade-in">
                <div className="skill-head">
                  <Icon name={sk.icon} />
                  <h3>{sk.title}</h3>
                </div>
                <div className="skill-divider" />
                <div className="skill-tags">
                  {sk.tags?.map((t: { tag: string }, i: number) => <span key={i} className="tag">{t.tag}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 04 PROJECTS ===== */}
      <section id="projects">
        <div className="container">
          <div className="section-header fade-in">
            <p className="micro-label"><span className="num">04</span> / Work</p>
            <h2 className="two-tone">Projects <span className="arrow" aria-hidden="true">↗</span></h2>
            <p className="subtitle">Selected work across AI platforms and web applications.</p>
          </div>
          <div
            className={`projects-grid layout-${pl.layout}`}
            style={{ '--cols-desktop': pl.columnsDesktop, '--cols-tablet': pl.columnsTablet, '--cols-mobile': pl.columnsMobile } as CSSProperties}
          >
            {projects.map((p, i) => (
              <div key={p.id} className={`card card--light project-card fade-in${pl.layout === 'bento' && sizeOf(i) !== 'normal' ? ` size-${sizeOf(i)}` : ''}`}>
                <div className={`project-banner project-banner--${p.bannerStyle === 'lime' ? 'lime' : 'ink'}`}>
                  {p.image?.url && <img src={p.image.url} alt={p.imageAlt || p.title} width={1024} height={1024} loading="lazy" />}
                  <span className="badge-arrow" aria-hidden="true">↗</span>
                </div>
                <div className="project-body">
                  <div className="project-meta">{p.path}</div>
                  <h3>{p.title}</h3>
                  <p className="project-desc">{p.description}</p>
                  {p.tags && p.tags.length > 0 && (
                    <div className="project-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {p.tags.map((t: { tag: string }, i: number) => <span key={i} className="tag">{t.tag}</span>)}
                    </div>
                  )}
                  <div className="project-links">
                    <a href={p.demoUrl || '#'} className="pill pill--dark pill--sm">Demo</a>
                    <a href={p.codeUrl || '#'} className="pill pill--ghost pill--sm">Code</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 05 TIMELINE ===== */}
      <section id="timeline">
        <div className="container">
          <div className="section-header fade-in">
            <p className="micro-label"><span className="num">05</span> / Experience</p>
            <h2 className="two-tone">Career Timeline</h2>
            <p className="subtitle">Professional experience building and shipping software.</p>
          </div>
          <div className="timeline">
            {experience.map((x) => (
              <div key={x.id} className="acc-item">
                <button className="acc-head" aria-expanded="false">
                  <div className="acc-main">
                    <div className="timeline-period">{x.period}</div>
                    <div className="acc-title">
                      <h3>{x.role}</h3>
                      <div className="timeline-company">{x.company}</div>
                    </div>
                  </div>
                  <span className="acc-toggle" aria-hidden="true" />
                </button>
                <div className="acc-panel"><p>{x.description}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 06 CONTACT ===== */}
      <section id="contact" className="on-dark">
        <div className="container">
          <div className="contact-cta">
            <p className="micro-label"><span className="num">06</span> / Contact</p>
            <h2 className="two-tone">Let&apos;s <span className="l2">Connect</span></h2>
            <p>Feel free to reach out — whether it&apos;s a project, a question, or just to say hi.</p>
            <div className="contact-links">
              {s.githubUrl && (
                <a href={s.githubUrl} target="_blank" className="pill pill--outline contact-link">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                  GitHub <span className="arrow" aria-hidden="true">↗</span>
                </a>
              )}
              {s.linkedinUrl && (
                <a href={s.linkedinUrl} target="_blank" className="pill pill--outline contact-link">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  LinkedIn <span className="arrow" aria-hidden="true">↗</span>
                </a>
              )}
              {s.email && (
                <a href={`mailto:${s.email}`} className="pill pill--lime contact-link">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 3v18h24V3H0zm21.518 2L12 12.513 2.482 5h19.036zM2 19V7.044l10 7.31 10-7.31V19H2z" /></svg>
                  Email <span className="arrow" aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
