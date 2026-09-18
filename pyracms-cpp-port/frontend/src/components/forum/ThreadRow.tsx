'use client'

import { Box, Chip, TableCell, TableRow, Typography } from '@mui/material'
import {
  LockOutlined, PersonOutlined, VisibilityOutlined,
  ChatBubbleOutlineOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import type { ThreadSummary } from '@/hooks/useThreadList'
import { StatCell } from './ThreadRowCells'

const ICON = { fontSize: 16, color: 'text.secondary' }

export function ThreadRow(
  { thread, slug }: { thread: ThreadSummary; slug: string },
) {
  return (
    <TableRow
      hover
      sx={{ cursor: 'pointer' }}
      component={Link}
      href={`/site/${slug}/forum/thread/${thread.id}`}
      style={{ textDecoration: 'none' }}
      data-testid={`thread-row-${thread.id}`}
    >
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {thread.title}
          </Typography>
          {thread.pinned && (
            <Chip label="Pinned" size="small" color="primary" />
          )}
          {thread.locked && (
            <Chip icon={<LockOutlined />} label="Locked" size="small"
              variant="outlined" />
          )}
        </Box>
      </TableCell>
      <StatCell
        icon={<PersonOutlined sx={ICON} aria-hidden="true" />}
        value={thread.author}
      />
      <StatCell center value={thread.replies}
        icon={<ChatBubbleOutlineOutlined sx={ICON} aria-hidden="true" />}
      />
      <StatCell center value={thread.views}
        icon={<VisibilityOutlined sx={ICON} aria-hidden="true" />}
      />
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {thread.lastPostDate}
        </Typography>
      </TableCell>
    </TableRow>
  )
}
