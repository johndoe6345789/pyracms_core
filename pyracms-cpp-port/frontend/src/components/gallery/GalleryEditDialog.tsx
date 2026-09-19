'use client'

import type { ReactNode } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'

interface Props {
  open: boolean
  noun: string
  name: string
  desc: string
  busy: boolean
  err: ReactNode
  setName: (v: string) => void
  setDesc: (v: string) => void
  onClose: () => void
  onSave: () => void
}

/** Title/description edit form for an album or picture. */
export default function GalleryEditDialog(p: Props) {
  return (
    <Dialog
      open={p.open}
      onClose={p.onClose}
      fullWidth
      data-testid="gallery-edit-dialog"
    >
      <DialogTitle>Edit {p.noun}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label="Title"
          value={p.name}
          onChange={(e) => p.setName(e.target.value)}
          inputProps={{ maxLength: 256, 'data-testid': 'gallery-edit-name' }}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Description"
          multiline
          minRows={3}
          value={p.desc}
          onChange={(e) => p.setDesc(e.target.value)}
          inputProps={{ 'data-testid': 'gallery-edit-desc' }}
        />
        {p.err}
      </DialogContent>
      <DialogActions>
        <Button onClick={p.onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={p.busy || !p.name.trim()}
          data-testid="gallery-edit-save"
          onClick={p.onSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
