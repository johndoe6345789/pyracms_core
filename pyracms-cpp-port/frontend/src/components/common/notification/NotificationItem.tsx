'use client'

import { ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { icons, type Notification } from './notificationIcons'

interface Props {
  n: Notification
  onMarkRead: (id: number) => void
}

export default function NotificationItem({ n, onMarkRead }: Props) {
  return (
    <ListItem
      onClick={() => onMarkRead(n.id)}
      data-testid={`notification-item-${n.id}`}
      sx={{
        cursor: 'pointer',
        bgcolor: n.is_read ? 'transparent' : 'action.hover',
        '&:hover': { bgcolor: 'action.selected' },
      }}
    >
      <ListItemIcon sx={{ minWidth: 36 }}>
        {icons[n.type] || icons.system}
      </ListItemIcon>
      <ListItemText
        primary={n.title}
        secondary={n.message}
        primaryTypographyProps={{
          fontWeight: n.is_read ? 400 : 600,
          fontSize: 14,
        }}
        secondaryTypographyProps={{ fontSize: 12, noWrap: true }}
      />
    </ListItem>
  )
}
