'use client'

import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Typography,
} from '@mui/material'

interface DeleteCommentDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteCommentDialog({
  open,
  onClose,
  onConfirm,
}: DeleteCommentDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Comment</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete
          this comment?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          data-testid="delete-comment-cancel-btn"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          data-testid="delete-comment-confirm-btn"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
