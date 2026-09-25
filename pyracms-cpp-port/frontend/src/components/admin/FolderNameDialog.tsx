import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'

interface Props {
  open: boolean
  onClose: () => void
  onCreate: (name: string) => void
}

/** Asks for the name of a new folder. */
export default function FolderNameDialog({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const bad = /[\\/]/.test(name) || name.trim() === '..' || name.trim() === '.'
  const go = () => {
    onCreate(name)
    setName('')
    onClose()
  }
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>New folder</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label="Folder name"
          value={name}
          error={bad}
          helperText={bad ? 'No slashes, and not . or ..' : ' '}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && !bad && go()}
          inputProps={{ 'data-testid': 'folder-name-input', maxLength: 100 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!name.trim() || bad}
          onClick={go}
          data-testid="folder-create-btn"
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}
