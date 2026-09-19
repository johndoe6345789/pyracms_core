import { useState } from 'react'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'

export function useCommentSubmit(
  contentType: string,
  contentId: number,
  parentId: number | null,
  onSubmitted: () => void,
) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!text.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/api/comments/${contentType}/${contentId}`, {
        body: text,
        ...(parentId ? { parentId } : {}),
      })
      setText('')
      onSubmitted()
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not post comment'))
    }
    setSubmitting(false)
  }

  return { text, setText, submitting, error, handleSubmit }
}
