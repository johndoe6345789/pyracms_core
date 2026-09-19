import { Box } from '@mui/material'
import { TYPE_COLORS, getTypeIcon } from './activityIcons'
import { ActivityBody } from './ActivityBody'
import type { ActivityEvent } from './activityEvent'

export { TYPE_COLORS, getTypeIcon }

export type { ActivityEvent }

interface ActivityItemProps {
  activity: ActivityEvent
  isLast: boolean
}

export function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const c = TYPE_COLORS[activity.type] || '#666'
  return (
    <Box
      data-testid={`activity-item-${activity.id}`}
      sx={{
        display: 'flex',
        gap: 2,
        px: 3,
        py: 2,
        borderBottom: isLast ? 0 : 1,
        borderColor: 'divider',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: c + '14',
          color: c,
          flexShrink: 0,
          mt: 0.5,
        }}
      >
        {getTypeIcon(activity.type)}
      </Box>
      <ActivityBody activity={activity} color={c} />
    </Box>
  )
}
