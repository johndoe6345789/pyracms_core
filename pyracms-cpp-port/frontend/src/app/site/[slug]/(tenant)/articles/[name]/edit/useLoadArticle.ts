import { useState, useEffect } from 'react'
import type { ArticleEditorState } from '@/hooks/useArticleEditor'
import api from '@/lib/api'
import { matchRenderer, type ArticleEditSnapshot } from './editSummary'

export function useLoadArticle(
  name: string,
  tenantId: number | null,
  editor: ArticleEditorState,
  setError: (msg: string) => void,
) {
  const { setTitle, setContent, setRenderer, setTagsInput, setSummary } = editor
  const [origRenderer, setOrigRenderer] = useState('')
  const [original, setOriginal] = useState<ArticleEditSnapshot | null>(null)

  useEffect(() => {
    if (!tenantId) return
    api
      .get(`/api/articles/${name}?tenant_id=${tenantId}`)
      .then((res) => {
        const a = res.data
        const r = matchRenderer(a.rendererName || 'html')
        const tags = (a.tags || []).join(', ')
        setTitle(a.displayName || '')
        setContent(a.content || '')
        setRenderer(r)
        setTagsInput(tags)
        setOrigRenderer(r)
        setOriginal({
          content: a.content || '',
          renderer: r,
          tagsInput: tags,
        })
        setSummary('')
      })
      .catch(() => setError('Failed to load article'))
  }, [
    name,
    tenantId,
    setTitle,
    setContent,
    setRenderer,
    setTagsInput,
    setSummary,
    setError,
  ])

  return { origRenderer, original }
}
