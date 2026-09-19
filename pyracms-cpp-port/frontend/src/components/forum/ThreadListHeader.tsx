'use client'

import { Typography, Box, Button } from '@mui/material'
import { AddOutlined } from '@mui/icons-material'
import Link from 'next/link'

interface Props {
  name: string
  description: string
  href: string
  isAuthenticated: boolean
}

export function ThreadListHeader(p: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 4,
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h3" component="h1" gutterBottom>
          {p.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {p.description}
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<AddOutlined />}
        component={Link}
        href={p.isAuthenticated ? p.href : '/auth/login'}
        data-testid="new-thread-button"
      >
        {p.isAuthenticated ? 'New Thread' : 'Sign in to post'}
      </Button>
    </Box>
  )
}
