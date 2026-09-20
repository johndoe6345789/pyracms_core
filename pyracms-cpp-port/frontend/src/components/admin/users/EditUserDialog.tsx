import { Dialog, DialogTitle } from '@mui/material'
import type { UserRow } from '@/hooks/admin/userRow'
import type { UserProfileFields } from '@/hooks/admin/useUserEdit'
import EditUserContent from './EditUserContent'
import EditUserActions from './EditUserActions'
import { useActor } from '@/hooks/useActor'
import type { Actor } from '@/lib/userGuards'
import { useEditUserForm } from './useEditUserForm'

interface Props {
  user: UserRow | null
  saving: boolean
  error: string
  onClose: () => void
  onSave: (fields: UserProfileFields) => void
  actor?: Actor | undefined
}

export default function EditUserDialog({
  user,
  saving,
  error,
  onClose,
  onSave,
  actor,
}: Props) {
  const form = useEditUserForm(user)
  const { fullName, email, role } = form
  const own = useActor()
  const who = actor ?? own

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
      <EditUserContent error={error} user={user} actor={who} form={form} />
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
