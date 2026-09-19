import { Dialog, DialogTitle, DialogContent, Alert } from '@mui/material'
import type { UserRow } from '@/hooks/admin/userRow'
import type { UserProfileFields } from '@/hooks/admin/useUserEdit'
import EditUserFields from './EditUserFields'
import EditUserRole from './EditUserRole'
import EditUserActions from './EditUserActions'
import { useCurrentRole } from '@/hooks/useCurrentRole'
import { useEditUserForm } from './useEditUserForm'

interface Props {
  user: UserRow | null
  saving: boolean
  error: string
  onClose: () => void
  onSave: (fields: UserProfileFields) => void
}

export default function EditUserDialog({
  user,
  saving,
  error,
  onClose,
  onSave,
}: Props) {
  const { fullName, setFullName, email, setEmail, role, setRole } =
    useEditUserForm(user)
  const actorRole = useCurrentRole()

  return (
    <Dialog
      open={user !== null}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      data-testid="edit-user-dialog"
      aria-labelledby="edit-user-title"
    >
      <DialogTitle id="edit-user-title">Edit {user?.username}</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pt: '16px !important',
        }}
      >
        {error && (
          <Alert severity="error" data-testid="edit-user-error">
            {error}
          </Alert>
        )}
        <EditUserFields
          fullName={fullName}
          email={email}
          onFullName={setFullName}
          onEmail={setEmail}
        />
        <EditUserRole actorRole={actorRole} value={role} onChange={setRole} />
      </DialogContent>
      <EditUserActions
        saving={saving}
        canSave={!!email.trim()}
        onClose={onClose}
        onSave={() =>
          onSave({
            fullName: fullName.trim(),
            email: email.trim(),
            role,
          })
        }
      />
    </Dialog>
  )
}
