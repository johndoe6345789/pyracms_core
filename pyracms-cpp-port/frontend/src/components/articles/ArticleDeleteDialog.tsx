'use client'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  onConfirm: () => void
}

export default function ArticleDeleteDialog(p: Props) {
  return (
    <Dialog
      open={p.open}
      onClose={p.onClose}
      data-testid="article-delete-dialog"
    >
      <DialogTitle>Delete article</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Delete &quot;{p.title}&quot; and all its revisions? This cannot be
          undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={p.onClose}>Cancel</Button>
        <Button
          color="error"
          variant="contained"
          onClick={p.onConfirm}
          data-testid="article-delete-confirm"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
