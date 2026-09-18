import { Typography, Box, Avatar, Paper, Chip } from '@mui/material'
import { PersonOutlined, StarOutlined } from '@mui/icons-material'
import { FollowButton } from './FollowButton'

export interface UserProfile {
  id: number
  username: string
  email: string
  bio: string
  location: string
  avatarUrl: string
  reputation: number
  createdAt: string
}

export function UserHeader({ user }: { user: UserProfile }) {
  return (
    <Paper sx={{ p: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
        <Avatar
          src={user.avatarUrl}
          sx={{ width: 120, height: 120, fontSize: 48 }}
        >
          {user.username[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 2, mb: 1,
          }}>
            <Typography variant="h4" fontWeight={700}>
              {user.username}
            </Typography>
            <FollowButton userId={user.id} />
          </Box>
          {user.bio && (
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              {user.bio}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {user.location && (
              <Chip icon={<PersonOutlined />} label={user.location}
                size="small" variant="outlined" />
            )}
            <Chip icon={<StarOutlined />} size="small" color="primary"
              label={`${user.reputation} reputation`} />
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}
