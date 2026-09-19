'use client'

import { Typography } from '@mui/material'
import type { Comment } from './types'
import EditForm from './EditForm'
import type { useCommentActions } from './useCommentActions'

interface Props {
  comment: Comment
  a: ReturnType<typeof useCommentActions>
}

export default function CommentBodyView({ comment, a }: Props) {
  if (a.editing) {
    return (
      <EditForm
        editText={a.editTxt}
        setEditText={a.setEditTxt}
        onSave={a.saveEdit}
        submitting={a.saving}
        onCancel={a.cancelEdit}
      />
    )
  }
  return (
    <Typography variant="body2" sx={{ mb: 0.5, whiteSpace: 'pre-wrap' }}>
      {comment.body}
    </Typography>
  )
}
