import { useState, useEffect } from 'react'
import type { ArticleEditorState } from '@/hooks/useArticleEditor'
import { buildRevisionSummary, type ArticleEditSnapshot } from './editSummary'

/** Keeps the revision summary in sync until the user edits it by hand. */
export function useAutoSummary(
  editor: ArticleEditorState,
  original: ArticleEditSnapshot | null,
) {
  const { content, renderer, tagsInput, setSummary } = editor
  const [editedFor, setEditedFor] = useState<ArticleEditSnapshot | null>(null)
  const summaryEdited = editedFor !== null && editedFor === original

  useEffect(() => {
    if (!original || summaryEdited) return
    setSummary(buildRevisionSummary(original, { content, renderer, tagsInput }))
  }, [content, renderer, tagsInput, original, summaryEdited, setSummary])

  return () => setEditedFor(original)
}
