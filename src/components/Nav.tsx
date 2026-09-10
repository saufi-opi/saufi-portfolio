'use client'

import { useEffect, useRef, useState } from 'react'

const LINKS = [
  { href: '#services', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#timeline', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const progressRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    document.body.classList.toggle('nav-open', open)
  }, [open])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive('#' + entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    ;['services', 'projects', 'timeline', 'contact'].forEach((id) => {
      const el = document.getElementById(id)
      if (el) spy.observe(el)
    })
    return () => spy.disconnect()
  }, [])

  return (
    <>
      <div id="progress" aria-hidden="true">
        <span ref={progressRef} />
      </div>
      <nav className={scrolled ? 'is-scrolled' : ''}>
        <div className="nav-inner">
          <a href="#hero" className="nav-brand">
            &lt;AhmadSaufi<span> /&gt;</span>
          </a>
          <div className="nav-links">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className={active === l.href ? 'active' : ''}>
                {l.label}
              </a>
            ))}
          </div>
          <a href="#contact" className="pill pill--lime pill--sm nav-cta">
            Get in Touch <span className="arrow" aria-hidden="true">↗</span>
          </a>
          <button
            className="mobile-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </nav>
    </>
  )
}
