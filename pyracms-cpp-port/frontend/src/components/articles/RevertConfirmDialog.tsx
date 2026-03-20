'use client'

import {
  Button, Dialog,
  DialogTitle, DialogActions,
} from '@mui/material'

interface RevertConfirmDialogProps {
  revisionNumber: number | null
  onClose: () => void
  onConfirm: () => void
}

export function RevertConfirmDialog({
  revisionNumber, onClose, onConfirm,
}: RevertConfirmDialogProps) {
  return (
    <Dialog
      open={revisionNumber !== null}
      onClose={onClose}
      aria-labelledby="revert-dialog-title"
    >
      <DialogTitle id="revert-dialog-title">
        Revert to revision {revisionNumber}?
      </DialogTitle>
      <DialogActions>
        <Button
          onClick={onClose}
          data-testid="cancel-revert"
        >
          Cancel
        </Button>
        <Button
          color="warning"
          onClick={onConfirm}
          data-testid="confirm-revert"
        >
          Revert
        </Button>
      </DialogActions>
    </Dialog>
  )
}
