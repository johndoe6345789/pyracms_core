'use client'

import { Suspense } from 'react'
import AuthPageShell from '@/components/auth/AuthPageShell'
import RegisterForm from '@/components/auth/RegisterForm'
import PlatformSignupNotice from '@/components/auth/PlatformSignupNotice'
import { useAuthParams } from '@/hooks/useAuthParams'

function RegisterContent() {
  const { tenant, redirectTo } = useAuthParams()
  if (!tenant) return <PlatformSignupNotice />
  return <RegisterForm tenant={tenant} redirectTo={redirectTo} />
}

export default function RegisterPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={null}>
        <RegisterContent />
      </Suspense>
    </AuthPageShell>
  )
}
