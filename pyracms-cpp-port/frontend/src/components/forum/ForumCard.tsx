'use client'

import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material'
import {
  ForumOutlined,
  TopicOutlined,
  ChatBubbleOutlineOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import type {
  Forum,
} from '@/hooks/useForumCategories'

interface ForumCardProps {
  forum: Forum
  slug: string
  isFirst: boolean
  isLast: boolean
}

export function ForumCard(
  { forum, slug, isFirst, isLast }:
  ForumCardProps,
) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: 0,
        borderRight: 0,
        borderTop: isFirst ? 0 : undefined,
        borderBottom: isLast ? 0 : undefined,
        borderRadius: 0,
        transition:
          'background-color 0.15s',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
      data-testid={
        `forum-card-${forum.id}`
      }
    >
      <CardActionArea
        component={Link}
        href={
          `/site/${slug}/forum/${forum.id}`
        }
        aria-label={
          `Open forum: ${forum.name}`
        }
        data-testid={
          `forum-link-${forum.id}`
        }
      >
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            px: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <ForumOutlined
              sx={{
                color: 'primary.main',
                fontSize: 28,
              }}
              aria-hidden="true"
            />
            <Box>
              <Typography
                variant="h6"
                component="h3"
              >
                {forum.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {forum.description}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexShrink: 0,
            }}
          >
            <Chip
              icon={<TopicOutlined />}
              label={
                `${forum.threads} threads`
              }
              size="small"
              variant="outlined"
            />
            <Chip
              icon={
                <ChatBubbleOutlineOutlined />
              }
              label={
                `${forum.posts} posts`
              }
              size="small"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
