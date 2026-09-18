import { Box, Typography } from '@mui/material'
import Link from 'next/link'

const linkStyle = {
  color: '#667eea', textDecoration: 'none', fontWeight: 600,
} as const

/** "Don't have an account?" prompt below the login form. */
export default function LoginFooter(
  { tenant }: { tenant?: string | undefined },
) {
  const href = tenant
    ? `/auth/register?tenant=${encodeURIComponent(tenant)}`
    : '/auth/register'
  return (
    <Box sx={{ textAlign: 'center', mt: 3 }}>
      <Typography variant="body2" color="text.secondary">
        Don&apos;t have an account?{' '}
        <Link
          href={href}
          data-testid="register-link"
          aria-label="Sign up for an account"
          style={linkStyle}
        >
          Sign Up
        </Link>
      </Typography>
    </Box>
  )
}
