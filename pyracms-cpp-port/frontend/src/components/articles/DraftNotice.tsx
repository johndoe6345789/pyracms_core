'use client'

import { Alert, Button } from '@mui/material'

interface Props {
  onDiscard: () => void
}

/** Shown when text from an earlier, unsaved session was put back. */
export function DraftNotice({ onDiscard }: Props) {
  return (
    <Alert
      severity="info"
      data-testid="draft-notice"
      sx={{ mb: 1 }}
      action={
        <Button
          color="inherit"
          size="small"
          onClick={onDiscard}
          data-testid="draft-discard"
        >
          Discard
        </Button>
      }
    >
      Restored your unsaved draft.
    </Alert>
  )
}
