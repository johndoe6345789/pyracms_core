import { Box, Button } from '@mui/material'
import Link from 'next/link'

interface Props {
  loading: boolean
  onTurbo: () => void
}

const submitSx = {
  py: 1.5,
  mb: 2,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
  },
} as const

const linkStyle = {
  color: '#667eea', textDecoration: 'none', fontSize: '0.875rem',
} as const

/** Forgot-password link, submit button and Turbologin button. */
export default function LoginActions({ loading, onTurbo }: Props) {
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Link
          href="/auth/forgot-password"
          data-testid="forgot-password-link"
          aria-label="Forgot your password?"
          style={linkStyle}
        >
          Forgot password?
        </Link>
      </Box>
      <Button
        fullWidth variant="contained" type="submit"
        disabled={loading} size="large"
        data-testid="login-submit"
        aria-label={loading ? 'Signing in' : 'Sign in'}
        sx={submitSx}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      <Button
        fullWidth variant="outlined" type="button"
        disabled={loading} size="large"
        data-testid="turbo-login-button"
        onClick={onTurbo}
        sx={{ mb: 2 }}
      >
        ⚡ Turbologin
      </Button>
    </>
  )
}
