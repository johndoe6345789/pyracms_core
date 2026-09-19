import { Box, Typography, Chip } from '@mui/material'
import type { ActivityEvent } from './activityEvent'

interface Props {
  activity: ActivityEvent
  color: string
}

/** Title, type chip, description and date of an activity row. */
export function ActivityBody({ activity, color: c }: Props) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 0.25,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {activity.title}
        </Typography>
        <Chip
          label={activity.type}
          size="small"
          sx={{
            height: 18,
            fontSize: '0.65rem',
            bgcolor: c + '20',
            color: c,
          }}
        />
      </Box>
      {activity.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 0.5 }}
          noWrap
        >
          {activity.description}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary">
        {activity.date}
      </Typography>
    </Box>
  )
}
