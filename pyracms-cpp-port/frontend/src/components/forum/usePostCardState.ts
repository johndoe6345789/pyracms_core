import { useState } from 'react'
import { apiErrorMessage } from '@/lib/apiError'

interface Handlers {
  id: string
  content: string
  onEdit?: ((id: string, c: string) => Promise<unknown>) | undefined
  onDelete?: ((id: string) => Promise<unknown>) | undefined
}

/** Edit / delete-confirm / error state of one post card. */
export function usePostCardState(h: Handlers) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(h.content)
  const [confirmDel, setConfirmDel] = useState(false)
  const [error, setError] = useState('')
  const fail = (m: string) => (e: unknown) => setError(apiErrorMessage(e, m))
  const save = () => {
    setError('')
    h.onEdit?.(h.id, editContent)
      .then(() => setEditing(false))
      .catch(fail('Could not save post'))
  }
  const remove = () => {
    setError('')
    setConfirmDel(false)
    h.onDelete?.(h.id).catch(fail('Could not delete post'))
  }
  const cancel = () => {
    setEditing(false)
    setEditContent(h.content)
  }
  return {
    editing, setEditing, editContent, setEditContent,
    confirmDel, setConfirmDel, error, save, remove, cancel,
  }
}
