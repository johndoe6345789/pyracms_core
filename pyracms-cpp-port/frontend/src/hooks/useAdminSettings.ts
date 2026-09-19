'use client'

import { useState, useEffect } from 'react'
import { Setting, fetchSettings } from './admin/settingsApi'
import { useSettingAdd } from './admin/useSettingAdd'
import { useSettingEdit } from './admin/useSettingEdit'

export type { Setting }

/**
 * Hook that manages admin settings CRUD operations
 * including inline editing, adding, and deleting.
 * @param tenantId - The active tenant ID, or null.
 * @returns State values and handlers for the editor UI.
 */
export function useAdminSettings(tenantId: number | null) {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const { editError, ...edit } = useSettingEdit(tenantId, settings, setSettings)
  const add = useSettingAdd(tenantId, settings, setSettings)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    fetchSettings(tenantId)
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  return {
    settings,
    loading,
    error: editError || add.addError,
    ...edit,
    ...add,
  }
}
