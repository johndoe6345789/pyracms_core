import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import { UserRow } from '@/hooks/useAdminUsers'
import type { Actor } from '@/lib/userGuards'
import UserRowView from './UserRowView'

interface UserTableProps {
  users: UserRow[]
  onToggleBan: (id: number) => void
  onDelete: (user: UserRow) => void
  onEdit?: ((user: UserRow) => void) | undefined
  actor?: Actor | undefined
}

const HEADS = ['Username', 'Email', 'Created', 'Level', 'Status']

export default function UserTable({
  users,
  onToggleBan,
  onDelete,
  onEdit,
  actor,
}: UserTableProps) {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderColor: 'divider' }}
      data-testid="user-table"
    >
      <Table aria-label="User accounts">
        <TableHead>
          <TableRow>
            {HEADS.map((h) => (
              <TableCell key={h} scope="col" sx={{ fontWeight: 700 }}>
                {h}
              </TableCell>
            ))}
            <TableCell scope="col" sx={{ fontWeight: 700 }} align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <UserRowView
              key={user.id}
              user={user}
              onToggleBan={onToggleBan}
              onDelete={onDelete}
              onEdit={onEdit}
              actor={actor}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
