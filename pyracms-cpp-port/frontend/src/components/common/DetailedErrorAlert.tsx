'use client'

import { useState } from 'react'
import { Alert, Box, Collapse, IconButton, Tooltip } from '@mui/material'
import { ExpandMore } from '@mui/icons-material'

interface Props {
  message: string
  /** Shown behind the down arrow; the arrow is hidden when empty */
  details?: string
  testId: string
}

/** An error with the reason up front and more information on demand. */
export function DetailedErrorAlert({ message, details, testId }: Props) {
  const [open, setOpen] = useState(false)
  if (!message) return null
  return (
    <Alert
      severity="error"
      role="alert"
      data-testid={testId}
      sx={{ mb: 2 }}
      action={
        details ? (
          <Tooltip title={open ? 'Hide details' : 'Show details'}>
            <IconButton
              size="small"
              color="inherit"
              aria-label={open ? 'Hide details' : 'Show details'}
              aria-expanded={open}
              data-testid={`${testId}-toggle`}
              onClick={() => setOpen((o) => !o)}
            >
              <ExpandMore
                sx={{
                  transform: open ? 'rotate(180deg)' : 'none',
                  transition: 'transform .2s',
                }}
              />
            </IconButton>
          </Tooltip>
        ) : undefined
      }
    >
      {message}
      {details && (
        <Collapse in={open} unmountOnExit>
          <Box
            component="pre"
            data-testid={`${testId}-details`}
            sx={{ m: 0, mt: 1, whiteSpace: 'pre-wrap', fontSize: 13 }}
          >
            {details}
          </Box>
        </Collapse>
      )}
    </Alert>
  )
}
