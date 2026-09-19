import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useArticleEditor } from '@/hooks/useArticleEditor'
import { saveArticle, PartialSaveError } from './saveArticle'
import { useLoadArticle } from './useLoadArticle'
import { useAutoSummary } from './useAutoSummary'

export function useEditArticle(
  slug: string,
  name: string,
  tenantId: number | null,
) {
  const router = useRouter()
  const editor = useArticleEditor()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { origRenderer, original } = useLoadArticle(
    name,
    tenantId,
    editor,
    setError,
  )
  const markSummaryEdited = useAutoSummary(editor, original)

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

  return { editor, saving, error, save, markSummaryEdited }
}
