'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface Setting {
  id: number
  key: string
  value: string
}

/**
 * Hook that manages admin settings CRUD
 * operations including inline editing, adding,
 * and deleting settings for a tenant.
 * @param tenantId - The active tenant ID,
 *   or null if not yet loaded.
 * @returns State values and handler functions
 *   for the settings editor UI.
 */
export function useAdminSettings(
  tenantId: number | null
) {
  const [settings, setSettings] =
    useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] =
    useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api
      .get(
        `/api/settings?tenant_id=${tenantId}`
      )
      .then((res) => {
        const mapped: Setting[] = (
          res.data || []
        ).map(
          (s: Record<string, unknown>) => ({
            id: s.id,
            key: s.name || '',
            value: s.value || '',
          })
        )
        setSettings(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  /**
   * Starts inline editing for a setting.
   * @param setting - The setting to edit.
   */
  const handleStartEdit = (setting: Setting) => {
    setEditingId(setting.id)
    setEditValue(setting.value)
  }

  /**
   * Saves the edited value for a setting via
   * the API.
   * @param id - The setting ID to save.
   */
  const handleSaveEdit = (id: number) => {
    const setting = settings.find(
      (s) => s.id === id
    )
    if (!setting) return
    const url =
      `/api/settings/${setting.key}` +
      `?tenant_id=${tenantId}`
    api
      .put(url, {
        name: setting.key,
        value: editValue,
      })
      .then(() => {
        setSettings((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, value: editValue }
              : s
          )
        )
        setEditingId(null)
        setEditValue('')
      })
      .catch(() => {})
  }

  /** Cancels the current inline edit. */
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  /**
   * Deletes a setting by ID via the API.
   * @param id - The setting ID to delete.
   */
  const handleDelete = (id: number) => {
    const setting = settings.find(
      (s) => s.id === id
    )
    if (!setting) return
    const url =
      `/api/settings/${setting.key}` +
      `?tenant_id=${tenantId}`
    api
      .delete(url)
      .then(() => {
        setSettings((prev) =>
          prev.filter((s) => s.id !== id)
        )
      })
      .catch(() => {})
  }

  /**
   * Adds a new setting using the form field
   * state values.
   */
  const handleAdd = () => {
    const key = newKey.trim()
    const value = newValue.trim()
    if (!key || !value || !tenantId) return
    const url =
      `/api/settings/${key}` +
      `?tenant_id=${tenantId}`
    api
      .put(url, { name: key, value })
      .then((res) => {
        const fallbackId =
          Math.max(
            ...settings.map((s) => s.id),
            0
          ) + 1
        const newSetting: Setting = {
          id: res.data?.id || fallbackId,
          key,
          value,
        }
        setSettings((prev) => [
          ...prev,
          newSetting,
        ])
        setNewKey('')
        setNewValue('')
      })
      .catch(() => {})
  }

  return {
    settings,
    loading,
    editingId,
    editValue,
    setEditValue,
    newKey,
    setNewKey,
    newValue,
    setNewValue,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleAdd,
  }
}
