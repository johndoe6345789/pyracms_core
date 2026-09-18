'use client'

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Pagination,
} from '@mui/material'
import { useState } from 'react'
import type { ThreadSummary } from '@/hooks/useThreadList'
import { ThreadRow } from './ThreadRow'

const PAGE_SIZE = 20
const HEAD: [string, 'left' | 'center'][] = [
  ['Thread', 'left'], ['Author', 'left'], ['Replies', 'center'],
  ['Views', 'center'], ['Last Post', 'left'],
]

interface ThreadTableProps {
  threads: ThreadSummary[]
  slug: string
}

export function ThreadTable({ threads, slug }: ThreadTableProps) {
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
              {HEAD.map(([label, align]) => (
                <TableCell key={label} align={align}
                  sx={{ fontWeight: 600 }}>
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((thread) => (
              <ThreadRow key={thread.id} thread={thread} slug={slug} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pages}
            page={current}
            onChange={(_, v) => setPage(v)}
            color="primary"
            aria-label="Thread pagination"
            data-testid="thread-pagination"
          />
        </Box>
      )}
    </>
  )
}
