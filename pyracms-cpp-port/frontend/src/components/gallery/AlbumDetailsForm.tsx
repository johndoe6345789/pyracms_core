import { Button, Paper, TextField, Typography } from '@mui/material'
import AlbumDisplayFields from './AlbumDisplayFields'
import type { AlbumDetails } from '@/hooks/useAlbumEdit'

interface Props {
  value: AlbumDetails
  busy: boolean
  onChange: (next: AlbumDetails) => void
  onSave: () => void
}

/** Title, description, privacy and the order photos are listed in. */
export default function AlbumDetailsForm({
  value: v,
  busy,
  onChange,
  onSave,
}: Props) {
  const set = (patch: Partial<AlbumDetails>) => onChange({ ...v, ...patch })
  return (
    <Paper variant="outlined" sx={{ p: 3, display: 'grid', gap: 2, mb: 3 }}>
      <Typography variant="h6" component="h2">
        Album details
      </Typography>
      <TextField
        label="Title"
        value={v.name}
        onChange={(e) => set({ name: e.target.value })}
        inputProps={{ maxLength: 256, 'data-testid': 'album-title-input' }}
      />
      <TextField
        label="Description"
        multiline
        minRows={3}
        value={v.description}
        onChange={(e) => set({ description: e.target.value })}
        inputProps={{ 'data-testid': 'album-desc-input' }}
      />
      <AlbumDisplayFields value={v} onChange={onChange} />
      <Button
        variant="contained"
        disabled={busy || !v.name.trim()}
        onClick={onSave}
        data-testid="album-save-btn"
        sx={{ justifySelf: 'start' }}
      >
        Save details
      </Button>
    </Paper>
  )
}
