'use client'

import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function PostDeleteDialog({ open, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onClose={onClose} data-testid="post-delete-dialog">
      <DialogTitle>Delete this post?</DialogTitle>
      <DialogActions>
        <Button onClick={onClose} data-testid="post-delete-cancel-btn">
          Cancel
        </Button>
        <Button color="error" onClick={onConfirm}
          data-testid="post-delete-confirm-btn">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
