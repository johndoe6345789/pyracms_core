'use client'
import { useState } from 'react'
import { Paper, Box, Typography } from '@mui/material'
import { ProfileHeaderRow } from './ProfileHeaderRow'
import { ProfileInfo } from './ProfileInfo'
import { ProfileStats } from './ProfileStats'
import { ProfileActions } from './ProfileActions'
import { ProfileBadges } from './ProfileBadges'
import type { UserProfileCardProps } from './profileCardProps'

export function UserProfileCard({
  username,
  avatarUrl,
  bio,
  location,
  website,
  githubUrl,
  twitterUrl,
  joinDate,
  postCount,
  reputation,
  badges,
  isFollowing: init = false,
  onFollow,
}: UserProfileCardProps) {
  const [fol, setFol] = useState(init)
  const toggle = () => {
    setFol(!fol)
    onFollow?.()
  }
  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: 'divider',
        overflow: 'hidden',
      }}
      data-testid="user-profile-card"
    >
      <Box sx={{ bgcolor: 'primary.main', height: 80 }} />
      <Box sx={{ px: 3, pb: 3, mt: -5 }}>
        <ProfileHeaderRow
          username={username}
          avatarUrl={avatarUrl}
          following={fol}
          onToggle={toggle}
        />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {username}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 0.5, mb: 2, lineHeight: 1.6 }}
        >
          {bio}
        </Typography>
        <ProfileInfo
          {...(location ? { location } : {})}
          {...(website ? { website } : {})}
          joinDate={joinDate}
        />
        <ProfileStats postCount={postCount} reputation={reputation} />
        <ProfileActions
          {...(githubUrl ? { githubUrl } : {})}
          {...(twitterUrl ? { twitterUrl } : {})}
        />
        <ProfileBadges badges={badges} />
      </Box>
    </Paper>
  )
}
