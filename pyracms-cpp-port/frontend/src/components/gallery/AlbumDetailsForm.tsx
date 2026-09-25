import {
  Button,
  FormControlLabel,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import type { AlbumDetails } from '@/hooks/useAlbumEdit'

const ORDERS = [
  ['newest', 'Newest first'],
  ['oldest', 'Oldest first'],
  ['title', 'By title'],
]

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
      <TextField
        select
        label="Photo order"
        value={v.sortOrder}
        onChange={(e) => set({ sortOrder: e.target.value })}
        data-testid="album-sort"
      >
        {ORDERS.map(([value, label]) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
      <FormControlLabel
        label="Private (only you and admins can see this album)"
        control={
          <Switch
            checked={v.isPrivate}
            onChange={(e) => set({ isPrivate: e.target.checked })}
            inputProps={{ 'aria-label': 'Private album' }}
          />
        }
      />
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
