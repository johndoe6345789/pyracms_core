'use client'

import { useState } from 'react'
import { Setting, putSetting } from './settingsApi'

type SetSettings = React.Dispatch<React.SetStateAction<Setting[]>>

/**
 * Add-setting form state and submit handler.
 * @param tenantId - The active tenant ID, or null.
 * @param settings - Current settings (for fallback ids).
 * @param setSettings - State setter for the settings list.
 */
export function useSettingAdd(
  tenantId: number | null,
  settings: Setting[],
  setSettings: SetSettings,
) {
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const handleAdd = () => {
    const key = newKey.trim()
    const value = newValue.trim()
    if (!key || !value || !tenantId) return
    putSetting(key, value, tenantId)
      .then((res) => {
        const fallback =
          Math.max(...settings.map((s) => s.id), 0) + 1
        const id = res.data?.id || fallback
        setSettings((prev) => [...prev, { id, key, value }])
        setNewKey('')
        setNewValue('')
      })
      .catch(() => {})
  }

  return { newKey, setNewKey, newValue, setNewValue, handleAdd }
}
