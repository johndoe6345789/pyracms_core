'use client'

import { Suspense } from 'react'
import AuthPageShell from '@/components/auth/AuthPageShell'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { useAuthParams } from '@/hooks/useAuthParams'

function Content() {
  const { tenant } = useAuthParams()
  return <ForgotPasswordForm tenant={tenant} />
}

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={null}>
        <Content />
      </Suspense>
    </AuthPageShell>
  )
}
