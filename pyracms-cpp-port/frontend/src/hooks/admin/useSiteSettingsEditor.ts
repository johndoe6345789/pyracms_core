'use client'

import { useState, useEffect, useMemo } from 'react'
import { useActionError } from '@/hooks/useActionError'
import { fetchSettings, putSetting } from './settingsApi'
import {
  SITE_SETTING_DEFAULTS,
  siteSettingsFrom,
  type SiteSettings,
} from '@/lib/siteSettings'
import { withSiteDefaults, type SiteBasics } from '@/lib/siteSettingsDefaults'
import { validateSettings } from '@/components/admin/settings/validateSettings'

/**
 * Loads, edits and saves the guided site settings of one tenant. Blank
 * fields start from `site` (its name and description); see withSiteDefaults.
 */
export function useSiteSettingsEditor(
  tenantId: number | null,
  site: SiteBasics | null = null,
) {
  const [loaded, setLoaded] = useState<SiteSettings>(SITE_SETTING_DEFAULTS)
  const [edits, setEdits] = useState<Partial<SiteSettings>>({})
  const name = site?.name
  const description = site?.description
  const values = useMemo(
    () =>
      withSiteDefaults(
        { ...loaded, ...edits },
        name === undefined ? null : { name, description: description ?? '' },
        edits,
      ),
    [loaded, edits, name, description],
  )
  const [saved, setSaved] = useState<SiteSettings | null>(null)
  const [problems, setProblems] = useState<Record<string, string>>({})
  const { error, setError, fail } = useActionError()

  useEffect(() => {
    if (!tenantId) return
    fetchSettings(tenantId)
      .then((rows) =>
        setLoaded(siteSettingsFrom(rows.map((r) => ({ ...r, name: r.key })))),
      )
      .catch(() => {})
  }, [tenantId])

  const setField = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => {
    setSaved(null)
    setEdits((p) => ({ ...p, [k]: v }))
  }

  const save = async () => {
    const bad = validateSettings(values)
    setProblems(bad)
    setError('')
    if (Object.keys(bad).length) return
    try {
      await Promise.all(
        Object.entries(values).map(([k, v]) =>
          putSetting(k, String(v).trim(), tenantId),
        ),
      )
      setSaved(values)
    } catch (e) {
      fail('Could not save settings')(e)
    }
  }

  return { values, setField, save, saved, problems, error }
}
