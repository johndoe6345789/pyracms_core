'use client'

import NextLink from 'next/link'
import {
  Paper, Typography, List, ListItem, ListItemText, Link,
} from '@mui/material'
import { useSiteActivity } from '@/hooks/useSiteActivity'
import { safeHref } from '@/lib/safeUrl'

interface Props { tenantId: number | null; limit?: number }

export default function RecentActivity({ tenantId, limit }: Props) {
  const { items, loading, failed } = useSiteActivity(tenantId, limit)
  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 4 }}
      data-testid="recent-activity">
      <Typography variant="h5" sx={{ mb: 1 }}>
        Recent activity
      </Typography>
      {failed && (
        <Typography color="text.secondary">
          Activity is unavailable right now.
        </Typography>
      )}
      {!loading && !failed && items.length === 0 && (
        <Typography color="text.secondary">
          Nothing has happened yet.
        </Typography>
      )}
      <List dense disablePadding>
        {items.map((a) => {
          const href = safeHref(a.link)
          return (
            <ListItem key={a.id} disableGutters
              data-testid={`activity-${a.id}`}>
              <ListItemText
                primary={href ? (
                  <Link component={NextLink} href={href}>
                    {a.title}
                  </Link>
                ) : a.title}
                secondary={`${a.actor} - ${a.type} - ${
                  new Date(a.createdAt).toLocaleString()}`} />
            </ListItem>
          )
        })}
      </List>
    </Paper>
  )
}
