'use client'

import { useEffect, useRef } from 'react'

export default function ParticleNet() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const hero = document.getElementById('hero')
    if (!canvas || !hero) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0
    let pts: { x: number; y: number; vx: number; vy: number; r: number }[] = []
    let running = true
    let rafId: number | null = null

    const N = () => Math.min(70, Math.floor((w * h) / 22000))

    function resize() {
      if (!canvas) return
      w = canvas.width = hero!.offsetWidth
      h = canvas.height = hero!.offsetHeight
      pts = Array.from({ length: N() }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }))
    }

    function frame() {
      if (!running) { rafId = null; return }
      ctx!.clearRect(0, 0, w, h)
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d2 = dx * dx + dy * dy
          if (d2 < 130 * 130) {
            ctx!.strokeStyle = `rgba(217,249,123,${(1 - Math.sqrt(d2) / 130) * 0.18})`
            ctx!.lineWidth = 1
            ctx!.beginPath()
            ctx!.moveTo(pts[i].x, pts[i].y)
            ctx!.lineTo(pts[j].x, pts[j].y)
            ctx!.stroke()
          }
        }
      }
      ctx!.fillStyle = 'rgba(217,249,123,.4)'
      for (const p of pts) {
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, 7)
        ctx!.fill()
      }
      rafId = requestAnimationFrame(frame)
    }

    function start() { if (rafId === null && running) rafId = requestAnimationFrame(frame) }
    function stop() { running = false }

    const io = new IntersectionObserver((es) => {
      running = es[0].isIntersecting
      if (running) start()
    }, { threshold: 0 })
    io.observe(hero!)
    window.addEventListener('resize', resize)
    resize()
    start()

    return () => {
      stop()
      io.disconnect()
      window.removeEventListener('resize', resize)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  return <canvas id="particles" ref={canvasRef} aria-hidden="true" />
}
