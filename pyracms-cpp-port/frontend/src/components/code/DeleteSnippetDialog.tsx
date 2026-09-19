'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
} from '@mui/material'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteSnippetDialog({ open, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete snippet?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This permanently deletes this snippet.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="error"
          onClick={onConfirm}
          data-testid="confirm-delete-btn"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
