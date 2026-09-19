'use client'

import { Alert, Button, Typography } from '@mui/material'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import ProfileEditForm from './ProfileEditForm'
import ChangePasswordForm from './ChangePasswordForm'

/** Profile edit + change password for the signed-in user. */
export default function AccountSettings(
  { loginHref }: { loginHref: string },
) {
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
  if (!isAuthenticated || !user) {
    return (
      <Alert severity="info" data-testid="account-signin"
        action={<Button component={Link} href={loginHref}>Sign in</Button>}>
        Sign in to manage your account.
      </Alert>
    )
  }
  return (
    <div data-testid="account-settings">
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
        Account settings
      </Typography>
      <ProfileEditForm userId={user.id} />
      <ChangePasswordForm userId={user.id} />
    </div>
  )
}
