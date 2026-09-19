'use client'

import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { ForumOutlined } from '@mui/icons-material'

export function ForumLoading() {
  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', py: 8 }}
      data-testid="forum-loading"
    >
      <CircularProgress aria-label="Loading" />
    </Box>
  )
}

export function ForumError({ message }: { message: string }) {
  return (
    <Alert severity="error" data-testid="forum-error">
      {message}
    </Alert>
  )
}

export function ForumEmpty({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children?: React.ReactNode
}) {
  return (
    <Box
      sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}
      data-testid="forum-empty"
    >
      <ForumOutlined sx={{ fontSize: 48, mb: 1 }} aria-hidden="true" />
      <Typography variant="h6">{title}</Typography>
      {hint && <Typography variant="body2">{hint}</Typography>}
      {children}
    </Box>
  )
}
