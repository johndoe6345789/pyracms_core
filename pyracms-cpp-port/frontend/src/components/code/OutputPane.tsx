'use client'

import { Box } from '@mui/material'

const FONT = '"Fira Code", "JetBrains Mono", monospace'

interface Props {
  text: string
  testId: string
  error?: boolean
}

/** A dark monospace pane showing stdout or stderr text. */
export function OutputPane({ text, testId, error }: Props) {
  return (
    <Box
      component="pre"
      data-testid={testId}
      sx={{
        m: 0, px: 3, py: 2,
        bgcolor: error ? '#1c1017' : '#1e293b',
        color: error ? '#fca5a5' : '#e2e8f0',
        fontFamily: FONT,
        fontSize: '0.875rem',
        lineHeight: 1.7,
        overflow: 'auto',
        whiteSpace: 'pre',
      }}
    >
      <code>{text}</code>
    </Box>
  )
}
