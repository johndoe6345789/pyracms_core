import { Avatar, Box, Typography } from '@mui/material'
import { FollowButton } from '@/components/users/FollowButton'

interface Props {
  userId: number
  username: string
  total: number
}

/** Channel banner: avatar, name, video count and Subscribe. */
export default function ChannelHeader({ userId, username, total }: Props) {
  return (
    <Box
      data-testid="channel-header"
      sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}
    >
      <Avatar sx={{ width: 72, height: 72, fontSize: 32 }}>
        {username.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ mr: 'auto' }}>
        <Typography variant="h4" component="h1">
          {username || 'Channel'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {total} {total === 1 ? 'video' : 'videos'}
        </Typography>
      </Box>
      <FollowButton
        userId={userId}
        followLabel="Subscribe"
        unfollowLabel="Subscribed"
      />
    </Box>
  )
}
