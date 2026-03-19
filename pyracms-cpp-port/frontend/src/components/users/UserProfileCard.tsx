'use client'

import { useState } from 'react'
import {
  Paper, Box, Avatar, Typography, Button, Chip, Divider, IconButton, Tooltip, Link as MuiLink,
} from '@mui/material'
import {
  LocationOnOutlined, LanguageOutlined, CalendarTodayOutlined,
  ForumOutlined, StarOutlined, PersonAddOutlined, PersonRemoveOutlined,
  GitHub, Twitter,
} from '@mui/icons-material'

interface UserProfileCardProps {
  username: string
  avatarUrl?: string
  bio: string
  location?: string
  website?: string
  githubUrl?: string
  twitterUrl?: string
  joinDate: string
  postCount: number
  reputation: number
  badges: { label: string; color: string }[]
  isFollowing?: boolean
  onFollow?: () => void
}

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
  isFollowing: initialFollowing = false,
  onFollow,
}: UserProfileCardProps) {
  const [following, setFollowing] = useState(initialFollowing)

  const handleFollow = () => {
    setFollowing(!following)
    onFollow?.()
  }

  return (
    <Paper variant="outlined" sx={{ borderColor: 'divider', overflow: 'hidden' }}>
      <Box sx={{ bgcolor: 'primary.main', height: 80 }} />
      <Box sx={{ px: 3, pb: 3, mt: -5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
          <Avatar
            src={avatarUrl}
            sx={{ width: 96, height: 96, border: 4, borderColor: 'background.paper', bgcolor: 'primary.dark', fontSize: '2rem' }}
          >
            {username.charAt(0).toUpperCase()}
          </Avatar>
          <Button
            variant={following ? 'outlined' : 'contained'}
            startIcon={following ? <PersonRemoveOutlined /> : <PersonAddOutlined />}
            onClick={handleFollow}
            size="small"
          >
            {following ? 'Unfollow' : 'Follow'}
          </Button>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700 }}>{username}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, mb: 2, lineHeight: 1.6 }}>
          {bio}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          {location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOnOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">{location}</Typography>
            </Box>
          )}
          {website && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LanguageOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
              <MuiLink href={website} target="_blank" rel="noopener" variant="body2">{website}</MuiLink>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">Joined {joinDate}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ForumOutlined sx={{ fontSize: 18 }} />
            <Typography variant="body2"><strong>{postCount.toLocaleString()}</strong> posts</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarOutlined sx={{ fontSize: 18, color: '#FFD700' }} />
            <Typography variant="body2"><strong>{reputation.toLocaleString()}</strong> reputation</Typography>
          </Box>
        </Box>

        {(githubUrl || twitterUrl) && (
          <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
            {githubUrl && (
              <Tooltip title="GitHub">
                <IconButton size="small" component="a" href={githubUrl} target="_blank" rel="noopener">
                  <GitHub fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {twitterUrl && (
              <Tooltip title="Twitter/X">
                <IconButton size="small" component="a" href={twitterUrl} target="_blank" rel="noopener">
                  <Twitter fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}

        {badges.length > 0 && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Badges</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {badges.map((badge) => (
                <Chip key={badge.label} label={badge.label} size="small" sx={{ bgcolor: badge.color + '20', color: badge.color, fontWeight: 600 }} />
              ))}
            </Box>
          </>
        )}
      </Box>
    </Paper>
  )
}
