import { Box, Typography } from '@mui/material'
import Link from 'next/link'

/** "Already have an account?" prompt below the register form. */
export default function RegisterFooter({
  tenant,
}: {
  tenant?: string | undefined
}) {
  const href = tenant
    ? `/auth/login?tenant=${encodeURIComponent(tenant)}`
    : '/auth/login'
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="body2">
        Already have an account?{' '}
        <Link
          href={href}
          data-testid="login-link"
          aria-label="Go to login page"
          style={{ color: '#1976d2' }}
        >
          Login
        </Link>
      </Typography>
    </Box>
  )
}
