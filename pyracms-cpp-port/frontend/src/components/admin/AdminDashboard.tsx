'use client'

import { Box, Grid } from '@mui/material'
import {
  PeopleOutlined,
  ArticleOutlined,
  ForumOutlined,
  FolderOutlined,
  StorageOutlined,
} from '@mui/icons-material'
import StatCard from './StatCard'
import ActivityChart from './ActivityChart'
import QuickActionsPanel from './QuickActionsPanel'
import RecentActivityList from './RecentActivityList'

const STATS = [
  {
    label: 'Total Users', value: 1247,
    icon: <PeopleOutlined />, color: '#1976d2',
  },
  {
    label: 'Total Articles', value: 384,
    icon: <ArticleOutlined />, color: '#2e7d32',
  },
  {
    label: 'Total Posts', value: 8921,
    icon: <ForumOutlined />, color: '#ed6c02',
  },
  {
    label: 'Total Files', value: 562,
    icon: <FolderOutlined />, color: '#9c27b0',
  },
  {
    label: 'Storage Used', value: 24,
    icon: <StorageOutlined />, color: '#d32f2f',
  },
]

export function AdminDashboard() {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column', gap: 4,
    }}>
      <Grid container spacing={2}>
        {STATS.map((stat) => (
          <Grid
            item xs={12} sm={6} md
            key={stat.label}
          >
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ActivityChart />
        </Grid>
        <Grid item xs={12} md={4}>
          <QuickActionsPanel />
        </Grid>
      </Grid>

      <RecentActivityList />
    </Box>
  )
}
