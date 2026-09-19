'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthPageShell from '@/components/auth/AuthPageShell'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { useAuthParams } from '@/hooks/useAuthParams'

function Content() {
  const token = useSearchParams().get('token') || ''
  const { tenant } = useAuthParams()
  return <ResetPasswordForm token={token} tenant={tenant} />
}

export default function ResetPasswordPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={null}><Content /></Suspense>
    </AuthPageShell>
  )
}
