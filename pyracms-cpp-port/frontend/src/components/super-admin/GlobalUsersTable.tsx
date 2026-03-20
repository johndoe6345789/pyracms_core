'use client'

import {
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  Paper, Chip, Typography,
  Box, CircularProgress,
} from '@mui/material'
import {
  useSuperAdminUsers,
} from '@/hooks/useSuperAdminUsers'
import { UserRole } from '@/types'
import RoleSelectCell from './RoleSelectCell'

export default function GlobalUsersTable() {
  const { users, loading, updateRole } =
    useSuperAdminUsers()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', pt: 4 }}>
        <CircularProgress aria-label="Loading users" />
      </Box>
    )
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      data-testid="global-users-table"
    >
      <Table aria-label="Global users table">
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Joined</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography color="text.secondary">
                  No users found.
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {users.map((u) => (
            <TableRow
              key={u.id}
              data-testid={`user-row-${u.username}`}
            >
              <TableCell sx={{ fontWeight: 500 }}>
                {u.username}
              </TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <RoleSelectCell
                  username={u.username}
                  role={u.role}
                  onChange={(r: UserRole) =>
                    updateRole(u.id, r)
                  }
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={
                    u.isActive ? 'Active' : 'Banned'
                  }
                  color={
                    u.isActive ? 'success' : 'error'
                  }
                  size="small"
                />
              </TableCell>
              <TableCell>{u.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
