'use client'
import { useState } from 'react'
import {
  Box, Paper, Typography, Button, Divider,
} from '@mui/material'
import { TimelineOutlined } from '@mui/icons-material'
import { ActivityItem, type ActivityEvent } from './ActivityItem'
import { ActivityFilter } from './ActivityFilter'
import { useUserActivity } from './useUserActivity'

export function ActivityTimeline({ userId, activities: propActs }: {
  userId?: number; activities?: ActivityEvent[]
}) {
  const apiActs = useUserActivity(userId, !!propActs)
  const [filter, setFilter] = useState('all')
  const [n, setN] = useState(5)
  const all = propActs ?? apiActs
  const list = filter === 'all'
    ? all : all.filter((a) => a.type === filter)
  const vis = list.slice(0, n)
  return (
    <Paper variant="outlined" sx={{ borderColor: 'divider' }}
      data-testid="activity-timeline">
      <Box sx={{
        px: 3, py: 2, display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineOutlined />
          <Typography variant="h6">Activity</Typography>
        </Box>
        <ActivityFilter value={filter}
          onChange={(v) => { setFilter(v); setN(5) }} />
      </Box>
      <Divider />
      {vis.length === 0 ? (
        <Typography color="text.secondary" sx={{ p: 3 }}>
          No activity found.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {vis.map((act, i) => (
            <ActivityItem key={act.id} activity={act}
              isLast={i === vis.length - 1} />
          ))}
        </Box>
      )}
      {n < list.length && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Button size="small" data-testid="load-more-activity"
            onClick={() => setN((c) => c + 5)}>
            Load More
          </Button>
        </Box>
      )}
    </Paper>
  )
}
