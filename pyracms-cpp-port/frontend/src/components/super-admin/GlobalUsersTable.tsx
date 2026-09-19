'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material'
import { useSuperAdminUsers } from '@/hooks/useSuperAdminUsers'
import GlobalUserRowView from './GlobalUserRowView'
import { ErrorAlert } from '../common/ErrorAlert'

export default function GlobalUsersTable() {
  const { users, loading, error, updateRole } = useSuperAdminUsers()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', pt: 4 }}>
        <CircularProgress aria-label="Loading users" />
      </Box>
    )
  }

  return (
    <>
      <ErrorAlert error={error} testId="global-users-error" />
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
              <GlobalUserRowView
                key={u.id}
                user={u}
                onRoleChange={updateRole}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}
