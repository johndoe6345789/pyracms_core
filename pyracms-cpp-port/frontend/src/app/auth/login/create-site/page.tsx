'use client'

import AuthPageShell
  from '@/components/auth/AuthPageShell'
import LoginForm from '@/components/auth/LoginForm'

/** Login page that redirects to /create-site on success. */
export default function LoginCreateSitePage() {
  return (
    <AuthPageShell>
      <LoginForm redirectTo="/create-site" />
    </AuthPageShell>
  )
}
