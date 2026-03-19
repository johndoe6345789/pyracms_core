'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'

interface MoveThreadDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (forumId: string) => void
  forums: { id: string; name: string }[]
  targetForum: string
  onTargetForumChange: (value: string) => void
}

export function MoveThreadDialog({
  open,
  onClose,
  onConfirm,
  forums,
  targetForum,
  onTargetForumChange,
}: MoveThreadDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid="move-thread-dialog"
    >
      <DialogTitle>Move Thread</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Select the forum to move this
          thread to:
        </DialogContentText>
        <FormControl fullWidth size="small">
          <InputLabel>Target Forum</InputLabel>
          <Select
            value={targetForum}
            label="Target Forum"
            onChange={(e) =>
              onTargetForumChange(
                e.target.value
              )
            }
            data-testid="move-thread-select"
          >
            {forums.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          data-testid="move-thread-cancel"
        >
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm(targetForum)}
          variant="contained"
          disabled={!targetForum}
          data-testid="move-thread-confirm"
        >
          Move
        </Button>
      </DialogActions>
    </Dialog>
  )
}
