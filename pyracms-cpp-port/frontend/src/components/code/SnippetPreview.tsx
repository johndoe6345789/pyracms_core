'use client'

import { Box } from '@mui/material'

/** First lines of a snippet with a fade-out at the bottom. */
export function SnippetPreview({ code }: { code: string }) {
  const lines = code.split('\n').slice(0, 6).join('\n')
  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 1.5,
        bgcolor: '#1e293b',
        color: '#e2e8f0',
        fontFamily: '"Fira Code", monospace',
        fontSize: '0.75rem',
        lineHeight: 1.5,
        overflow: 'hidden',
        whiteSpace: 'pre',
        borderRadius: 1,
        maxHeight: 120,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 24,
          background: 'linear-gradient(transparent, #1e293b)',
        },
      }}
    >
      <code>{lines}</code>
    </Box>
  )
}
