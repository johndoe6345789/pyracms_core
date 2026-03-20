import { IconButton, Tooltip } from
  '@mui/material'
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
  onEdit?: (user: UserRow) => void
}

export default function UserActions({
  user,
  onToggleBan,
  onDelete,
  onEdit,
}: UserActionsProps) {
  return (
    <>
      <Tooltip title="Edit">
        <IconButton
          size="small"
          color="primary"
          onClick={
            () => onEdit?.(user)
          }
          aria-label={
            `Edit user ${user.username}`
          }
          data-testid={
            `edit-user-${user.id}`
          }
        >
          <EditOutlined
            fontSize="small"
          />
        </IconButton>
      </Tooltip>
      <Tooltip
        title={
          user.banned ? 'Unban' : 'Ban'
        }
      >
        <IconButton
          size="small"
          color={
            user.banned
              ? 'success'
              : 'warning'
          }
          onClick={
            () => onToggleBan(user.id)
          }
          aria-label={
            user.banned
              ? `Unban ${user.username}`
              : `Ban ${user.username}`
          }
          data-testid={
            `ban-user-${user.id}`
          }
        >
          {user.banned ? (
            <CheckCircleOutlined
              fontSize="small"
            />
          ) : (
            <BlockOutlined
              fontSize="small"
            />
          )}
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          size="small"
          color="error"
          onClick={
            () => onDelete(user)
          }
          aria-label={
            `Delete user ` +
            user.username
          }
          data-testid={
            `delete-user-${user.id}`
          }
        >
          <DeleteOutlined
            fontSize="small"
          />
        </IconButton>
      </Tooltip>
    </>
  )
}
