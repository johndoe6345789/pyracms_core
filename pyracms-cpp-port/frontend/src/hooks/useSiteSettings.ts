'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useTenantId } from '@/hooks/useTenantId'
import { siteSettingsFrom, type SiteSettings } from '@/lib/siteSettings'

const EVENT = 'pyracms:site-settings'
// Per-slug, in memory only: a reload always re-reads the settings
const cache = new Map<string, SiteSettings>()

/** Announces freshly saved settings so mounted readers pick them up. */
export function announceSiteSettings(slug: string, s: SiteSettings) {
  cache.set(slug, s)
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { slug, s } }))
}

/** The site's guided settings, or null until loaded. */
export function useSiteSettings(slug: string | null): SiteSettings | null {
  const { tenantId } = useTenantId(slug ?? '')
  const [settings, setSettings] = useState<SiteSettings | null>(
    slug ? (cache.get(slug) ?? null) : null,
  )

  useEffect(() => {
    if (!slug || cache.has(slug) || !tenantId) return
    Promise.resolve(api.get(`/api/settings?tenant_id=${tenantId}`))
      .then((r) => {
        const s = siteSettingsFrom(Array.isArray(r?.data) ? r.data : [])
        cache.set(slug, s)
        setSettings(s)
      })
      .catch(() => {})
  }, [slug, tenantId])

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent).detail
      if (d.slug === slug) setSettings(d.s)
    }
    window.addEventListener(EVENT, on)
    return () => window.removeEventListener(EVENT, on)
  }, [slug])

  return settings
}
