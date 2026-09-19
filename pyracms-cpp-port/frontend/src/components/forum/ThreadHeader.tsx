'use client'

import { Box, Chip, Typography } from '@mui/material'
import { LockOutlined, PushPinOutlined } from '@mui/icons-material'
import type { ReactNode } from 'react'
import type { ThreadInfo } from '@/hooks/useThread'

interface Props {
  thread: ThreadInfo
  actions: ReactNode
}

export function ThreadHeader({ thread, actions }: Props) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h3" component="h1" sx={{ flexGrow: 1 }}>
          {thread.title}
        </Typography>
        {actions}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
        {thread.pinned && (
          <Chip
            icon={<PushPinOutlined />}
            label="Pinned"
            size="small"
            color="primary"
          />
        )}
        {thread.locked && (
          <Chip
            icon={<LockOutlined />}
            label="Locked"
            size="small"
            variant="outlined"
          />
        )}
      </Box>
      {thread.description && (
        <Typography variant="body1" color="text.secondary">
          {thread.description}
        </Typography>
      )}
    </Box>
  )
}
