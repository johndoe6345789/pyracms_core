'use client'

import {
  Box, Grid, Typography, Paper, Button, List, ListItem, ListItemIcon, ListItemText, Chip, Divider,
} from '@mui/material'
import {
  PeopleOutlined, ArticleOutlined, ForumOutlined, FolderOutlined,
  StorageOutlined, AddOutlined, PostAddOutlined, UploadFileOutlined,
  CheckCircleOutlined, WarningOutlined, EditOutlined, PersonAddOutlined,
  DeleteOutlined, VisibilityOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import StatCard from './StatCard'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const STATS = [
  { label: 'Total Users', value: 1247, icon: <PeopleOutlined />, color: '#1976d2' },
  { label: 'Total Articles', value: 384, icon: <ArticleOutlined />, color: '#2e7d32' },
  { label: 'Total Posts', value: 8921, icon: <ForumOutlined />, color: '#ed6c02' },
  { label: 'Total Files', value: 562, icon: <FolderOutlined />, color: '#9c27b0' },
  { label: 'Storage Used', value: 24, icon: <StorageOutlined />, color: '#d32f2f' },
]

const ACTIVITY_DATA = [
  { day: 'Mon', actions: 42 },
  { day: 'Tue', actions: 56 },
  { day: 'Wed', actions: 38 },
  { day: 'Thu', actions: 71 },
  { day: 'Fri', actions: 63 },
  { day: 'Sat', actions: 29 },
  { day: 'Sun', actions: 35 },
]

interface ActivityItem {
  id: string
  icon: React.ReactNode
  text: string
  time: string
  type: 'create' | 'edit' | 'delete' | 'user'
}

const RECENT_ACTIVITY: ActivityItem[] = [
  { id: '1', icon: <EditOutlined fontSize="small" />, text: 'Alice edited "Getting Started with Next.js"', time: '5 min ago', type: 'edit' },
  { id: '2', icon: <PersonAddOutlined fontSize="small" />, text: 'New user registration: charlie_dev', time: '15 min ago', type: 'user' },
  { id: '3', icon: <PostAddOutlined fontSize="small" />, text: 'Bob created new forum thread', time: '32 min ago', type: 'create' },
  { id: '4', icon: <UploadFileOutlined fontSize="small" />, text: 'Dana uploaded 3 files to gallery', time: '1 hour ago', type: 'create' },
  { id: '5', icon: <DeleteOutlined fontSize="small" />, text: 'Admin deleted spam post', time: '2 hours ago', type: 'delete' },
  { id: '6', icon: <EditOutlined fontSize="small" />, text: 'Eve updated site settings', time: '3 hours ago', type: 'edit' },
  { id: '7', icon: <PersonAddOutlined fontSize="small" />, text: 'New user registration: frank_42', time: '4 hours ago', type: 'user' },
  { id: '8', icon: <PostAddOutlined fontSize="small" />, text: 'Alice published "Advanced TypeScript Patterns"', time: '5 hours ago', type: 'create' },
  { id: '9', icon: <VisibilityOutlined fontSize="small" />, text: 'Traffic spike: 500 views on homepage', time: '6 hours ago', type: 'edit' },
  { id: '10', icon: <EditOutlined fontSize="small" />, text: 'Bob modified navigation menu', time: '8 hours ago', type: 'edit' },
]

const ACTIVITY_COLORS: Record<string, string> = {
  create: '#2e7d32',
  edit: '#1976d2',
  delete: '#d32f2f',
  user: '#9c27b0',
}

const HEALTH_INDICATORS = [
  { label: 'Database', status: 'healthy' },
  { label: 'Cache', status: 'healthy' },
  { label: 'Storage', status: 'warning' },
  { label: 'API', status: 'healthy' },
]

export function AdminDashboard() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Grid container spacing={2}>
        {STATS.map((stat) => (
          <Grid item xs={12} sm={6} md key={stat.label}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>Activity This Week</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={ACTIVITY_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="actions" stroke="#1976d2" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="outlined" startIcon={<AddOutlined />} component={Link} href="/admin/articles/new" fullWidth>
                Create Article
              </Button>
              <Button variant="outlined" startIcon={<PostAddOutlined />} component={Link} href="/admin/forum/new" fullWidth>
                New Forum Post
              </Button>
              <Button variant="outlined" startIcon={<UploadFileOutlined />} component={Link} href="/admin/files" fullWidth>
                Upload File
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>System Health</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {HEALTH_INDICATORS.map((h) => (
                <Box key={h.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{h.label}</Typography>
                  <Chip
                    icon={h.status === 'healthy' ? <CheckCircleOutlined /> : <WarningOutlined />}
                    label={h.status}
                    size="small"
                    color={h.status === 'healthy' ? 'success' : 'warning'}
                    variant="outlined"
                    sx={{ height: 24, fontSize: '0.7rem' }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderColor: 'divider' }}>
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="h6">Recent Activity</Typography>
        </Box>
        <Divider />
        <List disablePadding>
          {RECENT_ACTIVITY.map((activity, idx) => (
            <ListItem key={activity.id} divider={idx < RECENT_ACTIVITY.length - 1}>
              <ListItemIcon sx={{ minWidth: 36, color: ACTIVITY_COLORS[activity.type] }}>
                {activity.icon}
              </ListItemIcon>
              <ListItemText
                primary={activity.text}
                secondary={activity.time}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  )
}
