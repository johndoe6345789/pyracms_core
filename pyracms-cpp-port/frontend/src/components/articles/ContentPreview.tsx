'use client'

import {
  Box,
  Paper,
  Typography,
  Divider,
} from '@mui/material'
import DOMPurify from 'dompurify'

interface ContentPreviewProps {
  content: string
  renderer: string
}

const PREVIEW_STYLES = {
  '& h2': {
    mt: 2,
    mb: 1,
    fontWeight: 600,
    fontSize: '1.5rem',
  },
  '& p': { mb: 2, lineHeight: 1.8 },
}

/**
 * Renders article content preview.
 * Content is sanitized with DOMPurify before
 * being rendered as HTML.
 */
export function ContentPreview({
  content,
  renderer,
}: ContentPreviewProps) {
  // Sanitized via DOMPurify before rendering
  const sanitized =
    DOMPurify.sanitize(content)

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        minHeight: 300,
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ mb: 2 }}
      >
        Preview ({renderer})
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {content ? (
        <Box
          data-testid="content-preview"
          dangerouslySetInnerHTML={{
            __html: sanitized,
          }}
          sx={PREVIEW_STYLES}
        />
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Nothing to preview yet.
          Start writing in the editor.
        </Typography>
      )}
    </Paper>
  )
}
