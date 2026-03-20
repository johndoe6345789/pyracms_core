'use client'

import AuthPageShell
  from '@/components/auth/AuthPageShell'
import RegisterForm
  from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <AuthPageShell>
      <RegisterForm />
    </AuthPageShell>
  )
}
