import { FormControlLabel, MenuItem, Switch, TextField } from '@mui/material'
import type { AlbumDetails } from '@/hooks/useAlbumEdit'

const ORDERS = [
  ['newest', 'Newest first'],
  ['oldest', 'Oldest first'],
  ['title', 'By title'],
]

interface Props {
  value: AlbumDetails
  onChange: (next: AlbumDetails) => void
}

/** How photos are ordered, and whether the album is private. */
export default function AlbumDisplayFields({ value: v, onChange }: Props) {
  const set = (patch: Partial<AlbumDetails>) => onChange({ ...v, ...patch })
  return (
    <>
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
    </>
  )
}
