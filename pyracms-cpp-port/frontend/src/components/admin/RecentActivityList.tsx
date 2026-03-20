'use client'

import {
  Paper, Box, Typography, Divider,
  List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material'
import { ACTIVITY_COLORS } from './recentActivityData'
import ITEMS from './recentActivityItems'

export default function RecentActivityList() {
  const lastIdx = ITEMS.length - 1
  return (
    <Paper
      variant="outlined"
      sx={{ borderColor: 'divider' }}
      data-testid="recent-activity-panel"
    >
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="h6">
          Recent Activity
        </Typography>
      </Box>
      <Divider />
      <List disablePadding>
        {ITEMS.map((a, idx) => (
          <ListItem
            key={a.id}
            divider={idx < lastIdx}
          >
            <ListItemIcon sx={{
              minWidth: 36,
              color: ACTIVITY_COLORS[a.type],
            }}>
              {a.icon}
            </ListItemIcon>
            <ListItemText
              primary={a.text}
              secondary={a.time}
              primaryTypographyProps={{
                variant: 'body2',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}
