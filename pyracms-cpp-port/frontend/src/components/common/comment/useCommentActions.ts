import { useState } from 'react'
import api from '@/lib/api'

export function useCommentActions(
  commentId: number,
  content: string,
  onRefresh: () => void,
) {
  const [editing, setEditing] = useState(false)
  const [editTxt, setEditTxt] = useState(content)
  const [delOpen, setDelOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const vote = async (
    v: number, userVote: number | null,
    isAuth: boolean,
  ) => {
    if (!isAuth) return
    try {
      const nv = userVote === v ? 0 : v
      await api.post(
        `/api/comments/${commentId}/vote`,
        { value: nv })
      onRefresh()
    } catch { /* ignore */ }
  }
  const saveEdit = async () => {
    if (!editTxt.trim()) return
    setSaving(true)
    try {
      await api.put(
        `/api/comments/${commentId}`,
        { content: editTxt })
      setEditing(false); onRefresh()
    } catch { /* ignore */ }
    setSaving(false)
  }
  const del = async () => {
    try {
      await api.delete(
        `/api/comments/${commentId}`)
      setDelOpen(false); onRefresh()
    } catch { /* ignore */ }
  }
  const cancelEdit = () => {
    setEditing(false); setEditTxt(content)
  }
  return {
    editing, setEditing,
    editTxt, setEditTxt,
    delOpen, setDelOpen,
    saving, vote, saveEdit, del, cancelEdit,
  }
}
