import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material'
import { UserRow } from '@/hooks/useAdminUsers'
import UserActions from './UserActions'

interface UserTableProps {
  users: UserRow[]
  onToggleBan: (id: number) => void
  onDelete: (user: UserRow) => void
}

export default function UserTable({ users, onToggleBan, onDelete }: UserTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderColor: 'divider' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.created}</TableCell>
              <TableCell>
                <Chip
                  label={user.banned ? 'Banned' : 'Active'}
                  size="small"
                  color={user.banned ? 'error' : 'success'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <UserActions user={user} onToggleBan={onToggleBan} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
