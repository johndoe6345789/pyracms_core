'use client'

import { Box, Button, Alert } from '@mui/material'
import { SendOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { CreateThreadFields } from './CreateThreadFields'

interface CreateThreadFormProps {
  slug: string
  cancelHref?: string
  title: string
  setTitle: (v: string) => void
  description: string
  setDescription: (v: string) => void
  content: string
  setContent: (v: string) => void
  loading?: boolean | undefined
  error?: string | undefined
  onSubmit?: (() => void) | undefined
}

export function CreateThreadForm(props: CreateThreadFormProps) {
  const { slug, cancelHref, loading, error, onSubmit } = props
  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      data-testid="create-thread-form"
      role="form"
      aria-label="Create thread form"
    >
      {error && (
        <Alert severity="error" data-testid="form-error-alert">
          {error}
        </Alert>
      )}
      <CreateThreadFields {...props} />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          endIcon={<SendOutlined />}
          size="large"
          {...(onSubmit ? { onClick: onSubmit } : {})}
          {...(loading === undefined ? {} : { disabled: loading })}
          aria-label="Create thread"
          data-testid="create-thread-submit"
        >
          {loading ? 'Creating...' : 'Create Thread'}
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={cancelHref ?? `/site/${slug}/forum`}
          data-testid="create-thread-cancel"
        >
          Cancel
        </Button>
      </Box>
    </Box>
  )
}
