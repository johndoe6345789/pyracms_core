import { Button, DialogActions } from '@mui/material'

interface Props {
  saving: boolean
  canSave: boolean
  onClose: () => void
  onSave: () => void
}

export default function EditUserActions({
  saving, canSave, onClose, onSave,
}: Props) {
  return (
    <DialogActions>
      <Button onClick={onClose} data-testid="cancel-edit-user-btn">
        Cancel
      </Button>
      <Button
        variant="contained"
        disabled={saving || !canSave}
        onClick={onSave}
        data-testid="save-edit-user-btn"
      >
        {saving ? 'Saving...' : 'Save'}
      </Button>
    </DialogActions>
  )
}
