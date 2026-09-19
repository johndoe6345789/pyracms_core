'use client'

import { Box, Pagination } from '@mui/material'
import { PostCard } from './PostCard'
import type { Post } from '@/hooks/useThread'

const PAGE_SIZE = 20

interface Props {
  posts: Post[]
  page: number
  onPage: (p: number) => void
  canVote: boolean
  canQuote: boolean
  onVote: (id: string, like: boolean) => void
  onEdit: (id: string, content: string) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
  onQuote: (author: string, content: string) => void
}

export function PostList(p: Props) {
  const pages = Math.max(1, Math.ceil(p.posts.length / PAGE_SIZE))
  const current = Math.min(p.page, pages)
  const visible = p.posts.slice(
    (current - 1) * PAGE_SIZE, current * PAGE_SIZE,
  )
  return (
    <>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        data-testid="posts-list"
        role="list"
        aria-label="Thread posts"
      >
        {visible.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            canVote={p.canVote}
            onVote={p.onVote}
            onEdit={p.onEdit}
            onDelete={p.onDelete}
            {...(p.canQuote ? { onQuote: p.onQuote } : {})}
          />
        ))}
      </Box>
      {pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pages}
            page={current}
            onChange={(_, v) => p.onPage(v)}
            color="primary"
            aria-label="Post pagination"
            data-testid="post-pagination"
          />
        </Box>
      )}
    </>
  )
}
