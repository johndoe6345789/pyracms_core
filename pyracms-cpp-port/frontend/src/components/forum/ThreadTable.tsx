'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  Pagination,
} from '@mui/material'
import { useState } from 'react'
import {
  LockOutlined,
  PersonOutlined,
  VisibilityOutlined,
  ChatBubbleOutlineOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import type {
  ThreadSummary,
} from '@/hooks/useThreadList'

const PAGE_SIZE = 20

interface ThreadTableProps {
  threads: ThreadSummary[]
  slug: string
}

export function ThreadTable(
  { threads, slug }: ThreadTableProps,
) {
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(threads.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const visible = threads.slice(
    (current - 1) * PAGE_SIZE, current * PAGE_SIZE,
  )
  return (
    <>
      <TableContainer
        component={Paper}
        variant="outlined"
        data-testid="thread-table"
      >
        <Table aria-label="Forum threads">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ fontWeight: 600 }}
              >
                Thread
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600 }}
              >
                Author
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600 }}
                align="center"
              >
                Replies
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600 }}
                align="center"
              >
                Views
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600 }}
              >
                Last Post
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((thread) => (
              <ThreadRow
                key={thread.id}
                thread={thread}
                slug={slug}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {pages > 1 && <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 4,
        }}
      >
        <Pagination
          count={pages}
          page={current}
          onChange={(_, v) => setPage(v)}
          color="primary"
          aria-label="Thread pagination"
          data-testid="thread-pagination"
        />
      </Box>}
    </>
  )
}

function ThreadRow(
  { thread, slug }:
  { thread: ThreadSummary; slug: string },
) {
  const threadUrl =
    `/site/${slug}/forum/thread/${thread.id}`
  return (
    <TableRow
      hover
      sx={{ cursor: 'pointer' }}
      component={Link}
      href={threadUrl}
      style={{ textDecoration: 'none' }}
      data-testid={
        `thread-row-${thread.id}`
      }
    >
      <TableCell>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: 500 }}
          >
            {thread.title}
          </Typography>
          {thread.pinned && (
            <Chip
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
      </TableCell>
      <TableCell>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <PersonOutlined
            sx={{
              fontSize: 16,
              color: 'text.secondary',
            }}
            aria-hidden="true"
          />
          <Typography variant="body2">
            {thread.author}
          </Typography>
        </Box>
      </TableCell>
      <TableCell align="center">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
        >
          <ChatBubbleOutlineOutlined
            sx={{
              fontSize: 16,
              color: 'text.secondary',
            }}
            aria-hidden="true"
          />
          <Typography variant="body2">
            {thread.replies}
          </Typography>
        </Box>
      </TableCell>
      <TableCell align="center">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
        >
          <VisibilityOutlined
            sx={{
              fontSize: 16,
              color: 'text.secondary',
            }}
            aria-hidden="true"
          />
          <Typography variant="body2">
            {thread.views}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {thread.lastPostDate}
        </Typography>
      </TableCell>
    </TableRow>
  )
}
