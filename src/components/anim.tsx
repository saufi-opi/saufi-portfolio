'use client'

import { useEffect, useRef } from 'react'

export function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const done = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = target + suffix
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || done.current) return
          done.current = true
          io.unobserve(el)
          const t0 = performance.now()
          const dur = 1100
          function step(t: number) {
            const k = Math.min((t - t0) / dur, 1)
            el!.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix
            if (k < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        })
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target, suffix])

  return (
    <div className="stat-num" ref={ref} data-count={target} data-suffix={suffix}>
      {target}
      {suffix}
    </div>
  )
}

export function TiltGlow() {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.card--glow'))
    const handlers: Array<[HTMLElement, EventListener, EventListener]> = []
    cards.forEach((card) => {
      card.classList.add('tilt')
      const move = (e: Event) => {
        const me = e as MouseEvent
        const r = card.getBoundingClientRect()
        const px = me.clientX - r.left, py = me.clientY - r.top
        card.style.setProperty('--mx', px + 'px')
        card.style.setProperty('--my', py + 'px')
        const rx = (py / r.height - 0.5) * -5
        const ry = (px / r.width - 0.5) * 5
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`
      }
      const leave = () => { card.style.transform = '' }
      card.addEventListener('mousemove', move)
      card.addEventListener('mouseleave', leave)
      handlers.push([card, move, leave])
    })
    return () => {
      handlers.forEach(([card, move, leave]) => {
        card.removeEventListener('mousemove', move)
        card.removeEventListener('mouseleave', leave)
      })
    }
  }, [])
  return null
}

export function Accordion() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('.acc-item'))
    items.forEach((item, i) => {
      const head = item.querySelector<HTMLButtonElement>('.acc-head')
      const panel = item.querySelector<HTMLElement>('.acc-panel')
      if (!head || !panel) return
      const open = i === 0
      item.dataset.open = String(open)
      head.setAttribute('aria-expanded', String(open))
      panel.style.height = open ? 'auto' : '0'
      const listener = () => {
        const next = item.dataset.open !== 'true'
        item.dataset.open = String(next)
        head.setAttribute('aria-expanded', String(next))
        panel.style.height = panel.scrollHeight + 'px'
        if (!next) requestAnimationFrame(() => { panel.style.height = '0' })
        else panel.addEventListener('transitionend', () => { panel.style.height = 'auto' }, { once: true })
      }
      head.addEventListener('click', listener(item, head, panel))
    })

    function listener(item: HTMLElement, head: HTMLButtonElement, panel: HTMLElement) {
      return () => {
        const next = item.dataset.open !== 'true'
        item.dataset.open = String(next)
        head.setAttribute('aria-expanded', String(next))
        panel.style.height = panel.scrollHeight + 'px'
        if (!next) requestAnimationFrame(() => { panel.style.height = '0' })
        else panel.addEventListener('transitionend', () => { panel.style.height = 'auto' }, { once: true })
      }
    }

    return () => {
      items.forEach((item) => {
        const head = item.querySelector('.acc-head')
        if (head) head.replaceWith(head.cloneNode(true))
      })
    }
  }, [])
  return null
}
