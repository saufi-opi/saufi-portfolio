'use client'

import { useEffect, useRef } from 'react'

export default function ScrollReveal() {
  const applied = useRef(false)

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.fade-in:not(.sr-ready)'))
    if (!els.length) return
    els.forEach((el) => el.classList.add('sr-ready'))

    const sectionEls = new Map<HTMLElement, number>()
    els.forEach((el) => {
      const section = el.closest('section') as HTMLElement | null
      const key = section || document.body
      const idx = sectionEls.get(key) || 0
      sectionEls.set(key, idx + 1)
      el.style.setProperty('--i', String(idx))
    })

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      els.forEach((el) => el.classList.add('visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
