import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { UserRole, USER_ROLE_LABELS } from '@/types'
import { grantableRoles } from '@/lib/roles'

interface Props {
  actorRole: UserRole
  value: number
  onChange: (role: number) => void
}

/**
 * Role picker limited to what the signed-in account may grant. The
 * account's current role stays visible even when it cannot be granted.
 */
export default function EditUserRole({ actorRole, value, onChange }: Props) {
  const roles: number[] = grantableRoles(actorRole)
  const options = roles.includes(value) ? roles : [...roles, value]
  return (
    <FormControl size="small">
      <InputLabel id="edit-role-label">Role</InputLabel>
      <Select
        labelId="edit-role-label"
        label="Role"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={roles.length === 0 || value >= actorRole &&
          actorRole < UserRole.SuperAdmin}
        data-testid="edit-role-select"
      >
        {options.map((r) => (
          <MenuItem
            key={r}
            value={r}
            disabled={!roles.includes(r)}
          >
            {USER_ROLE_LABELS[r as UserRole]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
