'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Fire-and-forget pageview beacon for the public site. Rendered once in the
// (frontend) layout; re-fires on every client-side navigation because
// usePathname changes. Skips the admin panel defensively (the component is not
// mounted there anyway) and repeated fires for the same pathname.
export default function PageViewTracker() {
  const pathname = usePathname()
  const lastTracked = useRef('')

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    if (lastTracked.current === pathname) return
    lastTracked.current = pathname

    // fetch keepalive survives page unload, unlike a plain fetch, and unlike
    // sendBeacon it sends a real application/json body.
    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      }).catch(() => {})
    } catch {
      // Never let analytics affect the page.
    }
  }, [pathname])

  return null
}
