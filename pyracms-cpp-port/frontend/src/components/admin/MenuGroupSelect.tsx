import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material'
import { MenuGroup } from '@/hooks/useMenuEditor'

interface MenuGroupSelectProps {
  menuGroups: MenuGroup[]
  selectedGroup: string
  onGroupChange: (e: SelectChangeEvent) => void
  onNewGroup: () => void
}

export default function MenuGroupSelect({
  menuGroups, selectedGroup, onGroupChange, onNewGroup,
}: MenuGroupSelectProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center', flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Menu Group</InputLabel>
        <Select value={selectedGroup} label="Menu Group" onChange={onGroupChange}>
          {menuGroups.map((g) => (
            <MenuItem key={g.name} value={g.name}>
              {g.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="outlined" startIcon={<AddCircleOutline />} onClick={onNewGroup}>
        New Menu Group
      </Button>
    </Box>
  )
}
