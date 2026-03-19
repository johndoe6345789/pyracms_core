'use client'

import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Chip, Button, FormControl, InputLabel, Select, MenuItem, Divider,
} from '@mui/material'
import {
  ArticleOutlined, ForumOutlined, CodeOutlined, ThumbUpOutlined, TimelineOutlined,
} from '@mui/icons-material'
import api from '@/lib/api'

interface ActivityEvent {
  id: string
  type: 'post' | 'article' | 'snippet' | 'vote' | 'forum_post'
  title: string
  description: string
  date: string
  link?: string
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  post: <ForumOutlined sx={{ fontSize: 18 }} />,
  forum_post: <ForumOutlined sx={{ fontSize: 18 }} />,
  article: <ArticleOutlined sx={{ fontSize: 18 }} />,
  snippet: <CodeOutlined sx={{ fontSize: 18 }} />,
  vote: <ThumbUpOutlined sx={{ fontSize: 18 }} />,
}

const TYPE_COLORS: Record<string, string> = {
  post: '#ed6c02',
  forum_post: '#ed6c02',
  article: '#1976d2',
  snippet: '#2e7d32',
  vote: '#9c27b0',
}

interface ActivityTimelineProps {
  userId?: number
  activities?: ActivityEvent[]
}

export function ActivityTimeline({ userId, activities: propActivities }: ActivityTimelineProps) {
  const [apiActivities, setApiActivities] = useState<ActivityEvent[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [visibleCount, setVisibleCount] = useState(5)

  useEffect(() => {
    if (propActivities || !userId) return
    const fetchActivity = async () => {
      try {
        const res = await api.get(`/api/users/${userId}/activity?limit=50`)
        const items = (res.data || []).map((item: Record<string, string | number>) => ({
          id: String(item.id),
          type: item.type as string,
          title: item.title as string,
          description: (item.summary as string) || '',
          date: item.createdAt as string,
        }))
        setApiActivities(items)
      } catch { /* ignore */ }
    }
    fetchActivity()
  }, [userId, propActivities])

  const allActivities = propActivities ?? apiActivities

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
            <MenuItem value="forum_post">Posts</MenuItem>
            <MenuItem value="article">Articles</MenuItem>
            <MenuItem value="snippet">Snippets</MenuItem>
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
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: (TYPE_COLORS[activity.type] || '#666') + '14', color: TYPE_COLORS[activity.type] || '#666', flexShrink: 0, mt: 0.5 }}>
                {TYPE_ICONS[activity.type] || TYPE_ICONS.article}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{activity.title}</Typography>
                  <Chip label={activity.type} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: (TYPE_COLORS[activity.type] || '#666') + '20', color: TYPE_COLORS[activity.type] || '#666' }} />
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
