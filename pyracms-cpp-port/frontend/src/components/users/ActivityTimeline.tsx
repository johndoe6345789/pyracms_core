'use client'

import { useState } from 'react'
import {
  Box, Paper, Typography, Chip, Button, FormControl, InputLabel, Select, MenuItem, Divider,
} from '@mui/material'
import {
  ArticleOutlined, ForumOutlined, CodeOutlined, ThumbUpOutlined, TimelineOutlined,
} from '@mui/icons-material'

interface ActivityEvent {
  id: string
  type: 'post' | 'article' | 'snippet' | 'vote'
  title: string
  description: string
  date: string
  link?: string
}

const PLACEHOLDER_ACTIVITIES: ActivityEvent[] = [
  { id: '1', type: 'post', title: 'Replied to "Next.js vs Remix"', description: 'Great points from everyone. I should also mention...', date: '2026-03-18 09:15' },
  { id: '2', type: 'article', title: 'Published "Advanced TypeScript Patterns"', description: 'A deep dive into conditional types, mapped types, and template literals.', date: '2026-03-17 14:30' },
  { id: '3', type: 'snippet', title: 'Created "Fibonacci Sequence"', description: 'Python implementation of fibonacci with generator pattern.', date: '2026-03-16 11:00' },
  { id: '4', type: 'vote', title: 'Upvoted "Best practices for React"', description: '', date: '2026-03-16 09:45' },
  { id: '5', type: 'post', title: 'Started thread "Help with Docker deployment"', description: 'Having issues with multi-stage builds...', date: '2026-03-15 16:20' },
  { id: '6', type: 'article', title: 'Updated "Getting Started with Next.js"', description: 'Added section on App Router and Server Components.', date: '2026-03-14 10:00' },
  { id: '7', type: 'snippet', title: 'Forked "Quick Sort" by Bob', description: 'Added randomized pivot selection for better average case.', date: '2026-03-13 15:30' },
  { id: '8', type: 'vote', title: 'Upvoted 3 posts in "Tech Discussion"', description: '', date: '2026-03-12 12:00' },
]

const TYPE_ICONS: Record<string, React.ReactNode> = {
  post: <ForumOutlined sx={{ fontSize: 18 }} />,
  article: <ArticleOutlined sx={{ fontSize: 18 }} />,
  snippet: <CodeOutlined sx={{ fontSize: 18 }} />,
  vote: <ThumbUpOutlined sx={{ fontSize: 18 }} />,
}

const TYPE_COLORS: Record<string, string> = {
  post: '#ed6c02',
  article: '#1976d2',
  snippet: '#2e7d32',
  vote: '#9c27b0',
}

interface ActivityTimelineProps {
  activities?: ActivityEvent[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const allActivities = activities ?? PLACEHOLDER_ACTIVITIES
  const [filter, setFilter] = useState<string>('all')
  const [visibleCount, setVisibleCount] = useState(5)

  const filtered = filter === 'all' ? allActivities : allActivities.filter((a) => a.type === filter)
  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <Paper variant="outlined" sx={{ borderColor: 'divider' }}>
      <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineOutlined />
          <Typography variant="h6">Activity</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select value={filter} label="Filter" onChange={(e) => { setFilter(e.target.value); setVisibleCount(5) }}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="post">Posts</MenuItem>
            <MenuItem value="article">Articles</MenuItem>
            <MenuItem value="snippet">Snippets</MenuItem>
            <MenuItem value="vote">Votes</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Divider />

      {visible.length === 0 ? (
        <Box sx={{ p: 3 }}><Typography color="text.secondary">No activity found.</Typography></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {visible.map((activity, idx) => (
            <Box key={activity.id} sx={{ display: 'flex', gap: 2, px: 3, py: 2, borderBottom: idx < visible.length - 1 ? 1 : 0, borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: TYPE_COLORS[activity.type] + '14', color: TYPE_COLORS[activity.type], flexShrink: 0, mt: 0.5 }}>
                {TYPE_ICONS[activity.type]}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{activity.title}</Typography>
                  <Chip label={activity.type} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: TYPE_COLORS[activity.type] + '20', color: TYPE_COLORS[activity.type] }} />
                </Box>
                {activity.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }} noWrap>{activity.description}</Typography>
                )}
                <Typography variant="caption" color="text.secondary">{activity.date}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {hasMore && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Button size="small" onClick={() => setVisibleCount((c) => c + 5)}>Load More</Button>
        </Box>
      )}
    </Paper>
  )
}
