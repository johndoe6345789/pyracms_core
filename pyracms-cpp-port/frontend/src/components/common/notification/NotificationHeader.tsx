'use client'

import { Typography, Box, Button } from '@mui/material'
import { MarkEmailReadOutlined } from '@mui/icons-material'

interface Props {
  title: string
  unread: number
  onMarkAll: () => void
}

export default function NotificationHeader(p: Props) {
  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Typography variant="h6" fontWeight={700}>
        {p.title}
      </Typography>
      {p.unread > 0 && (
        <Button
          size="small"
          startIcon={<MarkEmailReadOutlined />}
          onClick={p.onMarkAll}
          data-testid="mark-all-read-btn"
        >
          Mark all read
        </Button>
      )}
    </Box>
  )
}
