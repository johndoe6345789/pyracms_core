'use client'

import { Avatar, Box, Typography, Chip } from '@mui/material'

interface Props {
  username: string
  avatarUrl?: string | undefined
  rank: string
  rankColor: string
}

/** Avatar, name and rank chip of a post author. */
export function UserIdentity({ username, avatarUrl, rank, rankColor }: Props) {
  return (
    <>
      <Avatar
        {...(avatarUrl ? { src: avatarUrl } : {})}
        sx={{
          width: { xs: 40, md: 64 },
          height: { xs: 40, md: 64 },
          bgcolor: 'primary.main',
          fontSize: {
            xs: '1rem',
            md: '1.5rem',
          },
        }}
      >
        {username.charAt(0).toUpperCase()}
      </Avatar>
      <Box
        sx={{
          display: { xs: 'flex', md: 'block' },
          flexDirection: { xs: 'column' },
          gap: { xs: 0.25 },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            mt: { md: 1 },
          }}
        >
          {username}
        </Typography>
        <Chip
          label={rank}
          size="small"
          sx={{
            bgcolor: rankColor + '20',
            color: rankColor,
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 20,
            mt: { md: 0.5 },
          }}
        />
      </Box>
    </>
  )
}
