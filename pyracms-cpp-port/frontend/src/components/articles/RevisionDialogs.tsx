'use client'

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
} from '@mui/material'
import type { Revision } from '@/hooks/useRevisions'

interface RevisionViewDialogProps {
  open: boolean
  onClose: () => void
  revision: Revision | null
  /** Must be sanitized with DOMPurify by caller */
  sanitizedContent: string
}

/**
 * Dialog to view a specific revision.
 * The sanitizedContent prop must be pre-sanitized
 * with DOMPurify before passing to this component.
 */
export function RevisionViewDialog({
  open,
  onClose,
  revision,
  sanitizedContent,
}: RevisionViewDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="view-revision-title"
    >
      <DialogTitle id="view-revision-title">
        Revision {revision?.number}
        {' \u2014 '}
        {revision?.author}
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mb: 2 }}
        >
          {revision?.date}
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          <div
            data-testid="revision-content"
            dangerouslySetInnerHTML={{
              __html: sanitizedContent,
            }}
          />
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          data-testid="close-revision-dialog"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface RevertConfirmDialogProps {
  revisionNumber: number | null
  onClose: () => void
  onConfirm: () => void
}

export function RevertConfirmDialog({
  revisionNumber,
  onClose,
  onConfirm,
}: RevertConfirmDialogProps) {
  return (
    <Dialog
      open={revisionNumber !== null}
      onClose={onClose}
      aria-labelledby="revert-dialog-title"
    >
      <DialogTitle id="revert-dialog-title">
        Revert to revision {revisionNumber}?
      </DialogTitle>
      <DialogActions>
        <Button
          onClick={onClose}
          data-testid="cancel-revert"
        >
          Cancel
        </Button>
        <Button
          color="warning"
          onClick={onConfirm}
          data-testid="confirm-revert"
        >
          Revert
        </Button>
      </DialogActions>
    </Dialog>
  )
}
