'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { useWebSocket } from '@/hooks/useWebSocket'

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  const handleWsMessage = useCallback((data: unknown) => {
    const msg = data as Record<string, unknown>
    if (msg.type === 'notification') {
      setUnreadCount(c => c + 1)
      setNotifications(prev => [{
        id: msg.id as number,
        type: msg.notificationType as string || 'system',
        title: msg.title as string || '',
        message: msg.message as string || '',
        link: msg.link as string | null,
        is_read: false,
        created_at: new Date().toISOString(),
      }, ...prev].slice(0, 20))
    }
  }, [])

  useWebSocket({
    url: isAuthenticated ? `${API_URL}/api/ws/notifications` : '',
    onMessage: handleWsMessage,
    autoReconnect: isAuthenticated,
  })

  // Initial count fetch on mount
  useEffect(() => {
    if (!isAuthenticated) return
    const fetchCount = async () => {
      try {
        const res = await api.get('/api/notifications/unread-count')
        setUnreadCount(res.data.count)
      } catch { /* ignore */ }
    }
    fetchCount()
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

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ color: 'text.primary' }}>
        <Badge badgeContent={isAuthenticated ? unreadCount : 0} color="error" max={99}>
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
        {!isAuthenticated ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Sign in to see notifications</Typography>
          </Box>
        ) : loading ? (
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
