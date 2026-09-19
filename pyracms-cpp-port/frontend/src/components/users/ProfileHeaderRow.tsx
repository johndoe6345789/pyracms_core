'use client'

import { Box, Avatar, Button } from '@mui/material'
import { PersonAddOutlined, PersonRemoveOutlined } from '@mui/icons-material'

interface Props {
  username: string
  avatarUrl?: string | undefined
  following: boolean
  onToggle: () => void
}

/** Overlapping avatar and the follow/unfollow button. */
export function ProfileHeaderRow({
  username,
  avatarUrl,
  following: fol,
  onToggle,
}: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        mb: 2,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}
    >
      <Avatar
        {...(avatarUrl ? { src: avatarUrl } : {})}
        sx={{
          width: 96,
          height: 96,
          border: 4,
          borderColor: 'background.paper',
          bgcolor: 'primary.dark',
          fontSize: '2rem',
        }}
      >
        {username.charAt(0).toUpperCase()}
      </Avatar>
      <Button
        size="small"
        variant={fol ? 'outlined' : 'contained'}
        startIcon={fol ? <PersonRemoveOutlined /> : <PersonAddOutlined />}
        onClick={onToggle}
        data-testid="follow-button"
      >
        {fol ? 'Unfollow' : 'Follow'}
      </Button>
    </Box>
  )
}
