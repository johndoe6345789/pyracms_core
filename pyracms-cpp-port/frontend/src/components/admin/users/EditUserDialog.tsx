import { useEffect, useState } from 'react'
import {
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert,
} from '@mui/material'
import type { UserRow } from '@/hooks/admin/userRow'
import type { UserProfileFields } from '@/hooks/admin/useUserEdit'
import EditUserFields from './EditUserFields'

interface Props {
  user: UserRow | null
  saving: boolean
  error: string
  onClose: () => void
  onSave: (fields: UserProfileFields) => void
}

export default function EditUserDialog({
  user, saving, error, onClose, onSave,
}: Props) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    setFullName(user?.fullName ?? '')
    setEmail(user?.email ?? '')
  }, [user])

  return (
    <Dialog
      open={user !== null}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      data-testid="edit-user-dialog"
      aria-labelledby="edit-user-title"
    >
      <DialogTitle id="edit-user-title">
        Edit {user?.username}
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex', flexDirection: 'column',
          gap: 2, pt: '16px !important',
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} data-testid="cancel-edit-user-btn">
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={saving || !email.trim()}
          onClick={() => onSave({
            fullName: fullName.trim(), email: email.trim(),
          })}
          data-testid="save-edit-user-btn"
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
