import { Container, Typography, Box, Button } from '@mui/material'
import Link from 'next/link'

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          Welcome to PyraCMS
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
          Modern CMS with C++ Backend and React Frontend
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            href="/auth/login"
          >
            Login
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            component={Link}
            href="/auth/register"
          >
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
