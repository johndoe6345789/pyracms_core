'use client'
import { useState } from 'react'
import {
  Paper, Box, Avatar, Typography,
  Button, Chip, Divider,
} from '@mui/material'
import {
  PersonAddOutlined, PersonRemoveOutlined,
} from '@mui/icons-material'
import { ProfileInfo } from './ProfileInfo'
import { ProfileStats } from './ProfileStats'
import { ProfileActions } from './ProfileActions'

interface UserProfileCardProps {
  username: string; avatarUrl?: string
  bio: string; location?: string
  website?: string; githubUrl?: string
  twitterUrl?: string; joinDate: string
  postCount: number; reputation: number
  badges: { label: string; color: string }[]
  isFollowing?: boolean; onFollow?: () => void
}

export function UserProfileCard({
  username, avatarUrl, bio, location,
  website, githubUrl, twitterUrl, joinDate,
  postCount, reputation, badges,
  isFollowing: init = false, onFollow,
}: UserProfileCardProps) {
  const [fol, setFol] = useState(init)
  const toggle = () => {
    setFol(!fol); onFollow?.()
  }
  return (
    <Paper variant="outlined" sx={{
      borderColor: 'divider', overflow: 'hidden',
    }} data-testid="user-profile-card">
      <Box sx={{
        bgcolor: 'primary.main', height: 80,
      }} />
      <Box sx={{ px: 3, pb: 3, mt: -5 }}>
        <Box sx={{
          display: 'flex', mb: 2,
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}>
          <Avatar src={avatarUrl} sx={{
            width: 96, height: 96, border: 4,
            borderColor: 'background.paper',
            bgcolor: 'primary.dark',
            fontSize: '2rem',
          }}>
            {username.charAt(0).toUpperCase()}
          </Avatar>
          <Button size="small"
            variant={fol ? 'outlined' : 'contained'}
            startIcon={fol
              ? <PersonRemoveOutlined />
              : <PersonAddOutlined />}
            onClick={toggle}
            data-testid="follow-button">
            {fol ? 'Unfollow' : 'Follow'}
          </Button>
        </Box>
        <Typography variant="h5"
          sx={{ fontWeight: 700 }}>
          {username}
        </Typography>
        <Typography variant="body1"
          color="text.secondary"
          sx={{ mt: 0.5, mb: 2, lineHeight: 1.6 }}>
          {bio}
        </Typography>
        <ProfileInfo location={location}
          website={website} joinDate={joinDate} />
        <ProfileStats postCount={postCount}
          reputation={reputation} />
        <ProfileActions githubUrl={githubUrl}
          twitterUrl={twitterUrl} />
        {badges.length > 0 && (<>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2"
            gutterBottom>Badges</Typography>
          <Box sx={{
            display: 'flex', gap: 0.5,
            flexWrap: 'wrap',
          }}>
            {badges.map((b) => (
              <Chip key={b.label}
                label={b.label} size="small"
                sx={{ bgcolor: b.color + '20',
                  color: b.color,
                  fontWeight: 600 }} />
            ))}
          </Box>
        </>)}
      </Box>
    </Paper>
  )
}
