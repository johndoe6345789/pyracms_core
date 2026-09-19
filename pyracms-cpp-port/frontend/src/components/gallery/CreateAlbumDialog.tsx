import {
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert,
} from '@mui/material'
import type { CreateAlbumState } from '@/hooks/useCreateAlbum'

export default function CreateAlbumDialog({
  s,
}: {
  s: CreateAlbumState
}) {
  return (
    <Dialog
      open={s.open}
      onClose={s.close}
      maxWidth="sm"
      fullWidth
      data-testid="create-album-dialog"
      aria-labelledby="create-album-title"
    >
      <DialogTitle id="create-album-title">Create Album</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex', flexDirection: 'column',
          gap: 2, pt: '16px !important',
        }}
      >
        {s.error && (
          <Alert severity="error" data-testid="create-album-error">
            {s.error}
          </Alert>
        )}
        <TextField
          label="Album Name"
          size="small"
          required
          value={s.name}
          onChange={(e) => s.setName(e.target.value)}
          data-testid="album-name-input"
        />
        <TextField
          label="Description"
          size="small"
          multiline
          minRows={2}
          value={s.description}
          onChange={(e) => s.setDescription(e.target.value)}
          data-testid="album-description-input"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={s.close} data-testid="cancel-album-btn">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={s.submit}
          disabled={s.saving || !s.name.trim()}
          data-testid="submit-album-btn"
        >
          {s.saving ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
