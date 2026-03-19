'use client'

import {
  Box, Container, Paper, Typography,
} from '@mui/material'
import { WebOutlined } from '@mui/icons-material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import AuthPromptCard
  from '@/components/create-site/AuthPromptCard'
import CreateSiteForm
  from '@/components/create-site/CreateSiteForm'

export default function CreateSitePage() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background:
          'linear-gradient(135deg,'
          + ' #667eea 0%, #764ba2 100%)',
        py: 8,
      }}
      data-testid="create-site-page"
      role="main"
      aria-label="Create new site"
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: 'center',
            mb: 4,
            color: 'white',
          }}
        >
          <WebOutlined
            sx={{ fontSize: 48, mb: 1 }}
            aria-hidden="true"
          />
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700 }}
          >
            New Site
          </Typography>
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {isAuthenticated
            ? <CreateSiteForm />
            : <AuthPromptCard />}
        </Paper>
      </Container>
    </Box>
  )
}
