'use client'

import { useState, type Dispatch, type SetStateAction } from 'react'
import { Setting, putSetting, deleteSetting } from './settingsApi'
import { useActionError } from '../useActionError'

/** Inline edit and delete handlers for the settings table. */
export function useSettingEdit(
  tenantId: number | null,
  settings: Setting[],
  setSettings: Dispatch<SetStateAction<Setting[]>>,
) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const { error, setError, fail } = useActionError()

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
    setError('')
    putSetting(setting.key, editValue, tenantId)
      .then(() => {
        setSettings((prev) =>
          prev.map((s) => (s.id === id ? { ...s, value: editValue } : s)),
        )
        handleCancelEdit()
      })
      .catch(fail('Could not save setting'))
  }

  const handleDelete = (id: number) => {
    const setting = settings.find((s) => s.id === id)
    if (!setting) return
    setError('')
    deleteSetting(setting.key, tenantId)
      .then(() => {
        setSettings((prev) => prev.filter((s) => s.id !== id))
      })
      .catch(fail('Could not delete setting'))
  }

  return {
    editingId,
    editError: error,
    editValue,
    setEditValue,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
  }
}
