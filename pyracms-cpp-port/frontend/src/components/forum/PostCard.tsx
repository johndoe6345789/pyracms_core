'use client'

import { useState } from 'react'
import {
  Paper, Typography, TextField,
  Button, Dialog, DialogTitle,
  DialogActions,
} from '@mui/material'
import { VoteButtons } from './VoteButtons'
import { PostCardHeader } from
  './PostCardHeader'
import type { Post } from '@/hooks/useThread'

interface PostCardProps {
  post: Post
  onVote?: (id: string, l: boolean) => void
  onEdit?: (
    id: string, c: string
  ) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export function PostCard({
  post, onVote, onEdit, onDelete,
}: PostCardProps) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] =
    useState(post.content)
  const [confirmDel, setConfirmDel] =
    useState(false)
  const handleSave = () => {
    onEdit?.(post.id, editContent)
      .then(() => setEditing(false))
      .catch(() => {})
  }
  const handleDelete = () => {
    onDelete?.(post.id)
      .then(() => setConfirmDel(false))
      .catch(() => {})
  }

  return (
    <Paper variant="outlined"
      sx={{ p: 3, borderColor: 'divider' }}
      data-testid={`post-card-${post.id}`}>
      <PostCardHeader
        author={post.author} date={post.date}
        isOwner={post.isOwner} editing={editing}
        onSave={handleSave}
        onCancelEdit={() => {
          setEditing(false)
          setEditContent(post.content)
        }}
        onStartEdit={() => setEditing(true)}
        onDelete={() => setConfirmDel(true)} />
      {editing ? (
        <TextField fullWidth multiline
          minRows={3} value={editContent}
          onChange={e =>
            setEditContent(e.target.value)}
          sx={{ mb: 2 }}
          data-testid="post-edit-input" />
      ) : (
        <Typography variant="body1" sx={{
          mb: 2, whiteSpace: 'pre-line',
          lineHeight: 1.8,
        }}>{post.content}</Typography>
      )}
      <VoteButtons likes={post.likes}
        dislikes={post.dislikes}
        onVote={l => onVote?.(post.id, l)} />
      <Dialog open={confirmDel}
        onClose={() => setConfirmDel(false)}
        data-testid="post-delete-dialog">
        <DialogTitle>
          Delete this post?
        </DialogTitle>
        <DialogActions>
          <Button
            onClick={() => setConfirmDel(false)}
            data-testid="post-delete-cancel-btn"
          >Cancel</Button>
          <Button color="error"
            onClick={handleDelete}
            data-testid="post-delete-confirm-btn"
          >Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
