'use client'

import { Box, Chip } from '@mui/material'
import { TopicOutlined, ChatBubbleOutlineOutlined } from '@mui/icons-material'
import type { Forum } from '@/hooks/useForumCategories'

export function ForumCardStats({ forum }: { forum: Forum }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexShrink: 0 }}>
      <Chip
        icon={<TopicOutlined />}
        label={`${forum.threads} threads`}
        size="small"
        variant="outlined"
      />
      <Chip
        icon={<ChatBubbleOutlineOutlined />}
        label={`${forum.posts} posts`}
        size="small"
        variant="outlined"
      />
    </Box>
  )
}
