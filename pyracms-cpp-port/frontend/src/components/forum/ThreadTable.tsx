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
import {
  PersonOutlined,
  VisibilityOutlined,
  ChatBubbleOutlineOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import type {
  ThreadSummary,
} from '@/hooks/useThreadList'

interface ThreadTableProps {
  threads: ThreadSummary[]
  slug: string
}

export function ThreadTable(
  { threads, slug }: ThreadTableProps,
) {
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
            {threads.map((thread) => (
              <ThreadRow
                key={thread.id}
                thread={thread}
                slug={slug}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 4,
        }}
      >
        <Pagination
          count={5}
          color="primary"
          aria-label="Thread pagination"
          data-testid="thread-pagination"
        />
      </Box>
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
