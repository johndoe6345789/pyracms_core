'use client'

import { Box } from '@mui/material'
import { CodeEditor } from './CodeEditor'
import type { Snippet } from '@/lib/snippets'

export function SnippetCodeBlock({ snippet }: { snippet: Snippet }) {
  const lines = snippet.code.split('\n').length
  const height = `${Math.min(600, Math.max(120, lines * 19 + 20))}px`
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        mb: 3,
      }}
      data-testid="snippet-code-block"
    >
      <CodeEditor
        value={snippet.code}
        language={snippet.language}
        readOnly
        height={height}
      />
    </Box>
  )
}
