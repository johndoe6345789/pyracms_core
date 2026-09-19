'use client'

import { useState } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'

interface Props {
  status: string
  scheduledAt?: string
  busy: boolean
  onSchedule: (localDateTime: string) => void
  onClear: () => void
}

/** Pick a publish time (or clear the pending one). */
export default function ArticleSchedule(p: Props) {
  const [at, setAt] = useState('')
  const scheduled = p.status === 'scheduled'
  const when = p.scheduledAt ? new Date(p.scheduledAt) : null
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        flexWrap: 'wrap',
        mt: 1,
      }}
      data-testid="article-schedule"
    >
      {scheduled && when && (
        <Typography variant="body2" data-testid="article-scheduled-at">
          Goes live {when.toLocaleString()}
        </Typography>
      )}
      <TextField
        size="small"
        type="datetime-local"
        value={at}
        onChange={(e) => setAt(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        label="Publish at"
        data-testid="article-schedule-input"
      />
      <Button
        size="small"
        disabled={p.busy || !at}
        onClick={() => p.onSchedule(at)}
        data-testid="article-schedule-btn"
      >
        Schedule
      </Button>
      {scheduled && (
        <Button
          size="small"
          disabled={p.busy}
          onClick={p.onClear}
          data-testid="article-schedule-clear"
        >
          Clear schedule
        </Button>
      )}
    </Box>
  )
}
