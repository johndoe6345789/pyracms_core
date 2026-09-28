'use client'

import { useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { dayOf } from '@/lib/dates'
import { formatViews } from '@/lib/videoFormat'
import { clamp } from './VideoCard'

interface Props {
  viewCount: number
  createdAt: string
  description: string
}

const isLong = (text: string) =>
  text.length > 200 || text.split('\n').length > 3

/** Grey box with views, date and a description that expands. */
export default function VideoDescription(p: Props) {
  const [open, setOpen] = useState(false)
  const long = isLong(p.description)
  return (
    <Box
      data-testid="video-description"
      sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 1.5, my: 2 }}
    >
      <Typography variant="body2" fontWeight={600}>
        {formatViews(p.viewCount)} · {dayOf(p.createdAt)}
      </Typography>
      {p.description && (
        <Typography
          variant="body2"
          sx={{ whiteSpace: 'pre-wrap', ...(long && !open ? clamp(3) : {}) }}
        >
          {p.description}
        </Typography>
      )}
      {long && (
        <Button
          size="small"
          onClick={() => setOpen(!open)}
          sx={{ px: 0 }}
          data-testid="video-description-toggle"
        >
          {open ? 'Show less' : 'Show more'}
        </Button>
      )}
    </Box>
  )
}
