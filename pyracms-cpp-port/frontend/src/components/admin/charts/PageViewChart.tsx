'use client'

import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { useAnalyticsRows } from '@/hooks/useAnalyticsRows'
import { mapPageViews, type Period } from '@/lib/analyticsRows'
import { PageViewLine } from './PageViewLine'

const headSx = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 2,
}

/** Real page views per day, week or month (nothing is invented). */
export function PageViewChart({ tenantId }: { tenantId?: number | null }) {
  const [period, setPeriod] = useState<Period>('day')
  const { rows, failed } = useAnalyticsRows(
    `page-views?period=${period}`,
    tenantId,
    (r) => mapPageViews(r, period),
  )

  return (
    <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}>
      <Box sx={headSx}>
        <Typography variant="h6">Page Views</Typography>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_, v) => v && setPeriod(v)}
          size="small"
        >
          <ToggleButton value="day">Daily</ToggleButton>
          <ToggleButton value="week">Weekly</ToggleButton>
          <ToggleButton value="month">Monthly</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {failed ? (
        <Typography color="text.secondary">
          Page views could not be loaded.
        </Typography>
      ) : rows.length === 0 ? (
        <Typography color="text.secondary" data-testid="page-views-empty">
          No page views recorded yet.
        </Typography>
      ) : (
        <PageViewLine rows={rows} />
      )}
    </Paper>
  )
}
