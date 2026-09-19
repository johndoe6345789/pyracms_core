'use client'

import { Alert } from '@mui/material'
import Link from 'next/link'

interface Props {
  tenant: string
  /** Where "platform account" should lead (login or register page) */
  platformHref: string
}

/**
 * Explains that accounts are per-site so a visitor knows which
 * "richard" they are signing in as.
 */
export default function AuthScopeNotice({ tenant, platformHref }: Props) {
  return (
    <Alert
      severity="info"
      icon={false}
      sx={{ mb: 3, borderRadius: 2 }}
      data-testid="auth-scope-notice"
    >
      Account for site <strong>{tenant}</strong>. Accounts are separate on every
      site.{' '}
      <Link href={platformHref} data-testid="platform-account-link">
        Use a platform account instead
      </Link>
    </Alert>
  )
}
