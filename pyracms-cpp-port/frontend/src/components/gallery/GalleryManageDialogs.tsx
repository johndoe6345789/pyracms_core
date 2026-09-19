'use client'

import { useState } from 'react'
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField,
} from '@mui/material'
import GalleryDeleteDialog from './GalleryDeleteDialog'
import { useGalleryManage } from '@/hooks/useGalleryManage'

export type ManageDialog = 'edit' | 'delete' | null

interface Props {
  kind: 'albums' | 'pictures'
  id: string
  name: string
  description: string
  open: ManageDialog
  onClose: () => void
  onChanged: () => void
  onDeleted: () => void
}

/** Edit form and delete confirmation for an album or picture. */
export default function GalleryManageDialogs(p: Props) {
  const g = useGalleryManage(p.kind, p.id)
  const [name, setName] = useState(p.name)
  const [desc, setDesc] = useState(p.description)
  const noun = p.kind === 'albums' ? 'album' : 'picture'
  const close = () => { g.clearError(); p.onClose() }
  const err = g.error && (
    <Alert severity="error" sx={{ mt: 1 }} data-testid="gallery-manage-error">
      {g.error}
    </Alert>
  )
  return (
    <>
      <Dialog open={p.open === 'edit'} onClose={close} fullWidth
        data-testid="gallery-edit-dialog">
        <DialogTitle>Edit {noun}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Title" value={name}
            onChange={(e) => setName(e.target.value)}
            inputProps={{ maxLength: 256, 'data-testid': 'gallery-edit-name' }}
          />
          <TextField fullWidth margin="dense" label="Description" multiline
            minRows={3} value={desc}
            onChange={(e) => setDesc(e.target.value)}
            inputProps={{ 'data-testid': 'gallery-edit-desc' }} />
          {err}
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button variant="contained" disabled={g.busy || !name.trim()}
            data-testid="gallery-edit-save"
            onClick={() => g.update(name.trim(), desc, () => {
              p.onClose(); p.onChanged()
            })}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <GalleryDeleteDialog open={p.open === 'delete'} noun={noun}
        name={p.name} albums={p.kind === 'albums'} busy={g.busy}
        err={err} onClose={close}
        onConfirm={() => g.remove(() => { p.onClose(); p.onDeleted() })} />
    </>
  )
}
