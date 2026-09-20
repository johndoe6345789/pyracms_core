import {
  EditOutlined,
  BlockOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
} from '@mui/icons-material'
import { UserRow } from '@/hooks/useAdminUsers'
import type { UserGuard } from '@/lib/userGuards'
import GuardedIconButton from './users/GuardedIconButton'

interface UserActionsProps {
  user: UserRow
  onToggleBan: (id: number) => void
  onDelete: (user: UserRow) => void
  onEdit?: ((user: UserRow) => void) | undefined
  guard?: UserGuard | undefined
}

export default function UserActions({
  user,
  onToggleBan,
  onDelete,
  onEdit,
  guard,
}: UserActionsProps) {
  const { id, username, banned } = user
  return (
    <>
      <GuardedIconButton
        title="Edit"
        label={`Edit user ${username}`}
        testId={`edit-user-${id}`}
        color="primary"
        onClick={() => onEdit?.(user)}
      >
        <EditOutlined fontSize="small" />
      </GuardedIconButton>
      <GuardedIconButton
        title={banned ? 'Unban' : 'Ban'}
        reason={guard?.ban}
        label={banned ? `Unban ${username}` : `Ban ${username}`}
        testId={`ban-user-${id}`}
        color={banned ? 'success' : 'warning'}
        onClick={() => onToggleBan(id)}
      >
        {banned ? (
          <CheckCircleOutlined fontSize="small" />
        ) : (
          <BlockOutlined fontSize="small" />
        )}
      </GuardedIconButton>
      <GuardedIconButton
        title="Delete"
        reason={guard?.del}
        label={`Delete user ${username}`}
        testId={`delete-user-${id}`}
        color="error"
        onClick={() => onDelete(user)}
      >
        <DeleteOutlined fontSize="small" />
      </GuardedIconButton>
    </>
  )
}
