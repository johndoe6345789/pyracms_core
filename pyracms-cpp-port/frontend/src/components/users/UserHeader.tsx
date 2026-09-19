import { Typography, Box, Avatar, Paper } from '@mui/material'
import { FollowButton } from './FollowButton'
import { ProfileInfo } from './ProfileInfo'
import { ProfileStats } from './ProfileStats'
import { ProfileBadges } from './ProfileBadges'
import { ReputationBadge } from './ReputationBadge'
import { getLevel } from './reputationLevels'

export interface UserProfile {
  id: number
  username: string
  email: string
  bio: string
  website: string
  avatarUrl: string
  reputation: number
  postCount: number
  createdAt: string
}

export function UserHeader({ user }: { user: UserProfile }) {
  const level = getLevel(user.reputation)
  return (
    <Paper sx={{ p: 4, mb: 4 }} data-testid="user-header">
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
            flexWrap: 'wrap',
          }}>
            <Typography variant="h4" fontWeight={700}>
              {user.username}
            </Typography>
            <FollowButton userId={user.id} />
            <ReputationBadge points={user.reputation} />
          </Box>
          {user.bio && (
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              {user.bio}
            </Typography>
          )}
          <ProfileInfo
            {...(user.website ? { website: user.website } : {})}
            joinDate={user.createdAt.split('T')[0] ?? ''} />
          <ProfileStats postCount={user.postCount}
            reputation={user.reputation} />
        </Box>
      </Box>
      <ProfileBadges
        badges={[{ label: level.name, color: level.color }]} />
    </Paper>
  )
}
