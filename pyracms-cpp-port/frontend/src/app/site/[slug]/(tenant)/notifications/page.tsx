'use client'

import NextLink from 'next/link'
import {
  Container, Typography, Button, Box, List, ListItem,
  ListItemText, IconButton, Link,
} from '@mui/material'
import { DeleteOutline } from '@mui/icons-material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { useNotificationPage } from '@/hooks/useNotificationPage'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { safeHref } from '@/lib/safeUrl'

export default function NotificationsPage() {
  const isAuth = useSelector((s: RootState) => s.auth.isAuthenticated)
  const { items, loading, error, markRead, markAll, remove } =
    useNotificationPage(isAuth)
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
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
        <Typography color="text.secondary">
          No notifications.
        </Typography>
      )}
      <List>
        {items.map((n) => {
          const href = safeHref(n.link)
          return (
            <ListItem key={n.id} divider data-testid={`note-${n.id}`}
              secondaryAction={<IconButton aria-label="Delete"
                onClick={() => remove(n.id)}><DeleteOutline />
              </IconButton>}>
              <ListItemText
                primary={href ? <Link component={NextLink}
                  href={href}>{n.title}</Link> : n.title}
                secondary={n.message}
                primaryTypographyProps={{
                  fontWeight: n.is_read ? 400 : 700 }} />
              {!n.is_read && (
                <Button size="small" onClick={() => markRead(n.id)}
                  sx={{ mr: 4 }}>Mark read</Button>
              )}
            </ListItem>
          )
        })}
      </List>
    </Container>
  )
}
