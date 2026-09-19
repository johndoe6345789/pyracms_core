'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useTenantId } from '@/hooks/useTenantId'
import {
  THEME_KEY, THEME_EVENT, parseSiteTheme,
} from '@/lib/siteTheme'
import type { ThemeConfig }
  from '@/components/admin/styles/themeConfig'

// Per-slug, in memory only: a reload always re-reads the setting
const cache = new Map<string, ThemeConfig | null>()

/** Announces a freshly saved theme so mounted wrappers pick it up. */
export function announceSiteTheme(slug: string, t: ThemeConfig) {
  cache.set(slug, t)
  window.dispatchEvent(
    new CustomEvent(THEME_EVENT, { detail: { slug, theme: t } }))
}

/** The saved theme for a site slug, or null (built-in defaults). */
export function useSiteTheme(slug: string | null): ThemeConfig | null {
  const { tenantId } = useTenantId(slug ?? '')
  const [theme, setTheme] = useState<ThemeConfig | null>(null)

  useEffect(() => {
    if (!slug) { setTheme(null); return }
    if (cache.has(slug)) { setTheme(cache.get(slug) ?? null); return }
    if (!tenantId) return
    api.get(`/api/settings/${THEME_KEY}?tenant_id=${tenantId}`)
      .then((r) => parseSiteTheme(String(r.data?.value ?? '')))
      .catch(() => null)
      .then((t) => { cache.set(slug, t); setTheme(t) })
  }, [slug, tenantId])

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent).detail
      if (d.slug === slug) setTheme(d.theme)
    }
    window.addEventListener(THEME_EVENT, on)
    return () => window.removeEventListener(THEME_EVENT, on)
  }, [slug])

  return theme
}
