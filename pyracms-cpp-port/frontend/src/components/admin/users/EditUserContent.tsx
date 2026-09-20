import { DialogContent, Alert } from '@mui/material'
import type { UserRow } from '@/hooks/admin/userRow'
import type { Actor } from '@/lib/userGuards'
import EditUserFields from './EditUserFields'
import EditUserRole from './EditUserRole'
import type { useEditUserForm } from './useEditUserForm'

interface Props {
  error: string
  user: UserRow | null
  actor: Actor
  form: ReturnType<typeof useEditUserForm>
}

/** Error banner, profile fields and the level picker of the dialog. */
export default function EditUserContent({ error, user, actor, form }: Props) {
  return (
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
        fullName={form.fullName}
        email={form.email}
        onFullName={form.setFullName}
        onEmail={form.setEmail}
      />
      {user && (
        <EditUserRole
          actor={actor}
          target={user}
          value={form.role}
          onChange={form.setRole}
        />
      )}
    </DialogContent>
  )
}
