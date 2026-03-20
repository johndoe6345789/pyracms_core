'use client'

import {
  Button, Dialog, DialogActions,
  DialogContent, DialogTitle, Typography,
} from '@mui/material'

interface Props {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function TenantDeleteDialog({
  open,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-delete-title"
      data-testid="tenant-delete-dialog"
    >
      <DialogTitle id="confirm-delete-title">
        Delete Tenant?
      </DialogTitle>
      <DialogContent>
        <Typography>
          This will permanently delete the tenant and
          all its data. This cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          data-testid="cancel-delete-tenant"
        >
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          data-testid="confirm-delete-tenant"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
