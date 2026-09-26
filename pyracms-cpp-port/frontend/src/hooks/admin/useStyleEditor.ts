'use client'

import { useCallback, useState } from 'react'
import type { ThemeConfig } from '@/components/admin/styles/themeConfig'
import {
  DEFAULT_THEMES,
  type SiteThemes,
  type ThemeMode,
} from '@/components/admin/styles/siteThemes'
import { sameThemes } from '@/components/admin/styles/presets'
import { announceSiteTheme } from '@/hooks/useSiteTheme'
import { THEME_KEY, parseSiteThemes } from '@/lib/siteTheme'
import { useSettingJson } from './useSettingJson'
import { useStoredTheme } from './useStoredTheme'

/**
 * The style editor's state: a light look and a dark look (the tab picks
 * which one is being edited), the saved styles (always reachable to go back
 * to) and the ones they replaced. Saving remembers what it replaced so it
 * can be restored later.
 */
export function useStyleEditor(slug: string, tenantId: number | null) {
  const s = useSettingJson(tenantId, THEME_KEY, parseSiteThemes, DEFAULT_THEMES)
  const before = useStoredTheme(tenantId, `${THEME_KEY}_previous`)
  const [mode, setMode] = useState<ThemeMode>('light')
  const { value: themes, original, edit } = s

  const editMode = useCallback(
    (t: ThemeConfig) => edit((prev) => ({ ...prev, [mode]: t })),
    [edit, mode],
  )
  const update = useCallback(
    (key: keyof ThemeConfig, value: string | number) =>
      edit((prev) => ({ ...prev, [mode]: { ...prev[mode], [key]: value } })),
    [edit, mode],
  )
  const save = async () => {
    if (!(await s.save())) return
    if (!sameThemes(original, themes)) await before.keep(original)
    announceSiteTheme(slug, themes)
  }

  return {
    mode,
    setMode,
    themes,
    theme: themes[mode],
    saved: original,
    previous: before.theme,
    justSaved: s.saved,
    error: s.error,
    edit: (t: SiteThemes) => edit(t),
    editMode,
    update,
    save,
  }
}
