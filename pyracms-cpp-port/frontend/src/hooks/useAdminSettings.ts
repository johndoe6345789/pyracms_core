'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface Setting {
  id: number
  key: string
  value: string
}

export function useAdminSettings(tenantId: number | null) {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api.get(`/api/settings?tenant_id=${tenantId}`)
      .then(res => {
        const mapped: Setting[] = (res.data || []).map((s: Record<string, unknown>) => ({
          id: s.id,
          key: s.name || '',
          value: s.value || '',
        }))
        setSettings(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  const handleStartEdit = (setting: Setting) => {
    setEditingId(setting.id)
    setEditValue(setting.value)
  }

  const handleSaveEdit = (id: number) => {
    const setting = settings.find(s => s.id === id)
    if (!setting) return
    api.put(`/api/settings/${setting.key}?tenant_id=${tenantId}`, { name: setting.key, value: editValue })
      .then(() => {
        setSettings(prev => prev.map(s => s.id === id ? { ...s, value: editValue } : s))
        setEditingId(null)
        setEditValue('')
      })
      .catch(() => {})
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const handleDelete = (id: number) => {
    const setting = settings.find(s => s.id === id)
    if (!setting) return
    api.delete(`/api/settings/${setting.key}?tenant_id=${tenantId}`)
      .then(() => {
        setSettings(prev => prev.filter(s => s.id !== id))
      })
      .catch(() => {})
  }

  const handleAdd = () => {
    if (!newKey.trim() || !newValue.trim() || !tenantId) return
    api.put(`/api/settings/${newKey.trim()}?tenant_id=${tenantId}`, { name: newKey.trim(), value: newValue.trim() })
      .then(res => {
        const newSetting: Setting = {
          id: res.data?.id || Math.max(...settings.map(s => s.id), 0) + 1,
          key: newKey.trim(),
          value: newValue.trim(),
        }
        setSettings(prev => [...prev, newSetting])
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
