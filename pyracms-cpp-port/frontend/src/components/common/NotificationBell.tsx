'use client'

import { useState, useEffect } from 'react'
import {
  IconButton, Badge, Popover, List, ListItem, ListItemText, ListItemIcon,
  Typography, Box, Button, Divider, CircularProgress
} from '@mui/material'
import {
  NotificationsOutlined, ReplyOutlined, ThumbUpOutlined, CommentOutlined,
  InfoOutlined, GavelOutlined, MarkEmailReadOutlined
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import api from '@/lib/api'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

const typeIcons: Record<string, React.ReactNode> = {
  reply: <ReplyOutlined fontSize="small" />,
  vote: <ThumbUpOutlined fontSize="small" />,
  comment: <CommentOutlined fontSize="small" />,
  system: <InfoOutlined fontSize="small" />,
  moderation: <GavelOutlined fontSize="small" />,
  mention: <CommentOutlined fontSize="small" />,
}

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return
    const fetchCount = async () => {
      try {
        const res = await api.get('/api/notifications/unread-count')
        setUnreadCount(res.data.count)
      } catch { /* ignore */ }
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const handleOpen = async (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget)
    setLoading(true)
    try {
      const res = await api.get('/api/notifications?limit=20')
      setNotifications(res.data.notifications || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  const handleMarkAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch { /* ignore */ }
  }

  const handleMarkRead = async (id: number) => {
    try {
      await api.put(`/api/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch { /* ignore */ }
  }

  if (!isAuthenticated) return null

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ color: 'text.primary' }}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsOutlined />
        </Badge>
      </IconButton>
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 380, maxHeight: 480 } } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" startIcon={<MarkEmailReadOutlined />} onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <List dense sx={{ p: 0 }}>
            {notifications.map((n) => (
              <ListItem
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: n.is_read ? 'transparent' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {typeIcons[n.type] || typeIcons.system}
                </ListItemIcon>
                <ListItemText
                  primary={n.title}
                  secondary={n.message}
                  primaryTypographyProps={{ fontWeight: n.is_read ? 400 : 600, fontSize: 14 }}
                  secondaryTypographyProps={{ fontSize: 12, noWrap: true }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </>
  )
}
