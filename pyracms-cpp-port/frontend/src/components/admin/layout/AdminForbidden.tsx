import Link from 'next/link'
import { Alert, AlertTitle, Box, Button } from '@mui/material'

export default function AdminForbidden({ slug }: { slug: string }) {
  return (
    <Box
      component="main"
      sx={{ maxWidth: 560, mx: 'auto', px: 2, py: 8 }}
      data-testid="admin-forbidden"
    >
      <Alert severity="warning" sx={{ mb: 3 }}>
        <AlertTitle>Administrator access required</AlertTitle>
        Sign in with an administrator account for this site to
        manage it.
      </Alert>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          component={Link}
          href={`/auth/login?tenant=${encodeURIComponent(slug)}`}
          data-testid="admin-forbidden-signin"
        >
          Sign in
        </Button>
        <Button
          component={Link}
          href={`/site/${slug}`}
          data-testid="admin-forbidden-back"
        >
          Back to site
        </Button>
      </Box>
    </Box>
  )
}
