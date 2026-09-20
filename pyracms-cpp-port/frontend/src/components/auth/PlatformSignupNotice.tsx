'use client'

import { Button, Stack, Typography } from '@mui/material'
import Link from 'next/link'

/**
 * The portal has no public sign-up: people register on a site, and the
 * platform account is created during first-run setup.
 */
export default function PlatformSignupNotice() {
  return (
    <div data-testid="platform-signup-notice">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Sign up on a site
      </Typography>
      <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
        Accounts belong to a site. Open a site and register there, or create a
        site of your own and become its Administrator.
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button component={Link} href="/#sites" variant="outlined">
          Browse sites
        </Button>
        <Button component={Link} href="/create-site" variant="contained">
          Create a site
        </Button>
      </Stack>
    </div>
  )
}
