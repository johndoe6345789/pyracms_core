'use client'

import { useState } from 'react'
import { Box, Typography, Avatar } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import type { Comment } from './types'
import CommentForm from './CommentForm'
import CommentHeader from './CommentHeader'
import EditForm from './EditForm'
import CommentActions from './CommentActions'
import CommentChildren from './CommentChildren'
import DeleteCommentDialog
  from './DeleteCommentDialog'
import { useCommentActions }
  from './useCommentActions'

interface Props {
  comment: Comment; contentType: string
  contentId: number; depth: number
  onRefresh: () => void
}
export default function CommentItem({
  comment: c, contentType, contentId,
  depth, onRefresh,
}: Props) {
  const [replying, setReplying] = useState(false)
  const [exp, setExp] = useState(true)
  const isAuth = useSelector(
    (s: RootState) => s.auth.isAuthenticated)
  const usr = useSelector(
    (s: RootState) => s.auth.user)
  const a = useCommentActions(
    c.id, c.content, onRefresh)
  return (
    <Box sx={{ ml: depth > 0 ? 3 : 0, mt: 2 }}>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Avatar src={c.avatar || undefined}
          sx={{ width: 32, height: 32,
            fontSize: 14 }}>
          {c.username[0]?.toUpperCase()}</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CommentHeader comment={c} />
          {a.editing
            ? <EditForm editText={a.editTxt}
                setEditText={a.setEditTxt}
                onSave={a.saveEdit}
                submitting={a.saving}
                onCancel={a.cancelEdit} />
            : <Typography variant="body2"
                sx={{ mb: 0.5,
                  whiteSpace: 'pre-wrap' }}>
                {c.content}</Typography>}
          <CommentActions comment={c}
            isAuthenticated={isAuth}
            isOwner={usr?.id === c.user_id}
            depth={depth}
            onVote={(v) =>
              a.vote(v, c.user_vote, isAuth)}
            onReply={() =>
              setReplying(!replying)}
            onEdit={() => a.setEditing(true)}
            onDelete={() =>
              a.setDelOpen(true)} />
          {replying && <CommentForm
            contentType={contentType}
            contentId={contentId}
            parentId={c.id}
            placeholder="Write a reply..."
            submitLabel="Reply"
            onSubmitted={() => {
              setReplying(false)
              onRefresh() }}
            onCancel={() =>
              setReplying(false)} />}
          <CommentChildren items={c.children}
            expanded={exp}
            onToggle={() => setExp(!exp)}
            contentType={contentType}
            contentId={contentId}
            depth={depth}
            onRefresh={onRefresh} />
        </Box>
      </Box>
      <DeleteCommentDialog open={a.delOpen}
        onClose={() => a.setDelOpen(false)}
        onConfirm={a.del} />
    </Box>)
}
