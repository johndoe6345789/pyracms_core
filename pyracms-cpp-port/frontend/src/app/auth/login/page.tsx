'use client'

import { Suspense } from 'react'
import AuthPageShell
  from '@/components/auth/AuthPageShell'
import LoginForm from '@/components/auth/LoginForm'
import OAuthButtons from '@/components/auth/OAuthButtons'
import { useAuthParams } from '@/hooks/useAuthParams'

function LoginContent() {
  const { tenant, redirectTo } = useAuthParams()
  return (
    <>
      <LoginForm tenant={tenant} redirectTo={redirectTo} />
      {!tenant && <OAuthButtons redirectTo={redirectTo} />}
    </>
  )
}

export default function LoginPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={null}>
        <LoginContent />
      </Suspense>
    </AuthPageShell>
  )
}
