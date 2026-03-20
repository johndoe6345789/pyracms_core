'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface CodeSnippetData {
  id: string
  title: string
  language: string
  code: string
  result: string
}

export function useCodeAlbum(albumId: string, tenantId: number | null) {
  const albumName = albumId
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const [snippets, setSnippets] = useState<CodeSnippetData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId || !albumId) return
    setLoading(true)
    api.get(`/api/snippets?tenant_id=${tenantId}&language=${albumId}`)
      .then(res => {
        const items = res.data.items || res.data || []
        const mapped: CodeSnippetData[] = items.map((s: Record<string, unknown>) => ({
          id: String(s.id),
          title: s.title || '',
          language: s.language || albumId,
          code: s.code || '',
          result: s.lastOutput || '',
        }))
        setSnippets(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [albumId, tenantId])

  const handleRun = (snippetId: string) => {
    return api.post(`/api/snippets/${snippetId}/run`)
      .then(res => {
        const output = res.data.output || res.data.result || ''
        setSnippets(prev => prev.map(s =>
          s.id === snippetId ? { ...s, result: output } : s
        ))
        return output
      })
  }

  return { albumName, snippets, loading, handleRun }
}
