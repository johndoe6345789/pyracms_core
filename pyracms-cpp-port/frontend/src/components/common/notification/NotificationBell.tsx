'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  IconButton, Badge, Popover,
  Typography, Box, Button, Divider,
} from '@mui/material'
import {
  NotificationsOutlined,
  MarkEmailReadOutlined,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import api from '@/lib/api'
import { useWebSocket } from '@/hooks/useWebSocket'
import NotificationList from './NotificationList'
import type { Notification }
  from './NotificationList'

export default function NotificationBell() {
  const [anchor, setAnchor] =
    useState<null | HTMLElement>(null)
  const [items, setItems] =
    useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const isAuth = useSelector(
    (s: RootState) => s.auth.isAuthenticated)
  const API = process.env.NEXT_PUBLIC_API_URL
    || 'http://localhost:8080'

  const onWs = useCallback(
    (data: unknown) => {
      const m = data as Record<string, unknown>
      if (m.type !== 'notification') return
      setUnread((c) => c + 1)
      setItems((prev) => [{
        id: m.id as number,
        type: (m.notificationType as string)
          || 'system',
        title: (m.title as string) || '',
        message: (m.message as string) || '',
        link: m.link as string | null,
        is_read: false,
        created_at: new Date().toISOString(),
      }, ...prev].slice(0, 20))
    }, [])

  useWebSocket({
    url: isAuth
      ? `${API}/api/ws/notifications` : '',
    onMessage: onWs,
    autoReconnect: isAuth,
  })

  useEffect(() => {
    if (!isAuth) return
    api.get('/api/notifications/unread-count')
      .then((r) => setUnread(r.data.count))
      .catch(() => {})
  }, [isAuth])

  const open = async (
    e: React.MouseEvent<HTMLElement>) => {
    setAnchor(e.currentTarget)
    setLoading(true)
    try {
      const r = await api.get(
        '/api/notifications?limit=20')
      setItems(r.data.notifications || [])
    } catch { /* ignore */ }
    setLoading(false)
  }
  const markAll = async () => {
    try {
      await api.put(
        '/api/notifications/read-all')
      setItems((p) => p.map(
        (n) => ({ ...n, is_read: true })))
      setUnread(0)
    } catch { /* ignore */ }
  }
  const markOne = async (id: number) => {
    try {
      await api.put(
        `/api/notifications/${id}/read`)
      setItems((p) => p.map((n) =>
        n.id === id
          ? { ...n, is_read: true } : n))
      setUnread((c) => Math.max(0, c - 1))
    } catch { /* ignore */ }
  }

  return (<>
    <IconButton onClick={open}
      sx={{ color: 'text.primary' }}
      aria-label="Notifications"
      data-testid="notification-bell-btn">
      <Badge color="error" max={99}
        badgeContent={isAuth ? unread : 0}>
        <NotificationsOutlined />
      </Badge>
    </IconButton>
    <Popover anchorEl={anchor}
      open={Boolean(anchor)}
      onClose={() => setAnchor(null)}
      anchorOrigin={{ vertical: 'bottom',
        horizontal: 'right' }}
      transformOrigin={{ vertical: 'top',
        horizontal: 'right' }}
      slotProps={{ paper: { sx: {
        width: 380, maxHeight: 480 } } }}>
      <Box sx={{ p: 2, display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center' }}>
        <Typography variant="h6"
          fontWeight={700}>Notifications
        </Typography>
        {unread > 0 && (
          <Button size="small"
            startIcon={
              <MarkEmailReadOutlined />}
            onClick={markAll}
            data-testid="mark-all-read-btn">
            Mark all read
          </Button>)}
      </Box>
      <Divider />
      <NotificationList
        notifications={items}
        loading={loading}
        isAuthenticated={isAuth}
        onMarkRead={markOne} />
    </Popover>
  </>)
}
