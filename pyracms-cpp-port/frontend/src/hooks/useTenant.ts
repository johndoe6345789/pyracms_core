'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface TenantInfo {
  id: number
  slug: string
  displayName: string
  description: string
  ownerId: number
}

const cache: Record<string, TenantInfo> = {}

/** Fallback title when the site record is not loaded (yet). */
export function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Loads the site record for `slug` (display name, description, owner).
 * `notFound` is true once the API confirmed the site does not exist.
 */
export function useTenant(slug: string) {
  const [tenant, setTenant] = useState<TenantInfo | null>(cache[slug] ?? null)
  const [loading, setLoading] = useState(!cache[slug])
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    const hit = cache[slug]
    if (hit) {
      setTenant(hit)
      setLoading(false)
      return
    }
    let cancelled = false
    api
      .get(`/api/tenants/${slug}`)
      .then((res) => {
        if (cancelled) return
        const info: TenantInfo = {
          id: res.data.id,
          slug: res.data.slug,
          displayName: res.data.displayName || titleFromSlug(slug),
          description: res.data.description || '',
          ownerId: res.data.ownerId,
        }
        cache[slug] = info
        setTenant(info)
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status === 404) {
          setNotFound(true)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  return { tenant, loading, notFound }
}
