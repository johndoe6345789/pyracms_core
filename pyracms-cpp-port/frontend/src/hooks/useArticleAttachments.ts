'use client'

import { useCallback, useEffect, useState } from 'react'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'
import { mapAttachment, type SnippetAttachment } from '@/lib/snippetAttachments'

/**
 * An article's downloads (GET /api/articles/{name}/attachments), plus
 * upload-then-attach (POST /api/files, POST .../attachments) and remove.
 */
export function useArticleAttachments(name: string, tenantId: number | null) {
  const [items, setItems] = useState<SnippetAttachment[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const base = `/api/articles/${encodeURIComponent(name)}/attachments`

  const load = useCallback(async () => {
    if (!tenantId) return
    try {
      const res = await api.get(`${base}?tenant_id=${tenantId}`)
      setItems((res.data || []).map(mapAttachment))
    } catch {
      setItems([]) // no downloads is a fine thing to show on failure
    }
  }, [base, tenantId])

  useEffect(() => {
    load()
  }, [load])

  const run = async (work: () => Promise<void>, failure: string) => {
    if (!tenantId) return
    setBusy(true)
    setError('')
    try {
      await work()
    } catch (e) {
      setError(apiErrorMessage(e, failure))
    } finally {
      setBusy(false)
      load()
    }
  }

  const upload = (files: FileList) =>
    run(async () => {
      for (const file of Array.from(files)) {
        const form = new FormData()
        form.append('file', file)
        form.append('tenant_id', String(tenantId))
        const up = await api.post('/api/files', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        await api.post(base, { fileUuid: up.data.uuid, tenant_id: tenantId })
      }
    }, 'Upload failed')

  const remove = (id: number) =>
    run(async () => {
      await api.delete(`${base}/${id}?tenant_id=${tenantId}`)
    }, 'Could not remove the attachment')

  return { items, busy, error, upload, remove }
}
