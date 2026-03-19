'use client'

import { Box, Container, Paper } from '@mui/material'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: 8,
    }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{
          p: 5, borderRadius: 3, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}>
          <LoginForm />
        </Paper>
      </Container>
    </Box>
  )
}
