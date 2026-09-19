import { useState } from 'react'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'

export function useCommentActions(
  commentId: number,
  content: string,
  onRefresh: () => void,
) {
  const [editing, setEditing] = useState(false)
  const [editTxt, setEditTxt] = useState(content)
  const [delOpen, setDelOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const vote = async (
    v: number, userVote: number | null,
    isAuth: boolean,
  ) => {
    if (!isAuth) return
    setError('')
    try {
      const nv = userVote === v ? 0 : v
      await api.post(
        `/api/comments/${commentId}/vote`,
        { value: nv })
      onRefresh()
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not record vote'))
    }
  }
  const saveEdit = async () => {
    if (!editTxt.trim()) return
    setSaving(true)
    setError('')
    try {
      await api.put(
        `/api/comments/${commentId}`,
        { content: editTxt })
      setEditing(false); onRefresh()
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not save comment'))
    }
    setSaving(false)
  }
  const del = async () => {
    setError('')
    try {
      await api.delete(
        `/api/comments/${commentId}`)
      setDelOpen(false); onRefresh()
    } catch (e) {
      setDelOpen(false)
      setError(apiErrorMessage(e, 'Could not delete comment'))
    }
  }
  const cancelEdit = () => {
    setEditing(false); setEditTxt(content)
  }
  return {
    editing, setEditing,
    editTxt, setEditTxt,
    delOpen, setDelOpen,
    saving, error, vote, saveEdit, del, cancelEdit,
  }
}
