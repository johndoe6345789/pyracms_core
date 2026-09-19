import { Box, Typography, Chip } from '@mui/material'
import { TYPE_COLORS, getTypeIcon } from './activityIcons'

export { TYPE_COLORS, getTypeIcon }

export interface ActivityEvent {
  id: string
  type: string
  title: string
  description: string
  date: string
  link?: string
}

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
    </Box>
  )
}
