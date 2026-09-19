import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'

type Act = 'Allow' | 'Deny'

interface Props {
  value: Act
  onChange: (val: Act) => void
}

export default function AclActionSelect({ value, onChange }: Props) {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Action</InputLabel>
      <Select
        value={value}
        label="Action"
        onChange={(e) => onChange(e.target.value as Act)}
        data-testid="acl-action-select"
      >
        <MenuItem value="Allow">Allow</MenuItem>
        <MenuItem value="Deny">Deny</MenuItem>
      </Select>
    </FormControl>
  )
}
