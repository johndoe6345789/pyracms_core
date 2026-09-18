'use client'

import { Suspense } from 'react'
import AuthPageShell
  from '@/components/auth/AuthPageShell'
import RegisterForm
  from '@/components/auth/RegisterForm'
import { useAuthParams } from '@/hooks/useAuthParams'

function RegisterContent() {
  const { tenant, redirectTo } = useAuthParams()
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
