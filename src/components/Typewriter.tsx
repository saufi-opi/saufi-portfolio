'use client'

import { useEffect, useRef, useState } from 'react'

export default function Typewriter({ roles, initial }: { roles: string[]; initial: string }) {
  const [text, setText] = useState(initial)
  const stateRef = useRef({ ri: 0, ci: initial.length, deleting: false })

  useEffect(() => {
    if (!roles.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timer: ReturnType<typeof setTimeout>

    function tick() {
      const s = stateRef.current
      const word = roles[s.ri]
      if (!s.deleting) {
        s.ci++
        if (s.ci >= word.length) {
          s.deleting = true
          setText(word)
          timer = setTimeout(tick, 2200)
          return
        }
      } else {
        s.ci--
        if (s.ci <= 0) {
          s.deleting = false
          s.ri = (s.ri + 1) % roles.length
        }
      }
      setText(roles[s.ri].slice(0, s.ci))
      timer = setTimeout(tick, s.deleting ? 38 : 68)
    }

    timer = setTimeout(tick, 2200)
    return () => clearTimeout(timer)
  }, [roles])

  return (
    <span className="type-wrap type-caret">
      <span id="typed">{text}</span>
    </span>
  )
}
