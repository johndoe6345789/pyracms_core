'use client'

import { Container, Typography, Button, Box, List } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { useNotificationPage } from '@/hooks/useNotificationPage'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import NotificationRow from './NotificationRow'

export default function NotificationsPage() {
  const isAuth = useSelector((s: RootState) => s.auth.isAuthenticated)
  const { items, loading, error, markRead, markAll, remove } =
    useNotificationPage(isAuth)
  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Notifications
        </Typography>
        {items.some((n) => !n.is_read) && (
          <Button onClick={markAll} data-testid="mark-all-read">
            Mark all read
          </Button>
        )}
      </Box>
      <ErrorAlert error={error} testId="notifications-error" />
      {!isAuth && (
        <Typography color="text.secondary">
          Sign in to see your notifications.
        </Typography>
      )}
      {isAuth && !loading && items.length === 0 && (
        <Typography color="text.secondary">No notifications.</Typography>
      )}
      <List>
        {items.map((n) => (
          <NotificationRow
            key={n.id}
            n={n}
            markRead={markRead}
            remove={remove}
          />
        ))}
      </List>
    </Container>
  )
}
