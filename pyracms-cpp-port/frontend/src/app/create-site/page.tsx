'use client'

import { useEffect } from 'react'
import { Box, Container, Paper } from '@mui/material'
import CreateSiteForm from '@/components/create-site/CreateSiteForm'
import CreateSiteHeader from '@/components/create-site/CreateSiteHeader'

export default function CreateSitePage() {
  useEffect(() => {
    document.title = 'Create New Site – PyraCMS'
  }, [])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg,' + ' #667eea 0%, #764ba2 100%)',
        py: 8,
      }}
      data-testid="create-site-page"
      role="main"
      aria-label="Create new site"
    >
      <Container maxWidth="sm">
        <CreateSiteHeader />
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          <CreateSiteForm />
        </Paper>
      </Container>
    </Box>
  )
}
