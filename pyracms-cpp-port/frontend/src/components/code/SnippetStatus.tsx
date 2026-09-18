'use client'

import {
  Alert, Box, CircularProgress, Container, Typography,
} from '@mui/material'
import { BackButton } from '@/components/common/BackButton'

export function SnippetLoading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress aria-label="Loading snippet" />
    </Box>
  )
}

export function SnippetNotFound({ base }: { base: string }) {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <BackButton href={base} label="Back to Snippets" />
      <Typography sx={{ mt: 3 }} data-testid="snippet-not-found">
        Snippet not found.
      </Typography>
    </Container>
  )
}

export function SnippetActionError(
  { message, onClose }: { message: string; onClose: () => void },
) {
  if (!message) return null
  return (
    <Alert severity="error" sx={{ mb: 2 }} onClose={onClose}>
      {message}
    </Alert>
  )
}
