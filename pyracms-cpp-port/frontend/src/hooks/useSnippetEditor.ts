'use client'

import { useState } from 'react'
import api from '@/lib/api'
import type { Snippet } from '@/lib/snippets'

const DEFAULT_CODE = 'print("Hello, world!")\n'

export function useSnippetEditor(
  tenantId: number | null,
  initial?: Snippet,
) {
  const [title, setTitle] =
    useState(initial?.title ?? '')
  const [code, setCode] =
    useState(initial?.code ?? DEFAULT_CODE)
  const [language, setLanguage] =
    useState(initial?.language ?? 'python')
  const [savedId, setSavedId] =
    useState<string | null>(initial?.id ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async (): Promise<string | null> => {
    if (!tenantId) return null
    setSaving(true)
    setError('')
    const body = {
      title: title.trim() || 'Untitled',
      code,
      language,
      visibility: initial?.visibility ?? 'public',
    }
    try {
      if (savedId) {
        await api.put(`/api/snippets/${savedId}`, body)
        return savedId
      }
      const res = await api.post('/api/snippets', {
        ...body, tenant_id: tenantId,
      })
      const id = String(res.data.id)
      setSavedId(id)
      return id
    } catch (e) {
      const status = (e as {
        response?: { status?: number }
      }).response?.status
      setError(status === 401
        ? 'Please log in to save snippets.'
        : 'Failed to save snippet.')
      return null
    } finally {
      setSaving(false)
    }
  }

  return {
    title, setTitle, code, setCode,
    language, setLanguage, savedId,
    saving, error, save,
  }
}

export type SnippetEditor =
  ReturnType<typeof useSnippetEditor>
