'use client'

import { useState, useEffect } from 'react'
import { useActionError } from '@/hooks/useActionError'
import { fetchSettings, putSetting } from './settingsApi'
import {
  SITE_SETTING_DEFAULTS,
  siteSettingsFrom,
  type SiteSettings,
} from '@/lib/siteSettings'
import { validateSettings } from '@/components/admin/settings/validateSettings'

/** Loads, edits and saves the guided site settings of one tenant. */
export function useSiteSettingsEditor(tenantId: number | null) {
  const [values, setValues] = useState<SiteSettings>(SITE_SETTING_DEFAULTS)
  const [saved, setSaved] = useState<SiteSettings | null>(null)
  const [problems, setProblems] = useState<Record<string, string>>({})
  const { error, setError, fail } = useActionError()

  useEffect(() => {
    if (!tenantId) return
    fetchSettings(tenantId)
      .then((rows) =>
        setValues(siteSettingsFrom(rows.map((r) => ({ ...r, name: r.key })))),
      )
      .catch(() => {})
  }, [tenantId])

  const setField = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => {
    setSaved(null)
    setValues((p) => ({ ...p, [k]: v }))
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
