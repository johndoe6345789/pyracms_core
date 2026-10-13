import { MenuItem, TextField } from '@mui/material'
import { VISIBILITY_LABELS, type Visibility } from '@/lib/videos'

const OPTIONS = Object.entries(VISIBILITY_LABELS) as [Visibility, string][]

/** Public / Unlisted / Private picker. */
export default function VisibilitySelect({
  value,
  onChange,
}: {
  value: Visibility
  onChange: (v: Visibility) => void
}) {
  return (
    <TextField
      select
      fullWidth
      margin="dense"
      label="Visibility"
      value={value}
      onChange={(e) => onChange(e.target.value as Visibility)}
      inputProps={{ 'data-testid': 'video-visibility' }}
    >
      {OPTIONS.map(([v, label]) => (
        <MenuItem key={v} value={v}>
          {label}
        </MenuItem>
      ))}
    </TextField>
  )
}
