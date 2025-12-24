'use client'

import { Container, Typography, Box } from '@mui/material'

export default function DashboardPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome to your dashboard! This is where you&apos;ll manage your content.
        </Typography>
      </Box>
    </Container>
  )
}
