'use client'

import { useState } from 'react'
import {
  Box, Typography, Avatar,
  Button, Collapse,
} from '@mui/material'
import {
  ExpandMoreOutlined, ExpandLessOutlined,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import api from '@/lib/api'
import type { Comment } from './types'
import CommentForm from './CommentForm'
import CommentHeader from './CommentHeader'
import EditForm from './EditForm'
import CommentActions from './CommentActions'
import DeleteCommentDialog
  from './DeleteCommentDialog'

interface Props {
  comment: Comment
  contentType: string
  contentId: number
  depth: number
  onRefresh: () => void
}

export default function CommentItem({
  comment: c, contentType, contentId,
  depth, onRefresh,
}: Props) {
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] =
    useState(c.content)
  const [delOpen, setDelOpen] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [saving, setSaving] = useState(false)
  const isAuth = useSelector(
    (s: RootState) => s.auth.isAuthenticated)
  const usr = useSelector(
    (s: RootState) => s.auth.user)
  const isOwner = usr?.id === c.user_id

  const vote = async (v: number) => {
    if (!isAuth) return
    try {
      const nv = c.user_vote === v ? 0 : v
      await api.post(
        `/api/comments/${c.id}/vote`,
        { value: nv })
      onRefresh()
    } catch { /* ignore */ }
  }
  const saveEdit = async () => {
    if (!editText.trim()) return
    setSaving(true)
    try {
      await api.put(`/api/comments/${c.id}`,
        { content: editText })
      setEditing(false)
      onRefresh()
    } catch { /* ignore */ }
    setSaving(false)
  }
  const del = async () => {
    try {
      await api.delete(`/api/comments/${c.id}`)
      setDelOpen(false)
      onRefresh()
    } catch { /* ignore */ }
  }
  const ct = c.children.length
  const word = ct === 1 ? 'reply' : 'replies'

  return (
    <Box sx={{ ml: depth > 0 ? 3 : 0, mt: 2 }}>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Avatar
          src={c.avatar || undefined}
          sx={{ width: 32, height: 32,
            fontSize: 14 }}
        >{c.username[0]?.toUpperCase()}</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CommentHeader comment={c} />
          {editing
            ? <EditForm editText={editText}
                setEditText={setEditText}
                onSave={saveEdit}
                onCancel={() => {
                  setEditing(false)
                  setEditText(c.content)
                }}
                submitting={saving} />
            : <Typography variant="body2"
                sx={{ mb: 0.5,
                  whiteSpace: 'pre-wrap' }}
              >{c.content}</Typography>}
          <CommentActions comment={c}
            isAuthenticated={isAuth}
            isOwner={isOwner} depth={depth}
            onVote={vote}
            onReply={() => setReplying(!replying)}
            onEdit={() => setEditing(true)}
            onDelete={() => setDelOpen(true)} />
          {replying && <CommentForm
            contentType={contentType}
            contentId={contentId}
            parentId={c.id}
            placeholder="Write a reply..."
            submitLabel="Reply"
            onSubmitted={() => {
              setReplying(false); onRefresh()
            }}
            onCancel={() => setReplying(false)}
          />}
          {ct > 0 && <>
            <Button size="small"
              onClick={() =>
                setExpanded(!expanded)}
              startIcon={expanded
                ? <ExpandLessOutlined />
                : <ExpandMoreOutlined />}
              sx={{ textTransform: 'none',
                mt: 0.5 }}
              data-testid="toggle-replies-btn"
            >{expanded ? 'Hide' : 'Show'}
              {' '}{ct} {word}</Button>
            <Collapse in={expanded}>
              {c.children.map((ch) => (
                <CommentItem key={ch.id}
                  comment={ch}
                  contentType={contentType}
                  contentId={contentId}
                  depth={depth + 1}
                  onRefresh={onRefresh} />
              ))}
            </Collapse>
          </>}
        </Box>
      </Box>
      <DeleteCommentDialog open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={del} />
    </Box>
  )
}
