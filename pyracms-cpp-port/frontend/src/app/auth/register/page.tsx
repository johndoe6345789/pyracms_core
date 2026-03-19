'use client'

import { Container, Paper, Box } from '@mui/material'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <RegisterForm />
        </Paper>
      </Box>
    </Container>
  )
}
