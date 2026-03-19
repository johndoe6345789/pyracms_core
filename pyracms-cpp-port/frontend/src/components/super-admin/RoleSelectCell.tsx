'use client'

import { Select, MenuItem } from '@mui/material'
import { UserRole, USER_ROLE_LABELS } from '@/types'

const ROLE_OPTIONS = [
  UserRole.Guest,
  UserRole.User,
  UserRole.Moderator,
  UserRole.SiteAdmin,
  UserRole.SuperAdmin,
]

interface Props {
  username: string
  role: UserRole
  onChange: (role: UserRole) => void
}

export default function RoleSelectCell({
  username,
  role,
  onChange,
}: Props) {
  return (
    <Select
      value={role}
      size="small"
      onChange={(e) =>
        onChange(Number(e.target.value) as UserRole)
      }
      inputProps={{
        'aria-label': `Role for ${username}`,
      }}
      data-testid={`role-select-${username}`}
      sx={{ minWidth: 130 }}
    >
      {ROLE_OPTIONS.map((r) => (
        <MenuItem key={r} value={r}>
          {USER_ROLE_LABELS[r]}
        </MenuItem>
      ))}
    </Select>
  )
}
