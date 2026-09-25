import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material'
import type { FileItem } from '@/hooks/useFileManager'

interface Props {
  file: FileItem | null
  folders: string[]
  onClose: () => void
  onMove: (file: FileItem, folder: string) => void
}

/** Pick the folder to move a file to. */
export default function MoveFileDialog({
  file,
  folders,
  onClose,
  onMove,
}: Props) {
  const [to, setTo] = useState('')
  return (
    <Dialog open={!!file} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Move {file?.name}</DialogTitle>
      <DialogContent>
        <TextField
          select
          fullWidth
          margin="dense"
          label="Folder"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          data-testid="move-folder-select"
        >
          <MenuItem value="">All files (top level)</MenuItem>
          {folders.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          data-testid="move-confirm-btn"
          onClick={() => {
            if (file) onMove(file, to)
            onClose()
          }}
        >
          Move
        </Button>
      </DialogActions>
    </Dialog>
  )
}
