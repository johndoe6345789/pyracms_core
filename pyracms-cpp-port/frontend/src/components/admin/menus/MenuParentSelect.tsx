import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import type { MenuItemRow } from '@/hooks/admin/menuData'

interface Props {
  folders: MenuItemRow[]
  value: number
  onChange: (id: number) => void
  testId: string
}

/** Which folder a link is in ("Top level" = straight on the bar). */
export default function MenuParentSelect({
  folders,
  value,
  onChange,
  testId,
}: Props) {
  if (!folders.length) return null
  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel>Folder</InputLabel>
      <Select
        value={folders.some((f) => f.id === value) ? value : 0}
        label="Folder"
        onChange={(e) => onChange(Number(e.target.value))}
        data-testid={testId}
      >
        <MenuItem value={0}>Top level</MenuItem>
        {folders.map((f) => (
          <MenuItem key={f.id} value={f.id}>
            {f.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
