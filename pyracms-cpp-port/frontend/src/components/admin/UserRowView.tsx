import { TableCell, TableRow, Chip } from '@mui/material'
import { UserRow } from '@/hooks/useAdminUsers'
import UserActions from './UserActions'

interface Props {
  user: UserRow
  onToggleBan: (id: number) => void
  onDelete: (user: UserRow) => void
  onEdit?: ((user: UserRow) => void) | undefined
}

export default function UserRowView({
  user,
  onToggleBan,
  onDelete,
  onEdit,
}: Props) {
  return (
    <TableRow hover data-testid={`user-row-${user.id}`}>
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
        <UserActions
          user={user}
          onToggleBan={onToggleBan}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </TableCell>
    </TableRow>
  )
}
