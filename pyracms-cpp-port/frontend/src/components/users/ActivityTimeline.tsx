'use client'
import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Button,
  FormControl, InputLabel,
  Select, MenuItem, Divider,
} from '@mui/material'
import { TimelineOutlined } from '@mui/icons-material'
import api from '@/lib/api'
import { ActivityItem, type ActivityEvent,
} from './ActivityItem'

export function ActivityTimeline({ userId,
  activities: propActs,
}: {
  userId?: number; activities?: ActivityEvent[]
}) {
  const [apiActs, setApiActs] = useState<
    ActivityEvent[]>([])
  const [filter, setFilter] = useState('all')
  const [n, setN] = useState(5)
  useEffect(() => {
    if (propActs || !userId) return
    ;(async () => {
      try {
        const res = await api.get(
          `/api/users/${userId}/activity?limit=50`)
        setApiActs((res.data || []).map(
          (r: Record<string, unknown>) => ({
            id: String(r.id),
            type: r.type as string,
            title: r.title as string,
            description:
              (r.summary as string) || '',
            date: r.createdAt as string,
          })))
      } catch { /* ignore */ }
    })()
  }, [userId, propActs])
  const all = propActs ?? apiActs
  const list = filter === 'all'
    ? all : all.filter((a) => a.type === filter)
  const vis = list.slice(0, n)
  return (
    <Paper variant="outlined"
      sx={{ borderColor: 'divider' }}
      data-testid="activity-timeline">
      <Box sx={{ px: 3, py: 2, display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center' }}>
        <Box sx={{ display: 'flex',
          alignItems: 'center', gap: 1 }}>
          <TimelineOutlined />
          <Typography variant="h6">
            Activity</Typography>
        </Box>
        <FormControl size="small"
          sx={{ minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select value={filter} label="Filter"
            data-testid="activity-filter"
            onChange={(e) => {
              setFilter(e.target.value); setN(5)
            }}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="forum_post">
              Posts</MenuItem>
            <MenuItem value="article">
              Articles</MenuItem>
            <MenuItem value="snippet">
              Snippets</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Divider />
      {vis.length === 0 ? (
        <Typography color="text.secondary"
          sx={{ p: 3 }}>No activity found.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex',
          flexDirection: 'column' }}>
          {vis.map((act, i) => (
            <ActivityItem key={act.id}
              activity={act}
              isLast={i === vis.length - 1} />
          ))}
        </Box>
      )}
      {n < list.length && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Button size="small"
            data-testid="load-more-activity"
            onClick={() => setN((c) => c + 5)}>
            Load More</Button>
        </Box>
      )}
    </Paper>
  )
}
