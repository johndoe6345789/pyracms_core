'use client'

import { Paper, Typography, Divider } from '@mui/material'

export { HtmlPreviewContent } from './HtmlPreviewContent'

interface EditorPreviewPaneProps {
  label?: string
  children: React.ReactNode
}

export function EditorPreviewPane({
  label = 'Preview',
  children,
}: EditorPreviewPaneProps) {
  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        overflow: 'auto',
        borderRadius: 0,
      }}
      elevation={0}
    >
      <Typography
        variant="subtitle2"
        color="text.secondary"
        gutterBottom
      >
        {label}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Paper>
  )
}

interface EmptyPreviewProps {
  message?: string
}

export function EmptyPreview({
  message = 'Nothing to preview yet.',
}: EmptyPreviewProps) {
  return (
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  )
}
