'use client'

import { useState } from 'react'
import api from '@/lib/api'

/**
 * Create-album dialog state and submit handler.
 * @param tenantId - The active tenant ID, or null.
 * @param onCreated - Called after the album exists (refresh list).
 */
export function useCreateAlbum(tenantId: number | null, onCreated: () => void) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const close = () => setOpen(false)

  const submit = () => {
    if (!name.trim() || !tenantId) return
    setSaving(true)
    setError('')
    api
      .post('/api/gallery/albums', {
        displayName: name.trim(),
        description: description.trim(),
        tenantId,
      })
      .then(() => {
        setOpen(false)
        setName('')
        setDescription('')
        onCreated()
      })
      .catch(() => setError('Failed to create album'))
      .finally(() => setSaving(false))
  }

  return {
    open,
    setOpen,
    close,
    name,
    setName,
    description,
    setDescription,
    saving,
    error,
    submit,
  }
}

export type CreateAlbumState = ReturnType<typeof useCreateAlbum>
