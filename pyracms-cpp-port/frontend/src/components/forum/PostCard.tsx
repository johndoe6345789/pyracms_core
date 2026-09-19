'use client'

import { useState } from 'react'
import { Paper, TextField, Box } from '@mui/material'
import { VoteButtons } from './VoteButtons'
import { QuoteButton } from './QuoteButton'
import { PostBody } from './PostBody'
import { PostCardHeader } from './PostCardHeader'
import { PostDeleteDialog } from './PostDeleteDialog'
import type { Post } from '@/hooks/useThread'
import { apiErrorMessage } from '@/lib/apiError'
import { ErrorAlert } from '../common/ErrorAlert'

interface PostCardProps {
  post: Post
  onVote?: (id: string, l: boolean) => void
  onEdit?: (id: string, c: string) => Promise<unknown>
  onDelete?: (id: string) => Promise<unknown>
  onQuote?: (author: string, content: string) => void
  canVote?: boolean
}

export function PostCard({
  post, onVote, onEdit, onDelete, onQuote, canVote = true,
}: PostCardProps) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [confirmDel, setConfirmDel] = useState(false)
  const [error, setError] = useState('')
  const fail = (m: string) => (e: unknown) =>
    setError(apiErrorMessage(e, m))
  const handleSave = () => {
    setError('')
    onEdit?.(post.id, editContent)
      .then(() => setEditing(false))
      .catch(fail('Could not save post'))
  }
  const handleDelete = () => {
    setError('')
    setConfirmDel(false)
    onDelete?.(post.id).catch(fail('Could not delete post'))
  }
  const cancelEdit = () => {
    setEditing(false)
    setEditContent(post.content)
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}
      data-testid={`post-card-${post.id}`}>
      <PostCardHeader
        author={post.author} date={post.date}
        isOwner={post.isOwner} editing={editing}
        onSave={handleSave} onCancelEdit={cancelEdit}
        onStartEdit={() => setEditing(true)}
        onDelete={() => setConfirmDel(true)} />
      <ErrorAlert error={error} testId="post-error" />
      {editing ? (
        <TextField fullWidth multiline minRows={3} value={editContent}
          onChange={e => setEditContent(e.target.value)}
          sx={{ mb: 2 }} data-testid="post-edit-input" />
      ) : (
        <PostBody content={post.content} />
      )}
      <Box sx={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <VoteButtons likes={post.likes} dislikes={post.dislikes}
          disabled={!canVote} onVote={l => onVote?.(post.id, l)} />
        {onQuote && (
          <QuoteButton author={post.author} content={post.content}
            onQuote={() => onQuote(post.author, post.content)} />
        )}
      </Box>
      <PostDeleteDialog open={confirmDel}
        onClose={() => setConfirmDel(false)} onConfirm={handleDelete} />
    </Paper>
  )
}
