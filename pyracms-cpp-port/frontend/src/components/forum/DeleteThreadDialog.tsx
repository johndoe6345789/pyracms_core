'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'

interface DeleteThreadDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteThreadDialog({
  open,
  onClose,
  onConfirm,
}: DeleteThreadDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid="delete-thread-dialog"
    >
      <DialogTitle>Delete Thread</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this
          thread? This action cannot be undone.
          All posts within this thread will also
          be permanently deleted.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          data-testid="delete-thread-cancel"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          data-testid="delete-thread-confirm"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
