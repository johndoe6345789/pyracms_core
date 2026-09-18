import {
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert,
} from '@mui/material'
import type { CreateUserState } from './useCreateUser'

export default function CreateUserDialog({
  s,
}: {
  s: CreateUserState
}) {
  return (
    <Dialog
      open={s.open}
      onClose={() => s.setOpen(false)}
      maxWidth="sm"
      fullWidth
      data-testid="create-user-dialog"
      aria-labelledby="create-user-title"
    >
      <DialogTitle id="create-user-title">
        Create User
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pt: '16px !important',
        }}
      >
        {s.error && (
          <Alert
            severity="error"
            data-testid="create-user-error"
          >
            {s.error}
          </Alert>
        )}
        <TextField
          label="Username"
          value={s.username}
          onChange={(e) => s.setUsername(e.target.value)}
          required
          size="small"
          data-testid="new-username-input"
        />
        <TextField
          label="Email"
          type="email"
          value={s.email}
          onChange={(e) => s.setEmail(e.target.value)}
          required
          size="small"
          data-testid="new-email-input"
        />
        <TextField
          label="Full Name"
          value={s.fullName}
          onChange={(e) => s.setFullName(e.target.value)}
          size="small"
          data-testid="new-fullname-input"
        />
        <TextField
          label="Password"
          type="password"
          value={s.password}
          onChange={(e) => s.setPassword(e.target.value)}
          required
          size="small"
          data-testid="new-password-input"
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => s.setOpen(false)}
          data-testid="cancel-create-btn"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={s.submit}
          disabled={!s.canSubmit}
          data-testid="submit-create-btn"
        >
          {s.creating ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
