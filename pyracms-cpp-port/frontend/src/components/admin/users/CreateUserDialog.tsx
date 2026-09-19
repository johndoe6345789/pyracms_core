import {
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert,
} from '@mui/material'
import type { CreateUserState } from './useCreateUser'
import CreateUserFields from './CreateUserFields'

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
        <CreateUserFields s={s} />
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
