'use client'

import AuthPageShell
  from '@/components/auth/AuthPageShell'
import RegisterForm
  from '@/components/auth/RegisterForm'

/** Register page that redirects to /create-site on success. */
export default function RegisterCreateSitePage() {
  return (
    <AuthPageShell>
      <RegisterForm redirectTo="/create-site" />
    </AuthPageShell>
  )
}
