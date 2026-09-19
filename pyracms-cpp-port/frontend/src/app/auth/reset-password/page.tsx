'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthPageShell from '@/components/auth/AuthPageShell'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

function Content() {
  const token = useSearchParams().get('token') || ''
  return <ResetPasswordForm token={token} />
}

export default function ResetPasswordPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={null}><Content /></Suspense>
    </AuthPageShell>
  )
}
