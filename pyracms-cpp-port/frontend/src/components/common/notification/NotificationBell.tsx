'use client'

import { useState } from 'react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { slugFromPath } from '@/lib/siteSlug'
import { IconButton, Badge, Popover, Box, Button, Divider } from '@mui/material'
import { NotificationsOutlined } from '@mui/icons-material'
import { ErrorAlert } from '../ErrorAlert'
import NotificationList from './NotificationList'
import NotificationHeader from './NotificationHeader'
import { useNotifications } from './useNotifications'

export default function NotificationBell() {
  const t = useTranslations('notifications')
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)
  const slug = slugFromPath(usePathname())
  const { items, unread, loading, isAuth, error, fetchList, markAll, markOne } =
    useNotifications()
  const open = async (e: React.MouseEvent<HTMLElement>) => {
    setAnchor(e.currentTarget)
    await fetchList()
  }
  return (
    <>
      <IconButton
        onClick={open}
        sx={{ color: 'text.primary' }}
        aria-label="Notifications"
        data-testid="notification-bell-btn"
      >
        <Badge color="error" max={99} badgeContent={isAuth ? unread : 0}>
          <NotificationsOutlined />
        </Badge>
      </IconButton>
      <Popover
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 380, maxHeight: 480 } } }}
      >
        <NotificationHeader
          title={t('title')}
          unread={unread}
          onMarkAll={markAll}
        />
        <Divider />
        <ErrorAlert error={error} testId="notification-error" mb={0} />
        <NotificationList
          notifications={items}
          loading={loading}
          isAuthenticated={isAuth}
          onMarkRead={markOne}
        />
        {slug && isAuth && (
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Button
              size="small"
              component={NextLink}
              href={`/site/${slug}/notifications`}
              onClick={() => setAnchor(null)}
              data-testid="notifications-view-all"
            >
              View all
            </Button>
          </Box>
        )}
      </Popover>
    </>
  )
}
