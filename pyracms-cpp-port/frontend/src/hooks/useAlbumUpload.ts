'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'

/**
 * Uploads image files (POST /api/files) then attaches each to the album
 * (POST /api/gallery/albums/{id}/pictures). Stops at the first failure.
 */
export function useAlbumUpload(
  albumId: string,
  tenantId: number | null,
  onDone: () => void,
) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const upload = async (files: FileList) => {
    if (!tenantId) return
    setUploading(true)
    setError('')
    try {
      for (const file of Array.from(files)) {
        const form = new FormData()
        form.append('file', file)
        form.append('tenant_id', String(tenantId))
        const up = await api.post('/api/files', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        await api.post(`/api/gallery/albums/${albumId}/pictures`, {
          displayName: file.name.replace(/\.[^.]+$/, '') || file.name,
          fileUuid: up.data.uuid,
        })
      }
    } catch (e) {
      setError(apiErrorMessage(e, 'Upload failed'))
    } finally {
      setUploading(false)
      onDone()
    }
  }

  return { uploading, error, upload }
}
