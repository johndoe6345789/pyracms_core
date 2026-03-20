'use client'

import { Box, Button } from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'

export default function CreateSiteButton() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )

  const href = isAuthenticated
    ? '/create-site'
    : '/auth/login/create-site'

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        animation: 'fadeInUp 1s ease-out 0.6s both',
      }}
    >
      <Button
        variant="contained"
        size="large"
        startIcon={<AddCircleOutline />}
        component={Link}
        href={href}
        data-testid="create-site-button"
        aria-label={
          isAuthenticated
            ? 'Create a new site'
            : 'Sign in to create a new site'
        }
        sx={{
          bgcolor: 'white',
          color: '#667eea',
          px: 4,
          py: 1.5,
          fontSize: '1.05rem',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.95)',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s',
          },
        }}
      >
        Create New Site
      </Button>
    </Box>
  )
}
