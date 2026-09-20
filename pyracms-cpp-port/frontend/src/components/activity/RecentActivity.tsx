'use client'

import { List, Paper, Typography } from '@mui/material'
import { useSiteActivity } from '@/hooks/useSiteActivity'
import ActivityRow from './ActivityRow'

interface Props {
  tenantId: number | null
  limit?: number
}

export default function RecentActivity({ tenantId, limit }: Props) {
  const { items, loading, failed } = useSiteActivity(tenantId, limit)
  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}
      data-testid="recent-activity"
    >
      <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 700 }}>
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
      <List disablePadding>
        {items.map((a, i) => (
          <ActivityRow key={`${a.type}-${a.id}`} a={a} first={i === 0} />
        ))}
      </List>
    </Paper>
  )
}
