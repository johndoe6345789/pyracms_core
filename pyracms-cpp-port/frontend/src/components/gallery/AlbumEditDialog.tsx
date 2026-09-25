'use client'

import type { ReactNode } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import AlbumCoverPicker from './AlbumCoverPicker'
import type { AlbumOptions, GalleryPicture } from '@/hooks/useGalleryAlbum'

export interface AlbumForm extends AlbumOptions {
  name: string
  desc: string
}

interface Props {
  open: boolean
  form: AlbumForm
  pictures: GalleryPicture[]
  busy: boolean
  err: ReactNode
  onChange: (next: AlbumForm) => void
  onClose: () => void
  onSave: () => void
}

const ORDERS = [
  ['newest', 'Newest first'],
  ['oldest', 'Oldest first'],
  ['title', 'By title'],
]

/** Everything about an album: title, description, privacy, picture order
 * and which picture is the cover. */
export default function AlbumEditDialog(p: Props) {
  const set = (patch: Partial<AlbumForm>) => p.onChange({ ...p.form, ...patch })
  return (
    <Dialog
      open={p.open}
      onClose={p.onClose}
      fullWidth
      maxWidth="sm"
      data-testid="gallery-edit-dialog"
    >
      <DialogTitle>Edit album</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2 }}>
        <TextField
          margin="dense"
          label="Title"
          value={p.form.name}
          onChange={(e) => set({ name: e.target.value })}
          inputProps={{ maxLength: 256, 'data-testid': 'gallery-edit-name' }}
        />
        <TextField
          label="Description"
          multiline
          minRows={3}
          value={p.form.desc}
          onChange={(e) => set({ desc: e.target.value })}
          inputProps={{ 'data-testid': 'gallery-edit-desc' }}
        />
        <TextField
          select
          label="Picture order"
          value={p.form.sortOrder}
          onChange={(e) => set({ sortOrder: e.target.value })}
          data-testid="album-sort"
        >
          {ORDERS.map(([v, label]) => (
            <MenuItem key={v} value={v}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <FormControlLabel
          label="Private (only you and admins can see this album)"
          control={
            <Switch
              checked={p.form.isPrivate}
              onChange={(e) => set({ isPrivate: e.target.checked })}
              inputProps={{ 'aria-label': 'Private album' }}
            />
          }
        />
        <Typography variant="subtitle2">Cover picture</Typography>
        <AlbumCoverPicker
          pictures={p.pictures}
          value={p.form.coverPictureId}
          onChange={(coverPictureId) => set({ coverPictureId })}
        />
        {p.err}
      </DialogContent>
      <DialogActions>
        <Button onClick={p.onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={p.busy || !p.form.name.trim()}
          data-testid="gallery-edit-save"
          onClick={p.onSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
