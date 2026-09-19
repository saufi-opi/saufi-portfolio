import { createHash } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { trackPageView } from '@/lib/data'

export const dynamic = 'force-dynamic'

const MAX_PATH_LENGTH = 512

// Only track real frontend page paths. Admin and API paths are rejected here
// as defense-in-depth (the beacon component is only mounted on (frontend) pages).
function isIgnorablePath(path: string): boolean {
  return path.startsWith('/admin') || path.startsWith('/api')
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

// The app runs behind Traefik: take the first hop of x-forwarded-for,
// falling back to x-real-ip, then a constant (hashed with everything else anyway).
function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }
  return headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as { path?: unknown } | null
    const rawPath = typeof body?.path === 'string' ? body.path : ''
    if (!rawPath.startsWith('/') || rawPath.length > MAX_PATH_LENGTH || isIgnorablePath(rawPath)) {
      return new Response(null, { status: 204 })
    }

    // Strip query/hash and trailing slashes so /blog/x and /blog/x/ dedupe together.
    const path = rawPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/'
    const day = todayUtc()
    const salt = process.env.ANALYTICS_SALT || process.env.PAYLOAD_SECRET || 'dev-secret-change-me'
    const ip = clientIp(req.headers)
    const ua = req.headers.get('user-agent') || ''

    // Daily-rotated visitor hash: no PII is ever stored, and hashes are not
    // linkable across days because the day is part of the hash input.
    const visitorHash = createHash('sha256')
      .update(`${salt}:${day}:${ip}:${ua}`)
      .digest('hex')
      .slice(0, 32)

    await trackPageView({ path, visitorHash, day })
    return new Response(null, { status: 204 })
  } catch {
    // Analytics must never fail a user-facing request — acknowledge anything.
    return new Response(null, { status: 204 })
  }
}
