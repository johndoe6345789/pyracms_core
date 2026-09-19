import { Box, Typography } from '@mui/material'
import { VisibilityOutlined } from '@mui/icons-material'
import type { GameDepDetailData } from '@/hooks/useGameDepDetail'

/** Owner, creation date and view count line of a detail page. */
export default function GameDepMeta({ detail }: { detail: GameDepDetailData }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        mb: 2,
        color: 'text.secondary',
      }}
    >
      <Typography variant="body2">By {detail.owner}</Typography>
      <Typography variant="body2">
        Created {new Date(detail.created).toLocaleDateString()}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <VisibilityOutlined fontSize="small" />
        <Typography variant="body2">
          {detail.views.toLocaleString()} views
        </Typography>
      </Box>
    </Box>
  )
}
