import http from 'node:http'
import { NextRequest, NextResponse } from 'next/server'

export const config = { matcher: '/', runtime: 'nodejs' }

const TTL_MS = 60_000
const cache = new Map<string, { slug: string | null; at: number }>()

// fetch() overwrites Host, and the backend picks the site from Host.
function singleSiteSlug(host: string): Promise<string | null> {
  const api = new URL(process.env.API_URL || 'http://backend:8080')
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: api.hostname,
        port: api.port || 80,
        path: '/api/domain/site',
        headers: { host },
        timeout: 2000,
      },
      (res) => {
        let body = ''
        res.on('data', (c) => (body += c))
        res.on('end', () => {
          try {
            const j = JSON.parse(body)
            resolve(j.displayMode === 'single' && j.slug ? j.slug : null)
          } catch {
            resolve(null)
          }
        })
      },
    )
    req.on('timeout', () => req.destroy())
    req.on('error', () => resolve(null))
  })
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.searchParams.has('all')) return NextResponse.next()
  const hostHeader = request.headers.get('host') || ''
  const host = hostHeader.split(':')[0] || ''
  if (!host) return NextResponse.next()

  let hit = cache.get(host)
  if (!hit || Date.now() - hit.at > TTL_MS) {
    hit = { slug: await singleSiteSlug(host), at: Date.now() }
    cache.set(host, hit)
  }
  if (!hit.slug) return NextResponse.next()

  const proto =
    request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
    request.nextUrl.protocol.replace(':', '')
  const target = `${proto}://${hostHeader}/site/${encodeURIComponent(hit.slug)}`
  return NextResponse.redirect(target, 302)
}
