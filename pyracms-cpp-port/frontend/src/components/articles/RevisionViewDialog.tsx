'use client'

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material'
import type { Revision } from '@/hooks/useRevisions'
import { ArticleContent } from './ArticleContent'

interface RevisionViewDialogProps {
  open: boolean
  onClose: () => void
  revision: Revision | null
  /** The revision's source text, shown the way the article itself is. */
  content: string
  renderer: string
}

/** A past revision rendered like the real article (ArticleContent
 * renders it and sanitises the HTML itself). */
export function RevisionViewDialog({
  open,
  onClose,
  revision,
  content,
  renderer,
}: RevisionViewDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      aria-labelledby="view-rev-title"
    >
      <DialogTitle id="view-rev-title">
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
        <ArticleContent content={content} renderer={renderer} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} data-testid="close-revision-dialog">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
