'use client'

import { Box, Divider } from '@mui/material'
import { UserStats } from './UserStats'
import { UserIdentity } from './UserIdentity'

interface UserPostInfoProps {
  username: string
  avatarUrl?: string | undefined
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
  username,
  avatarUrl,
  joinDate,
  postCount,
  reputation,
  rank,
}: UserPostInfoProps) {
  const rc = getRankColor(reputation)
  return (
    <Box
      sx={{
        display: { xs: 'flex', md: 'block' },
        flexDirection: {
          xs: 'row',
          md: 'column',
        },
        alignItems: {
          xs: 'center',
          md: 'center',
        },
        gap: { xs: 2, md: 1 },
        p: { xs: 1.5, md: 2 },
        textAlign: { md: 'center' },
        minWidth: { md: 160 },
      }}
      data-testid={`user-post-info-${username}`}
    >
      <UserIdentity
        username={username}
        avatarUrl={avatarUrl}
        rank={rank}
        rankColor={rc}
      />
      <Divider
        sx={{
          my: 1,
          display: { xs: 'none', md: 'block' },
        }}
      />
      <UserStats
        joinDate={joinDate}
        postCount={postCount}
        reputation={reputation}
        rankColor={rc}
      />
    </Box>
  )
}
