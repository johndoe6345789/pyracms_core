'use client'

import {
  Box, Typography, Button, Stack,
} from '@mui/material'
import { LockOutlined } from '@mui/icons-material'
import Link from 'next/link'

export default function AuthPromptCard() {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 6,
      }}
      data-testid="auth-prompt-card"
      role="region"
      aria-label="Authentication required"
    >
      <LockOutlined
        sx={{
          fontSize: 64,
          color: 'primary.main',
          mb: 2,
        }}
        aria-hidden="true"
      />
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ fontWeight: 700 }}
      >
        Sign in to Create a Site
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 420, mx: 'auto' }}
      >
        You need an account to create and manage
        your own site on PyraCMS.
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
      >
        <Button
          variant="contained"
          size="large"
          component={Link}
          href="/auth/login/create-site"
          data-testid="prompt-login-button"
          aria-label="Sign in to your account"
        >
          Sign In
        </Button>
        <Button
          variant="outlined"
          size="large"
          component={Link}
          href="/auth/register/create-site"
          data-testid="prompt-register-button"
          aria-label="Create a new account"
        >
          Register
        </Button>
      </Stack>
    </Box>
  )
}
