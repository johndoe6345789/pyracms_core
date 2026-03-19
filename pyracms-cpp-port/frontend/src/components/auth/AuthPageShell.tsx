'use client'

import { Box, Container, Paper } from '@mui/material'
import type { ReactNode } from 'react'

interface Props {
  /** Page content (LoginForm or RegisterForm) */
  children: ReactNode
}

/**
 * Shared gradient shell used by all auth pages.
 * Centres content vertically inside a Paper card.
 */
export default function AuthPageShell({
  children,
}: Props) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background:
          'linear-gradient('
          + '135deg, #667eea 0%, #764ba2 100%)',
        py: 8,
      }}
      role="main"
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 3,
            boxShadow:
              '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  )
}
