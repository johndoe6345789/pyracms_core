'use client'

import { Box, Button, Typography } from '@mui/material'
import { ArrowBack, WebOutlined } from '@mui/icons-material'
import Link from 'next/link'

export default function CreateSiteHeader() {
  return (
    <Box
      sx={{
        textAlign: 'center',
        mb: 4,
        color: 'white',
      }}
    >
      <Button
        component={Link}
        href="/portal"
        startIcon={<ArrowBack />}
        data-testid="back-to-portal-link"
        aria-label="Back to Portal"
        sx={{
          color: 'white',
          mb: 2,
          textTransform: 'none',
        }}
      >
        Back to Portal
      </Button>
      <WebOutlined sx={{ fontSize: 48, mb: 1 }} aria-hidden="true" />
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
        New Site
      </Typography>
    </Box>
  )
}
