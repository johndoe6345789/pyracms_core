'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'

/**
 * Uploads files (POST /api/files) then attaches each to the snippet
 * (POST /api/snippets/{id}/attachments), and removes one
 * (DELETE /api/snippets/{id}/attachments/{attachmentId}). Mirrors
 * useAlbumUpload's two-step upload-then-attach shape.
 */
export function useSnippetAttachments(
  snippetId: string,
  tenantId: number | null,
  onDone: () => void,
) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const upload = async (files: FileList) => {
    if (!tenantId) return
    setBusy(true)
    setError('')
    try {
      for (const file of Array.from(files)) {
        const form = new FormData()
        form.append('file', file)
        form.append('tenant_id', String(tenantId))
        const up = await api.post('/api/files', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        await api.post(`/api/snippets/${snippetId}/attachments`, {
          fileUuid: up.data.uuid,
        })
      }
    } catch (e) {
      setError(apiErrorMessage(e, 'Upload failed'))
    } finally {
      setBusy(false)
      onDone()
    }
  }

  const remove = async (attachmentId: number) => {
    setBusy(true)
    setError('')
    try {
      await api.delete(`/api/snippets/${snippetId}/attachments/${attachmentId}`)
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not remove the attachment'))
    } finally {
      setBusy(false)
      onDone()
    }
  }

  return { busy, error, upload, remove }
}
