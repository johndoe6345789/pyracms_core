'use client'

import {
  Avatar, Box, Typography, Chip, Divider,
} from '@mui/material'
import { UserStats } from './UserStats'

interface UserPostInfoProps {
  username: string
  avatarUrl?: string
  joinDate: string
  postCount: number
  reputation: number
  rank: string
}

function getRankColor(rep: number): string {
  if (rep >= 1000) return '#FFD700'
  if (rep >= 500) return '#C0C0C0'
  if (rep >= 100) return '#CD7F32'
  return '#9e9e9e'
}

export function UserPostInfo({
  username, avatarUrl, joinDate,
  postCount, reputation, rank,
}: UserPostInfoProps) {
  const rc = getRankColor(reputation)
  return (
    <Box sx={{
      display: { xs: 'flex', md: 'block' },
      flexDirection: {
        xs: 'row', md: 'column' },
      alignItems: {
        xs: 'center', md: 'center' },
      gap: { xs: 2, md: 1 },
      p: { xs: 1.5, md: 2 },
      textAlign: { md: 'center' },
      minWidth: { md: 160 },
    }} data-testid={
      `user-post-info-${username}`}>
      <Avatar src={avatarUrl} sx={{
        width: { xs: 40, md: 64 },
        height: { xs: 40, md: 64 },
        bgcolor: 'primary.main',
        fontSize: {
          xs: '1rem', md: '1.5rem' },
      }}>
        {username.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{
        display: { xs: 'flex', md: 'block' },
        flexDirection: { xs: 'column' },
        gap: { xs: 0.25 },
      }}>
        <Typography variant="subtitle2"
          sx={{
            fontWeight: 700, mt: { md: 1 },
          }}>{username}</Typography>
        <Chip label={rank} size="small" sx={{
          bgcolor: rc + '20', color: rc,
          fontWeight: 600, fontSize: '0.7rem',
          height: 20, mt: { md: 0.5 },
        }} />
      </Box>
      <Divider sx={{
        my: 1,
        display: { xs: 'none', md: 'block' },
      }} />
      <UserStats joinDate={joinDate}
        postCount={postCount}
        reputation={reputation}
        rankColor={rc} />
    </Box>
  )
}
