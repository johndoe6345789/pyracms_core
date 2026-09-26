'use client'

import { useCallback, useEffect, useState } from 'react'
import api from '@/lib/api'
import { parseSiteThemes } from '@/lib/siteTheme'
import type { SiteThemes } from '@/components/admin/styles/siteThemes'
import { putSetting } from './settingsApi'

/** The styles that were in use before the last save: `theme` (null if none)
 * and `keep` to remember one. Lets "restore my previous style" work even
 * after a preset was saved over it. */
export function useStoredTheme(tenantId: number | null, key: string) {
  const [theme, setTheme] = useState<SiteThemes | null>(null)
  useEffect(() => {
    if (!tenantId) return
    api
      .get(`/api/settings/${key}?tenant_id=${tenantId}`)
      .then((r) => setTheme(parseSiteThemes(String(r.data?.value ?? ''))))
      .catch(() => {})
  }, [tenantId, key])
  const keep = useCallback(
    async (t: SiteThemes) => {
      await putSetting(key, JSON.stringify(t), tenantId)
      setTheme(t)
    },
    [key, tenantId],
  )
  return { theme, keep }
}
