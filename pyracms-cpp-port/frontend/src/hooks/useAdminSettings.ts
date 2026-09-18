'use client'

import { useState, useEffect } from 'react'
import {
  Setting, fetchSettings, putSetting, deleteSetting,
} from './admin/settingsApi'
import { useSettingAdd } from './admin/useSettingAdd'

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
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const add = useSettingAdd(tenantId, settings, setSettings)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    fetchSettings(tenantId)
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  const handleStartEdit = (setting: Setting) => {
    setEditingId(setting.id)
    setEditValue(setting.value)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const handleSaveEdit = (id: number) => {
    const setting = settings.find((s) => s.id === id)
    if (!setting) return
    putSetting(setting.key, editValue, tenantId)
      .then(() => {
        setSettings((prev) => prev.map((s) =>
          s.id === id ? { ...s, value: editValue } : s))
        handleCancelEdit()
      })
      .catch(() => {})
  }

  const handleDelete = (id: number) => {
    const setting = settings.find((s) => s.id === id)
    if (!setting) return
    deleteSetting(setting.key, tenantId)
      .then(() => {
        setSettings((prev) => prev.filter((s) => s.id !== id))
      })
      .catch(() => {})
  }

  return {
    settings, loading, editingId,
    editValue, setEditValue,
    handleStartEdit, handleSaveEdit, handleCancelEdit,
    handleDelete, ...add,
  }
}
