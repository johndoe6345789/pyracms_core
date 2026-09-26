'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useTenantId } from '@/hooks/useTenantId'
import { THEME_KEY, THEME_EVENT, parseSiteThemes } from '@/lib/siteTheme'
import type { SiteThemes } from '@/components/admin/styles/siteThemes'

// Per-slug, in memory only: a reload always re-reads the setting
const cache = new Map<string, SiteThemes | null>()
const stash = (slug: string) => `site-styles:${slug}`

/** The style last seen for this site, kept by the browser so the site
 * paints in its own look straight away (the server copy replaces it). */
function remembered(slug: string): SiteThemes | null {
  try {
    return parseSiteThemes(window.localStorage.getItem(stash(slug)) ?? '')
  } catch {
    return null
  }
}

function remember(slug: string, t: SiteThemes | null) {
  try {
    if (t) window.localStorage.setItem(stash(slug), JSON.stringify(t))
    else window.localStorage.removeItem(stash(slug))
  } catch {
    /* storage unavailable: the server copy still applies */
  }
}

/** Announces a freshly saved style so mounted wrappers pick it up. */
export function announceSiteTheme(slug: string, t: SiteThemes) {
  cache.set(slug, t)
  remember(slug, t)
  window.dispatchEvent(
    new CustomEvent(THEME_EVENT, { detail: { slug, theme: t } }),
  )
}

/** The saved style (light and dark looks) for a site slug, or null
 * (built-in defaults). */
export function useSiteTheme(slug: string | null): SiteThemes | null {
  const { tenantId } = useTenantId(slug ?? '')
  const [theme, setTheme] = useState<SiteThemes | null>(null)

  useEffect(() => {
    if (!slug) {
      setTheme(null)
      return
    }
    if (cache.has(slug)) {
      setTheme(cache.get(slug) ?? null)
      return
    }
    const local = remembered(slug)
    if (local) setTheme(local)
    if (!tenantId) return
    api
      .get(`/api/settings/${THEME_KEY}?tenant_id=${tenantId}`)
      .then((r) => parseSiteThemes(String(r.data?.value ?? '')))
      .catch(() => local)
      .then((t) => {
        cache.set(slug, t)
        remember(slug, t)
        setTheme(t)
      })
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
