'use client'

import { useState } from 'react'
import {
  IconButton, Badge, Popover,
  Typography, Box, Button, Divider,
} from '@mui/material'
import {
  NotificationsOutlined,
  MarkEmailReadOutlined,
} from '@mui/icons-material'
import NotificationList from './NotificationList'
import { useNotifications } from './useNotifications'

export default function NotificationBell() {
  const [anchor, setAnchor] =
    useState<null | HTMLElement>(null)
  const {
    items, unread, loading, isAuth,
    fetchList, markAll, markOne,
  } = useNotifications()
  const open = async (
    e: React.MouseEvent<HTMLElement>) => {
    setAnchor(e.currentTarget)
    await fetchList()
  }
  return (<>
    <IconButton onClick={open}
      sx={{ color: 'text.primary' }}
      aria-label="Notifications"
      data-testid="notification-bell-btn">
      <Badge color="error" max={99}
        badgeContent={isAuth ? unread : 0}>
        <NotificationsOutlined /></Badge>
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
        {unread > 0 && <Button size="small"
          startIcon={<MarkEmailReadOutlined />}
          onClick={markAll}
          data-testid="mark-all-read-btn">
          Mark all read</Button>}
      </Box>
      <Divider />
      <NotificationList notifications={items}
        loading={loading} isAuthenticated={isAuth}
        onMarkRead={markOne} />
    </Popover>
  </>)
}
