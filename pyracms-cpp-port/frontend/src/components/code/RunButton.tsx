'use client'

import { Button, Tooltip } from '@mui/material'
import { PlayArrowOutlined } from '@mui/icons-material'

interface Props {
  label: string
  runningLabel: string
  testId: string
  running: boolean
  disabled?: boolean
  runnable: boolean
  onClick: () => void
}

/** Green run button that explains why it is disabled. */
export function RunButton(p: Props) {
  return (
    <Tooltip
      title={p.runnable ? '' : 'Running is not supported for this language'}
    >
      <span>
        <Button
          variant="contained"
          color="success"
          startIcon={<PlayArrowOutlined />}
          onClick={p.onClick}
          disabled={p.running || !p.runnable || Boolean(p.disabled)}
          data-testid={p.testId}
          aria-label="Run snippet"
        >
          {p.running ? p.runningLabel : p.label}
        </Button>
      </span>
    </Tooltip>
  )
}
