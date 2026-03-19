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
}

export default function UserActions({ user, onToggleBan, onDelete }: UserActionsProps) {
  return (
    <>
      <Tooltip title="Edit">
        <IconButton size="small" color="primary">
          <EditOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={user.banned ? 'Unban' : 'Ban'}>
        <IconButton
          size="small"
          color={user.banned ? 'success' : 'warning'}
          onClick={() => onToggleBan(user.id)}
        >
          {user.banned ? (
            <CheckCircleOutlined fontSize="small" />
          ) : (
            <BlockOutlined fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" color="error" onClick={() => onDelete(user)}>
          <DeleteOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  )
}
