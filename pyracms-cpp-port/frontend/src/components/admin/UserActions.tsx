import { IconButton, Tooltip } from '@mui/material'
import {
  EditOutlined,
  BlockOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
} from '@mui/icons-material'
import { UserRow } from '@/hooks/useAdminUsers'

interface UserActionsProps {
  user: UserRow
  onToggleBan: (id: number) => void
  onDelete: (user: UserRow) => void
  onEdit?: ((user: UserRow) => void) | undefined
}

export default function UserActions({
  user,
  onToggleBan,
  onDelete,
  onEdit,
}: UserActionsProps) {
  const { id, username, banned } = user
  return (
    <>
      <Tooltip title="Edit">
        <IconButton
          size="small"
          color="primary"
          onClick={() => onEdit?.(user)}
          aria-label={`Edit user ${username}`}
          data-testid={`edit-user-${id}`}
        >
          <EditOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={banned ? 'Unban' : 'Ban'}>
        <IconButton
          size="small"
          color={banned ? 'success' : 'warning'}
          onClick={() => onToggleBan(id)}
          aria-label={
            banned ? `Unban ${username}` : `Ban ${username}`
          }
          data-testid={`ban-user-${id}`}
        >
          {banned ? (
            <CheckCircleOutlined fontSize="small" />
          ) : (
            <BlockOutlined fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          size="small"
          color="error"
          onClick={() => onDelete(user)}
          aria-label={`Delete user ${username}`}
          data-testid={`delete-user-${id}`}
        >
          <DeleteOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  )
}
