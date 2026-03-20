'use client'

import {
  Button, Dialog, DialogTitle,
  DialogContent, DialogActions,
  Typography, Paper,
} from '@mui/material'
import type { Revision } from '@/hooks/useRevisions'

interface RevisionViewDialogProps {
  open: boolean
  onClose: () => void
  revision: Revision | null
  /**
   * Content MUST be sanitized with DOMPurify
   * by the caller before passing here.
   */
  sanitizedContent: string
}

/**
 * Displays a revision's pre-sanitized content
 * in a modal dialog. Caller is responsible for
 * DOMPurify sanitization of the content prop.
 */
export function RevisionViewDialog({
  open, onClose, revision, sanitizedContent,
}: RevisionViewDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="view-rev-title"
    >
      <DialogTitle id="view-rev-title">
        Revision {revision?.number}
        {' \u2014 '}{revision?.author}
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
            p: 2, maxHeight: 400,
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
