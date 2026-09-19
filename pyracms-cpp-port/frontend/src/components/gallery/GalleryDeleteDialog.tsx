import type { ReactNode } from 'react'
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle,
} from '@mui/material'

interface Props {
  open: boolean
  noun: string
  name: string
  albums: boolean
  busy: boolean
  err: ReactNode
  onClose: () => void
  onConfirm: () => void
}

/** Delete confirmation for an album or picture. */
export default function GalleryDeleteDialog(p: Props) {
  return (
    <Dialog open={p.open} onClose={p.onClose}
      data-testid="gallery-delete-dialog">
      <DialogTitle>Delete {p.noun}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Delete &quot;{p.name}&quot;?
          {p.albums ? ' Its pictures go with it.' : ''}
          {' '}This cannot be undone.
        </DialogContentText>
        {p.err}
      </DialogContent>
      <DialogActions>
        <Button onClick={p.onClose}>Cancel</Button>
        <Button color="error" variant="contained" disabled={p.busy}
          data-testid="gallery-delete-confirm" onClick={p.onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
