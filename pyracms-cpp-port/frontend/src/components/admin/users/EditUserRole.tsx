import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
} from '@mui/material'
import { USER_ROLE_LABELS, UserRole } from '@/types'
import { grantable, guardUser, type Actor } from '@/lib/userGuards'
import type { UserRow } from '@/hooks/admin/userRow'

interface Props {
  actor: Actor
  target: UserRow
  value: number
  onChange: (role: number) => void
}

const LAST = 'The last administrator cannot be demoted'

/**
 * Level picker limited to what the signed-in account may grant. Locked,
 * with the reason shown, when the backend would refuse any change.
 */
export default function EditUserRole({
  actor,
  target,
  value,
  onChange,
}: Props) {
  const roles: number[] = grantable(actor)
  const options = roles.includes(value) ? roles : [...roles, value]
  const why = guardUser(actor, target).role
  const pinned = !!target.lastAdmin
  const locked = why !== null || roles.length === 0
  return (
    <Tooltip title={why ?? ''}>
      <FormControl size="small" disabled={locked}>
        <InputLabel id="edit-role-label">Level</InputLabel>
        <Select
          labelId="edit-role-label"
          label="Level"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          data-testid="edit-role-select"
        >
          {options.map((r) => (
            <MenuItem
              key={r}
              value={r}
              disabled={
                !roles.includes(r) || (pinned && r < UserRole.SiteAdmin)
              }
            >
              {USER_ROLE_LABELS[r as UserRole]}
            </MenuItem>
          ))}
        </Select>
        {(why || pinned) && (
          <FormHelperText data-testid="edit-role-reason">
            {why ?? LAST}
          </FormHelperText>
        )}
      </FormControl>
    </Tooltip>
  )
}
