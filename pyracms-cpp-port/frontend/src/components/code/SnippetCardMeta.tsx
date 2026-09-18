'use client'

import { Box, Typography } from '@mui/material'
import { PlayArrowOutlined } from '@mui/icons-material'

interface Props {
  author: string
  date: string
  runCount: number
}

export function SnippetCardMeta({ author, date, runCount }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
      <Typography variant="caption" color="text.secondary">
        {author}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {date}
      </Typography>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto',
      }}>
        <PlayArrowOutlined aria-hidden="true"
          sx={{ fontSize: 14, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {runCount} runs
        </Typography>
      </Box>
    </Box>
  )
}
