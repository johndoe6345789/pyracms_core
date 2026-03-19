'use client'

import { useState } from 'react'

export interface Setting {
  id: number
  key: string
  value: string
}

const PLACEHOLDER_SETTINGS: Setting[] = [
  { id: 1, key: 'site_name', value: 'PyraCMS' },
  { id: 2, key: 'site_description', value: 'A modern multi-tenant CMS' },
  { id: 3, key: 'max_upload_size', value: '10485760' },
  { id: 4, key: 'default_language', value: 'en' },
  { id: 5, key: 'smtp_host', value: 'smtp.example.com' },
  { id: 6, key: 'smtp_port', value: '587' },
  { id: 7, key: 'registration_enabled', value: 'true' },
]

export function useAdminSettings() {
  const [settings, setSettings] = useState<Setting[]>(PLACEHOLDER_SETTINGS)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const handleStartEdit = (setting: Setting) => {
    setEditingId(setting.id)
    setEditValue(setting.value)
  }

  const handleSaveEdit = (id: number) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, value: editValue } : s))
    )
    setEditingId(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const handleDelete = (id: number) => {
    setSettings((prev) => prev.filter((s) => s.id !== id))
  }

  const handleAdd = () => {
    if (!newKey.trim() || !newValue.trim()) return
    const nextId = Math.max(...settings.map((s) => s.id), 0) + 1
    setSettings((prev) => [
      ...prev,
      { id: nextId, key: newKey.trim(), value: newValue.trim() },
    ])
    setNewKey('')
    setNewValue('')
  }

  return {
    settings,
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
