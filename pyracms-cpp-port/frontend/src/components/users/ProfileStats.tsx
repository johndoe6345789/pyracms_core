import { Box, Typography } from '@mui/material'
import {
  ForumOutlined,
  StarOutlined,
} from '@mui/icons-material'

interface ProfileStatsProps {
  postCount: number
  reputation: number
}

export function ProfileStats({
  postCount,
  reputation,
}: ProfileStatsProps) {
  return (
    <Box
      sx={{ display: 'flex', gap: 2, mb: 2 }}
      data-testid="profile-stats"
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <ForumOutlined sx={{ fontSize: 18 }} />
        <Typography variant="body2">
          <strong>
            {postCount.toLocaleString()}
          </strong>
          {' '}posts
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <StarOutlined
          sx={{ fontSize: 18, color: '#FFD700' }}
        />
        <Typography variant="body2">
          <strong>
            {reputation.toLocaleString()}
          </strong>
          {' '}reputation
        </Typography>
      </Box>
    </Box>
  )
}
