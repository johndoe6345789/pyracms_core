'use client'

import { Paper, Box, Typography, Avatar, IconButton } from '@mui/material'
import { EditOutlined, DeleteOutlined } from '@mui/icons-material'
import { VoteButtons } from './VoteButtons'
import type { Post } from '@/hooks/useThread'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
            {post.author.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{post.author}</Typography>
            <Typography variant="caption" color="text.secondary">{post.date}</Typography>
          </Box>
        </Box>
        {post.isOwner && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" color="primary"><EditOutlined fontSize="small" /></IconButton>
            <IconButton size="small" color="error"><DeleteOutlined fontSize="small" /></IconButton>
          </Box>
        )}
      </Box>
      <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line', lineHeight: 1.8 }}>
        {post.content}
      </Typography>
      <VoteButtons likes={post.likes} dislikes={post.dislikes} />
    </Paper>
  )
}
