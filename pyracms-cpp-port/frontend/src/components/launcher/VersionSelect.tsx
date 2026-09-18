import { MenuItem, Select } from '@mui/material'
import type { Revision } from '@/hooks/useGameDepDetail'

interface Props {
  versions: Revision[]
  value: string
  onChange: (v: string) => void
}

export default function VersionSelect({ versions, value, onChange }: Props) {
  return (
    <Select
      size="small" value={value}
      onChange={(e) => onChange(String(e.target.value))}
      inputProps={{ 'aria-label': 'Version' }}
    >
      {versions.map((r) => (
        <MenuItem key={r.version} value={r.version}>v{r.version}</MenuItem>
      ))}
    </Select>
  )
}
