'use client'

import { List, Box, Typography, CircularProgress } from '@mui/material'
import type { Notification } from './notificationIcons'
import NotificationItem from './NotificationItem'

export type { Notification }

interface Props {
  notifications: Notification[]
  loading: boolean
  isAuthenticated: boolean
  onMarkRead: (id: number) => void
}

export default function NotificationList({
  notifications: ns,
  loading,
  isAuthenticated,
  onMarkRead,
}: Props) {
  if (!isAuthenticated)
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Sign in to see notifications
        </Typography>
      </Box>
    )
  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  if (ns.length === 0)
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No notifications</Typography>
      </Box>
    )

  return (
    <List dense sx={{ p: 0 }}>
      {ns.map((n) => (
        <NotificationItem key={n.id} n={n} onMarkRead={onMarkRead} />
      ))}
    </List>
  )
}
