'use client'

import { useState } from 'react'
import { Paper, Box, Typography, Avatar, IconButton, TextField, Button, Dialog, DialogTitle, DialogActions } from '@mui/material'
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@mui/icons-material'
import { VoteButtons } from './VoteButtons'
import type { Post } from '@/hooks/useThread'

interface PostCardProps {
  post: Post
  onVote?: (postId: string, isLike: boolean) => void
  onEdit?: (postId: string, content: string) => Promise<void>
  onDelete?: (postId: string) => Promise<void>
}

export function PostCard({ post, onVote, onEdit, onDelete }: PostCardProps) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = () => {
    onEdit?.(post.id, editContent).then(() => setEditing(false)).catch(() => {})
  }

  const handleDelete = () => {
    onDelete?.(post.id).then(() => setConfirmDelete(false)).catch(() => {})
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
            {post.author.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{post.author}</Typography>
            <Typography variant="caption" color="text.secondary">{post.date}</Typography>
          </Box>
        </Box>
        {post.isOwner && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {editing ? (
              <>
                <IconButton size="small" color="primary" onClick={handleSave}><SaveOutlined fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => { setEditing(false); setEditContent(post.content) }}><CloseOutlined fontSize="small" /></IconButton>
              </>
            ) : (
              <>
                <IconButton size="small" color="primary" onClick={() => setEditing(true)}><EditOutlined fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => setConfirmDelete(true)}><DeleteOutlined fontSize="small" /></IconButton>
              </>
            )}
          </Box>
        )}
      </Box>
      {editing ? (
        <TextField
          fullWidth multiline minRows={3} value={editContent}
          onChange={e => setEditContent(e.target.value)}
          sx={{ mb: 2 }}
        />
      ) : (
        <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line', lineHeight: 1.8 }}>
          {post.content}
        </Typography>
      )}
      <VoteButtons likes={post.likes} dislikes={post.dislikes} onVote={(isLike) => onVote?.(post.id, isLike)} />

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete this post?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
