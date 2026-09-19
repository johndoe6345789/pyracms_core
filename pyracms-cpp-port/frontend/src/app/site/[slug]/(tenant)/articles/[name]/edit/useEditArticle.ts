import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useArticleEditor } from '@/hooks/useArticleEditor'
import api from '@/lib/api'
import { saveArticle, PartialSaveError } from './saveArticle'
import {
  buildRevisionSummary,
  matchRenderer,
  type ArticleEditSnapshot,
} from './editSummary'

export function useEditArticle(
  slug: string,
  name: string,
  tenantId: number | null,
) {
  const router = useRouter()
  const editor = useArticleEditor()
  const { content, renderer, tagsInput, setSummary } = editor
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [origRenderer, setOrigRenderer] = useState('')
  const [original, setOriginal] = useState<ArticleEditSnapshot | null>(null)
  const [summaryEdited, setSummaryEdited] = useState(false)

  useEffect(() => {
    if (!tenantId) return
    api
      .get(`/api/articles/${name}?tenant_id=${tenantId}`)
      .then((res) => {
        const a = res.data
        const r = matchRenderer(a.rendererName || 'html')
        const tags = (a.tags || []).join(', ')
        editor.setTitle(a.displayName || '')
        editor.setContent(a.content || '')
        editor.setRenderer(r)
        editor.setTagsInput(tags)
        setOrigRenderer(r)
        setOriginal({
          content: a.content || '',
          renderer: r,
          tagsInput: tags,
        })
        setSummaryEdited(false)
        editor.setSummary('')
      })
      .catch(() => setError('Failed to load article'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, tenantId])

  useEffect(() => {
    if (!original || summaryEdited) return
    setSummary(buildRevisionSummary(original, { content, renderer, tagsInput }))
  }, [content, renderer, tagsInput, original, summaryEdited, setSummary])

  const save = async () => {
    if (!tenantId) return
    setSaving(true)
    setError('')
    try {
      await saveArticle({
        name,
        tenantId,
        content: editor.content,
        summary: editor.summary,
        tags: editor.parsedTags,
        renderer: editor.renderer,
        origRenderer,
      })
      router.push(`/site/${slug}/articles/${name}`)
    } catch (e) {
      setError(
        e instanceof PartialSaveError ? e.message : 'Failed to save article',
      )
    } finally {
      setSaving(false)
    }
  }

  return {
    editor,
    saving,
    error,
    save,
    markSummaryEdited: () => setSummaryEdited(true),
  }
}
