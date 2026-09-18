'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'
import { MODE_INFO, type EditorMode } from './editorModes'

interface ModeSwitchDialogProps {
  from: EditorMode
  pending: EditorMode | null
  onCancel: () => void
  onConfirm: () => void
}

export function ModeSwitchDialog({
  from,
  pending,
  onCancel,
  onConfirm,
}: ModeSwitchDialogProps) {
  return (
    <Dialog open={pending !== null} onClose={onCancel}>
      <DialogTitle>Switch Editor Mode?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Switching from {MODE_INFO[from].label} to{' '}
          {pending ? MODE_INFO[pending].label : ''}{' '}
          may cause content formatting to be lost or
          rendered incorrectly. The content will not be
          automatically converted between formats.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="warning"
        >
          Switch Anyway
        </Button>
      </DialogActions>
    </Dialog>
  )
}
