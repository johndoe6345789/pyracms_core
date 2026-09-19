'use client'

import { TableCell, TableRow, Chip } from '@mui/material'
import type { GlobalUserRow } from '@/hooks/useSuperAdminUsers'
import type { UserRole } from '@/types'
import RoleSelectCell from './RoleSelectCell'

interface Props {
  user: GlobalUserRow
  onRoleChange: (id: number, role: UserRole) => void
}

export default function GlobalUserRowView({ user: u, onRoleChange }: Props) {
  return (
    <TableRow data-testid={`user-row-${u.username}`}>
      <TableCell sx={{ fontWeight: 500 }}>{u.username}</TableCell>
      <TableCell>{u.email}</TableCell>
      <TableCell>
        <RoleSelectCell
          username={u.username}
          role={u.role}
          onChange={(r: UserRole) => onRoleChange(u.id, r)}
        />
      </TableCell>
      <TableCell>
        <Chip
          label={u.isActive ? 'Active' : 'Banned'}
          color={u.isActive ? 'success' : 'error'}
          size="small"
        />
      </TableCell>
      <TableCell>{u.createdAt}</TableCell>
    </TableRow>
  )
}
